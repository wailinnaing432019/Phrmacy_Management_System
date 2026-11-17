<?php

namespace App\Services\SaleReturn;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\StockMovement;
use App\Repositories\SaleReturn\SaleReturnRepositoryInterface;
use App\Services\InventoryService;
use App\Services\SequenceService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleReturnService
{
    public function __construct(
        private readonly SaleReturnRepositoryInterface $saleReturns,
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
    ) {}

    public function paginate(?string $search): LengthAwarePaginator
    {
        return $this->saleReturns->paginateFiltered($search);
    }

    /**
     * Load a sale with the lines and remaining returnable quantities.
     */
    public function findSaleForReturn(int $saleId): Sale
    {
        /** @var Sale $sale */
        $sale = Sale::query()
            ->with(['items.medicine', 'user'])
            ->findOrFail($saleId);

        return $sale;
    }

    /**
     * Process a return, restocking sellable lines into their original batches.
     *
     * @param  array<string, mixed>  $validated
     */
    public function process(Sale $sale, array $validated): SaleReturn
    {
        $requested = collect($validated['items'])
            ->filter(fn ($line) => (int) $line['quantity'] > 0)
            ->values();

        if ($requested->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Select at least one item and quantity to return.',
            ]);
        }

        return DB::transaction(function () use ($sale, $validated, $requested) {
            $sale = Sale::query()->lockForUpdate()->findOrFail($sale->id);
            $saleItems = SaleItem::query()
                ->where('sale_id', $sale->id)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $saleReturn = SaleReturn::create([
                'sale_id' => $sale->id,
                'return_no' => $this->sequences->returnNumber(),
                'processed_by' => auth()->id(),
                'total' => 0,
                'refund_method' => $validated['refund_method'],
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $total = 0.0;

            foreach ($requested as $line) {
                $item = $saleItems->get($line['sale_item_id']);

                if (! $item) {
                    throw ValidationException::withMessages([
                        'items' => 'One of the selected lines does not belong to this sale.',
                    ]);
                }

                $quantity = (int) $line['quantity'];
                $remaining = $item->quantity - $item->returned_qty;

                if ($quantity > $remaining) {
                    throw ValidationException::withMessages([
                        'items' => "Cannot return {$quantity} of {$item->medicine->name}; only {$remaining} remain.",
                    ]);
                }

                // Refunds always use the price recorded on the original sale.
                $subtotal = round($quantity * (float) $item->unit_price, 2);
                $restock = (bool) ($line['restock'] ?? true) && $item->purchased_item_id !== null;

                SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'sale_item_id' => $item->id,
                    'medicine_id' => $item->medicine_id,
                    'purchased_item_id' => $item->purchased_item_id,
                    'quantity' => $quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $subtotal,
                    'restocked' => $restock,
                ]);

                $item->returned_qty += $quantity;
                $item->save();

                if ($restock) {
                    $medicine = Medicine::query()->lockForUpdate()->findOrFail($item->medicine_id);

                    $this->inventory->restore(
                        $medicine,
                        [[
                            'purchased_item_id' => $item->purchased_item_id,
                            'quantity' => $quantity,
                        ]],
                        StockMovement::TYPE_SALE_RETURNED,
                        $saleReturn,
                        auth()->id(),
                        "Return {$saleReturn->return_no}",
                    );
                }

                $total += $subtotal;
            }

            $saleReturn->update(['total' => $total]);
            $sale->increment('refunded_total', $total);

            return $saleReturn;
        });
    }

    public function findForShow(int $id): SaleReturn
    {
        return $this->saleReturns->findWithRelations($id);
    }
}
