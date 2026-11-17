<?php

namespace App\Repositories\CustomerOrder;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Collection;

class CustomerOrderRepository implements CustomerOrderRepositoryInterface
{
    /**
     * {@inheritDoc}
     */
    public function getOrdersForCustomer(int $customerId): Collection
    {
        return Order::query()
            ->where('customer_id', $customerId)
            ->with(['items.medicine'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function findOrderForCustomer(int $customerId, int $orderId): Order
    {
        /** @var Order $order */
        $order = Order::query()
            ->where('customer_id', $customerId)
            ->with(['items.medicine'])
            ->findOrFail($orderId);

        return $order;
    }

    /**
     * {@inheritDoc}
     */
    public function lockMedicineForUpdate(int $id): Medicine
    {
        /** @var Medicine $medicine */
        $medicine = Medicine::query()
            ->lockForUpdate()
            ->findOrFail($id);

        return $medicine;
    }

    /**
     * {@inheritDoc}
     */
    public function createOrder(array $attributes): Order
    {
        return Order::create($attributes);
    }

    /**
     * {@inheritDoc}
     */
    public function createOrderItem(array $attributes): OrderItem
    {
        return OrderItem::create($attributes);
    }
}
