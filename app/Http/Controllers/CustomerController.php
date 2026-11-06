<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\InventoryService;
use App\Services\OrderReservationService;
use App\Services\SequenceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
        private readonly OrderReservationService $reservations,
    ) {}

    public function showCheckout(): Response
    {
        return Inertia::render('customers/Checkout');
    }

    public function orders(): Response
    {
        return Inertia::render('customers/Orders');
    }

    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:medicines,id',
            'items.*.qty' => 'required|integer|min:1',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string|max:500',
            'payment_method' => 'required|string|max:50',
            'transaction_id' => 'nullable|string|max:255',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $lines = collect($validated['items'])
                    ->groupBy('id')
                    ->map(fn ($rows) => [
                        'id' => (int) $rows->first()['id'],
                        'qty' => (int) $rows->sum('qty'),
                    ])
                    ->sortBy('id')
                    ->values();

                $total = 0.0;
                $resolved = [];

                foreach ($lines as $line) {
                    // Lock the medicine so two checkouts cannot pass the same stock check.
                    $medicine = Medicine::query()->lockForUpdate()->findOrFail($line['id']);

                    if ($medicine->status === 'not_available') {
                        throw ValidationException::withMessages([
                            'items' => "{$medicine->name} is not available.",
                        ]);
                    }

                    $available = $this->inventory->availableQuantity($medicine);

                    if ($line['qty'] > $available) {
                        throw new InsufficientStockException($medicine->name, $line['qty'], $available);
                    }

                    // Prices always come from the database, never from the cart.
                    $total += $line['qty'] * (float) $medicine->selling_price;

                    $resolved[] = [$medicine, $line['qty']];
                }

                $order = Order::create([
                    'customer_id' => auth('customer')->id(),
                    'order_no' => $this->sequences->orderNumber(),
                    'total' => round($total, 2),
                    'status' => 'pending',
                    'reserved_at' => now(),
                    'reservation_expires_at' => $this->reservations->expiryFromNow(),
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'payment_method' => $validated['payment_method'],
                    'transaction_id' => $validated['transaction_id'] ?? null,
                ]);

                foreach ($resolved as [$medicine, $qty]) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'medicine_id' => $medicine->id,
                        'qty' => $qty,
                        'price' => $medicine->selling_price,
                    ]);
                }

                // Hold the stock now so another customer cannot buy it while
                // this order waits for approval.
                $this->reservations->reserveMissing(
                    $order,
                    auth('customer')->id(),
                    'Online checkout reservation',
                );

                return $order;
            });
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['items' => $e->getMessage()]);
        }

        $hours = max(1, (int) config('orders.reservation_hours', 24));

        return back()->with('message', "Order placed successfully. We are holding your items for {$hours} hours pending approval.");
    }

    public function myOrders(): Response
    {
        $orders = Order::where('customer_id', auth('customer')->id())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at->format('d-m-Y H:i'),
                'reservation_expires_at' => $order->reservation_expires_at?->toIso8601String(),
                'cancellation_reason' => $order->cancellation_reason,
            ]);

        return Inertia::render('customers/MyOrders', ['orders' => $orders]);
    }

    public function myOrderItems(int $orderId): Response
    {
        $order = Order::where('customer_id', auth('customer')->id())->findOrFail($orderId);

        $items = $order->items()->with('medicine')->get()->map(fn ($item) => [
            'id' => $item->id,
            'medicine_name' => $item->medicine->name ?? '',
            'qty' => $item->qty,
            'price' => $item->price,
        ]);

        return Inertia::render('customers/MyOrderItems', [
            'order' => [
                'order_no' => $order->order_no,
                'status' => $order->status,
                'total' => $order->total,
                'created_at' => $order->created_at->format('d-m-Y H:i'),
                'reservation_expires_at' => $order->reservation_expires_at?->toIso8601String(),
                'cancellation_reason' => $order->cancellation_reason,
            ],
            'items' => $items,
        ]);
    }
}
