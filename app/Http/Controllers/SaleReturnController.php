<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\StockMovement;
use App\Services\InventoryService;
use App\Services\SequenceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SaleReturnController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
    ) {}

    public function index(Request $request)
    {
        $returns = SaleReturn::query()
            ->with(['sale:id,invoice_no,total', 'processor:id,name'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('return_no', 'like', "%{$search}%")
                        ->orWhereHas('sale', fn ($sale) => $sale->where('invoice_no', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('returns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Sale $sale)
    {
        $sale->load(['items.medicine', 'user']);

        return Inertia::render('returns/Create', [
            'sale' => $this->salePayload($sale),
        ]);
    }

    public function store(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|integer|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:0',
            'items.*.restock' => 'boolean',
            'refund_method' => 'required|in:cash,card,transfer,other',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $requested = collect($validated['items'])
            ->filter(fn ($line) => (int) $line['quantity'] > 0)
            ->values();

        if ($requested->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Select at least one item and quantity to return.',
            ]);
        }

        $saleReturn = DB::transaction(function () use ($sale, $validated, $requested) {
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

        return redirect()
            ->route('returns.show', $saleReturn)
            ->with('success', 'Return processed successfully.');
    }

    public function show(SaleReturn $saleReturn)
    {
        $saleReturn->load(['sale.user', 'items.medicine', 'processor']);

        return Inertia::render('returns/Show', [
            'saleReturn' => [
                'id' => $saleReturn->id,
                'return_no' => $saleReturn->return_no,
                'total' => (float) $saleReturn->total,
                'refund_method' => $saleReturn->refund_method,
                'reason' => $saleReturn->reason,
                'notes' => $saleReturn->notes,
                'created_at' => $saleReturn->created_at->format('d-m-Y H:i'),
                'processed_by' => $saleReturn->processor->name ?? 'N/A',
                'sale' => [
                    'id' => $saleReturn->sale->id,
                    'invoice_no' => $saleReturn->sale->invoice_no,
                    'total' => (float) $saleReturn->sale->total,
                    'refunded_total' => (float) $saleReturn->sale->refunded_total,
                ],
                'items' => $saleReturn->items->map(fn ($item) => [
                    'id' => $item->id,
                    'medicine_name' => $item->medicine->name ?? 'Unknown',
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                    'restocked' => (bool) $item->restocked,
                ]),
            ],
        ]);
    }

    public function pdf(SaleReturn $saleReturn)
    {
        $saleReturn->load(['sale.user', 'items.medicine', 'processor']);

        $pdf = Pdf::loadView('returns.pdf', ['return' => $saleReturn])
            ->setPaper('A4', 'portrait');

        return $pdf->stream("{$saleReturn->return_no}.pdf");
    }

    /**
     * @return array<string, mixed>
     */
    protected function salePayload(Sale $sale): array
    {
        return [
            'id' => $sale->id,
            'invoice_no' => $sale->invoice_no,
            'total' => (float) $sale->total,
            'refunded_total' => (float) $sale->refunded_total,
            'sale_by' => $sale->user->name ?? 'N/A',
            'created_at' => $sale->created_at->format('d-m-Y H:i'),
            'items' => $sale->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
                'returned_qty' => $item->returned_qty,
                'returnable_qty' => $item->quantity - $item->returned_qty,
                'can_restock' => $item->purchased_item_id !== null,
            ]),
        ];
    }
}
