<?php

namespace App\Services\Order;

use App\Exceptions\InsufficientStockException;
use App\Mail\OrderInvoiceMail;
use App\Models\Order;
use App\Models\StockMovement;
use App\Repositories\Order\OrderRepositoryInterface;
use App\Services\OrderReservationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderReservationService $reservations,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->orders->paginateFiltered($filters);
    }

    public function findForShow(int $id): Order
    {
        return $this->orders->findWithItemsAndCustomer($id);
    }

    /**
     * Change an order status while keeping stock reservations consistent.
     *
     * @throws InsufficientStockException
     */
    public function updateStatus(Order $order, string $newStatus): Order
    {
        $changedToCompleted = false;

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

        return $freshOrder;
    }
}
