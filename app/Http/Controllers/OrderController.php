<?php

namespace App\Http\Controllers;

use App\Mail\OrderInvoiceMail;
use App\Mail\OrderStatusUpdated;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\PurchasedItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OrderController extends Controller
{
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
            'items' => $order->items->map(fn($item) => [
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'qty' => $item->qty,
                'price' => $item->price,
            ]),
        ]
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
    $request->validate([
        'status' => 'required|in:pending,completed,cancelled',
    ]);

    $newStatus = $request->status;
    $oldStatus = $order->status;

    DB::beginTransaction();

    try {
        // 1️⃣ Deduct stock if changing TO completed
        if ($newStatus === 'completed' && $oldStatus !== 'completed') {
            foreach ($order->items as $item) {
                $medicine = Medicine::with(['purchasedItems' => function ($q) {
                    $q->orderByRaw('CASE WHEN exp_date IS NULL THEN 1 ELSE 0 END, exp_date ASC');
                }])->findOrFail($item->medicine_id);

                $neededQty = $item->qty;

                foreach ($medicine->purchasedItems as $batch) {
                    if ($neededQty <= 0) break;

                    if (!is_null($batch->exp_date) && $batch->exp_date < now()->toDateString()) continue;

                    $available = $batch->qty - $batch->sold_qty;
                    if ($available <= 0) continue;

                    $deduct = min($neededQty, $available);
                    $batch->increment('sold_qty', $deduct);

                    $neededQty -= $deduct;

                    // Record which batch was used for restoration
                    $item->orderItemStock()->create([
                        'purchased_item_id' => $batch->id,
                        'quantity' => $deduct,
                    ]);
                }

                if ($neededQty > 0) {
                    throw new \Exception("Insufficient stock for {$medicine->name}");
                }
            }
        }

        // 2️⃣ Restore stock if changing FROM completed to pending/cancelled
        if ($oldStatus === 'completed' && $newStatus !== 'completed') {
            foreach ($order->items as $item) {
                foreach ($item->orderItemStock as $stock) {
                    $batch = PurchasedItem::find($stock->purchased_item_id);
                    if ($batch) {
                        $batch->decrement('sold_qty', $stock->quantity);
                    }
                }
                $item->orderItemStock()->delete();
            }
        }

        // 3️⃣ Update order status
        $order->update(['status' => $newStatus]);

        DB::commit();
                // fresh to ensure we email the latest status & items
        $freshOrder = $order->fresh(['items.medicine']);
        if (!empty($freshOrder->email) && $newStatus === 'completed') {
             Mail::to($order->email)->send(new OrderInvoiceMail($order));
            // Mail::to($freshOrder->email)->send(new OrderStatusUpdated($freshOrder));
        }
        return back()->with('success', 'Order status updated successfully.');

    } catch (\Exception $e) {
        DB::rollBack();
        DB::afterCommit(function () use ($order) {
        // fresh to ensure we email the latest status & items
        $freshOrder = $order->fresh(['items.medicine']);
        if (!empty($freshOrder->email)) {
            //  Mail::to($order->email)->send(new OrderInvoiceMail($order));
            // Mail::to($freshOrder->email)->send(new OrderStatusUpdated($freshOrder));
        }
});
        return back()->with('error', 'Order status updated Failed.'.$e->getMessage()); 
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
