<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Mail\OrderInvoiceMail;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\StockMovement;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['items.medicine'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhere('phone', 'like', "%$search%");
                });
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->when($request->date, function ($q, $date) {
                $q->whereDate('created_at', $date);
            });

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return inertia('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['items.medicine', 'user']);

        return Inertia::render('orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'customer' => $order->user->name ?? $order->name,
                'email' => $order->email,
                'phone' => $order->phone,
                'address' => $order->address,
                'total' => $order->total,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at->format('d-m-Y H:i'),
                'items' => $order->items->map(fn ($item) => [
                    'medicine_name' => $item->medicine->name ?? 'Unknown',
                    'qty' => $item->qty,
                    'price' => $item->price,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
        ]);

        $newStatus = $validated['status'];

        try {
            DB::transaction(function () use ($order, $newStatus) {
                $order = Order::query()->lockForUpdate()->findOrFail($order->id);
                $oldStatus = $order->status;

                // Moving INTO completed: take stock out of the batches.
                if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                    $order->load('items');

                    foreach ($order->items as $item) {
                        $medicine = Medicine::query()->lockForUpdate()->findOrFail($item->medicine_id);

                        $allocations = $this->inventory->deduct(
                            $medicine,
                            $item->qty,
                            StockMovement::TYPE_ORDER,
                            $order,
                            auth()->id(),
                        );

                        foreach ($allocations as $allocation) {
                            $item->orderItemStock()->create($allocation);
                        }
                    }
                }

                // Moving OUT of completed: put stock back where it came from.
                if ($oldStatus === 'completed' && $newStatus !== 'completed') {
                    $order->load('items.orderItemStock');

                    foreach ($order->items as $item) {
                        $allocations = $item->orderItemStock
                            ->map(fn ($stock) => [
                                'purchased_item_id' => $stock->purchased_item_id,
                                'quantity' => $stock->quantity,
                            ])
                            ->all();

                        if ($allocations === []) {
                            continue;
                        }

                        $medicine = Medicine::query()->lockForUpdate()->findOrFail($item->medicine_id);

                        $this->inventory->restore(
                            $medicine,
                            $allocations,
                            StockMovement::TYPE_ORDER_CANCELLED,
                            $order,
                            auth()->id(),
                        );

                        $item->orderItemStock()->delete();
                    }
                }

                $order->update(['status' => $newStatus]);
            });
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
        }

        $freshOrder = $order->fresh(['items.medicine']);

        if (! empty($freshOrder->email) && $newStatus === 'completed') {
            try {
                Mail::to($freshOrder->email)->send(new OrderInvoiceMail($freshOrder));
            } catch (\Throwable $e) {
                // The status change is already committed; a mail outage must
                // never turn a successful stock update into a failed request.
                report($e);
            }
        }

        return back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
