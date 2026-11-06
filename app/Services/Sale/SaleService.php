<?php

namespace App\Services\Sale;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Repositories\Order\OrderRepositoryInterface;
use App\Repositories\Sale\SaleRepositoryInterface;
use App\Services\InventoryService;
use App\Services\SequenceService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function __construct(
        private readonly SaleRepositoryInterface $sales,
        private readonly OrderRepositoryInterface $orders,
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
    ) {}

    /**
     * Sales report rows for the shop or online source.
     *
     * @param  array<string, mixed>  $filters
     */
    public function report(string $source, array $filters): LengthAwarePaginator
    {
        $paginator = $source === 'online'
            ? $this->orders->paginateForReport($filters)
            : $this->sales->paginateForReport($filters);

        return $paginator->appends($filters);
    }

    /**
     * Rows used by the PDF/CSV export.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportData(string $source, array $filters): Collection
    {
        return $source === 'online'
            ? $this->orders->exportQuery($filters)
            : $this->sales->exportQuery($filters);
    }

    /**
     * Complete a point-of-sale sale, deducting stock FEFO.
     *
     * @param  array<string, mixed>  $validated
     */
    public function complete(array $validated): Sale
    {
        return DB::transaction(function () use ($validated) {
            // A cart may contain the same medicine twice; sell it as one line.
            $lines = collect($validated['cart'])
                ->groupBy('id')
                ->map(fn ($rows) => [
                    'id' => (int) $rows->first()['id'],
                    'quantity' => (int) $rows->sum('quantity'),
                ])
                ->values();

            $sale = Sale::create([
                'invoice_no' => $this->sequences->invoiceNumber(),
                'total' => 0,
                'sale_by' => auth()->id(),
                'received_amount' => $validated['received'],
                'refund_amount' => 0,
            ]);

            $total = 0.0;

            foreach ($lines as $line) {
                $medicine = Medicine::query()->lockForUpdate()->findOrFail($line['id']);

                if ($medicine->status === 'not_available') {
                    throw ValidationException::withMessages([
                        'cart' => "{$medicine->name} is not available for sale.",
                    ]);
                }

                // Prices always come from the database, never from the request.
                $allocations = $this->inventory->deduct(
                    $medicine,
                    $line['quantity'],
                    StockMovement::TYPE_SALE,
                    $sale,
                    auth()->id(),
                );

                foreach ($allocations as $allocation) {
                    $subtotal = round($allocation['quantity'] * (float) $medicine->selling_price, 2);

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'medicine_id' => $medicine->id,
                        'purchased_item_id' => $allocation['purchased_item_id'],
                        'quantity' => $allocation['quantity'],
                        'unit_price' => $medicine->selling_price,
                        'subtotal' => $subtotal,
                    ]);

                    $total += $subtotal;
                }
            }

            $received = round((float) $validated['received'], 2);

            if ($received < $total) {
                throw ValidationException::withMessages([
                    'received' => "Received amount ({$received}) is less than the total ({$total}).",
                ]);
            }

            $sale->update([
                'total' => $total,
                'refund_amount' => round($received - $total, 2),
            ]);

            return $sale;
        });
    }

    /**
     * Load a shop sale or online order for the detail page.
     */
    public function findForShow(string $source, int $id): Sale|Order
    {
        return $source === 'online'
            ? $this->orders->findWithItemsAndCustomer($id)
            : $this->sales->findWithItems($id);
    }

    /**
     * Today's sales for one cashier.
     *
     * @param  array<string, mixed>  $filters
     */
    public function cashierSales(int $userId, array $filters): LengthAwarePaginator
    {
        return $this->sales->paginateForCashier($userId, $filters)->appends($filters);
    }

    public function findForCashier(int $id): Sale
    {
        return $this->sales->findWithItems($id);
    }
}
