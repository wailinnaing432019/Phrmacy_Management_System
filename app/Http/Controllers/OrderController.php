<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Mail\OrderInvoiceMail;
use App\Models\Order;
use App\Models\StockMovement;
use App\Services\OrderReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderReservationService $reservations,
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
        $changedToCompleted = false;

        try {
            DB::transaction(function () use ($order, $newStatus, &$changedToCompleted) {
                $order = Order::query()->lockForUpdate()->findOrFail($order->id);
                $oldStatus = $order->status;

                if ($oldStatus === $newStatus) {
                    return;
                }

                if ($newStatus === 'cancelled') {
                    $this->reservations->release(
                        $order,
                        StockMovement::TYPE_ORDER_CANCELLED,
                        auth()->id(),
                        'Order cancelled',
                    );

                    $order->update([
                        'status' => 'cancelled',
                        'cancelled_at' => now(),
                        'cancellation_reason' => 'manual',
                        'reservation_expires_at' => null,
                    ]);

                    return;
                }

                // Pending and completed orders both keep stock held. Completing
                // a legacy pending order, or reopening a cancelled one, reserves
                // whatever is still missing.
                $this->reservations->reserveMissing(
                    $order,
                    auth()->id(),
                    $oldStatus === 'cancelled' ? 'Order reopened and reserved' : 'Order stock reserved',
                );

                $order->update([
                    'status' => $newStatus,
                    'reserved_at' => ($oldStatus === 'cancelled' || $order->reserved_at === null)
                        ? now()
                        : $order->reserved_at,
                    'reservation_expires_at' => $newStatus === 'pending'
                        ? $this->reservations->expiryFromNow()
                        : null,
                    'cancelled_at' => null,
                    'cancellation_reason' => null,
                ]);

                if ($newStatus === 'completed') {
                    $changedToCompleted = true;
                }
            });
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
        }

        $freshOrder = $order->fresh(['items.medicine']);

        if ($changedToCompleted && ! empty($freshOrder->email)) {
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
