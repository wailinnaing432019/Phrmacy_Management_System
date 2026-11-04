<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderReservationService
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    /**
     * When a new online order's stock hold ends.
     */
    public function expiryFromNow(): Carbon
    {
        $hours = max(1, (int) config('orders.reservation_hours', 24));

        return now()->addHours($hours);
    }

    /**
     * Reserve any order quantity that has not already been allocated.
     *
     * Safe to call for legacy pending orders (no allocations) and for orders
     * being reopened after cancellation. The caller must hold a transaction
     * and a row lock on the order.
     */
    public function reserveMissing(Order $order, ?int $userId = null, string $note = 'Online order reservation'): void
    {
        foreach ($order->items()->get() as $item) {
            $reserved = (int) $item->orderItemStock()->sum('quantity');
            $missing = (int) $item->qty - $reserved;

            if ($missing <= 0) {
                continue;
            }

            $medicine = Medicine::query()->lockForUpdate()->findOrFail($item->medicine_id);

            $allocations = $this->inventory->deduct(
                $medicine,
                $missing,
                StockMovement::TYPE_ORDER_RESERVED,
                $order,
                $userId,
                $note,
            );

            $item->orderItemStock()->createMany($allocations);
        }
    }

    /**
     * Return every allocated batch for this order and clear its allocations.
     *
     * The caller must hold a transaction and a row lock on the order.
     */
    public function release(Order $order, string $movementType, ?int $userId = null, ?string $note = null): void
    {
        foreach ($order->items()->with('orderItemStock')->get() as $item) {
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
                $movementType,
                $order,
                $userId,
                $note,
            );

            $item->orderItemStock()->delete();
        }
    }

    /**
     * Cancel pending orders whose hold has expired and return their stock.
     *
     * @return int Number of orders expired.
     */
    public function expirePending(): int
    {
        $expired = 0;

        Order::query()
            ->where('status', 'pending')
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<=', now())
            ->select('id')
            ->chunkById(100, function ($orders) use (&$expired) {
                foreach ($orders as $candidate) {
                    $didExpire = DB::transaction(function () use ($candidate) {
                        $order = Order::query()->lockForUpdate()->find($candidate->id);

                        if (! $order || $order->status !== 'pending' || ! $order->reservation_expires_at) {
                            return false;
                        }

                        if ($order->reservation_expires_at->isFuture()) {
                            return false;
                        }

                        $this->release(
                            $order,
                            StockMovement::TYPE_ORDER_EXPIRED,
                            null,
                            'Reservation expired',
                        );

                        $order->update([
                            'status' => 'cancelled',
                            'cancelled_at' => now(),
                            'cancellation_reason' => 'expired',
                            'reservation_expires_at' => null,
                        ]);

                        return true;
                    });

                    if ($didExpire) {
                        $expired++;
                    }
                }
            });

        return $expired;
    }
}
