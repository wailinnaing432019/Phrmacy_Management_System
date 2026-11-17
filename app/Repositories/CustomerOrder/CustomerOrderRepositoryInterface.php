<?php

namespace App\Repositories\CustomerOrder;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Collection;

interface CustomerOrderRepositoryInterface
{
    /**
     * Get all orders placed by the customer, ordered by newest first.
     *
     * @return Collection<int, Order>
     */
    public function getOrdersForCustomer(int $customerId): Collection;

    /**
     * Find a specific order owned by the customer, including items and medicines.
     */
    public function findOrderForCustomer(int $customerId, int $orderId): Order;

    /**
     * Lock a medicine row for update during checkout.
     */
    public function lockMedicineForUpdate(int $id): Medicine;

    /**
     * Create an order record.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function createOrder(array $attributes): Order;

    /**
     * Create an order item line.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function createOrderItem(array $attributes): OrderItem;
}
