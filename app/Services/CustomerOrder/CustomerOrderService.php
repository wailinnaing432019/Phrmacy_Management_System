<?php

namespace App\Services\CustomerOrder;

use App\Exceptions\InsufficientStockException;
use App\Http\Resources\CustomerOrder\CustomerOrderDetailResource;
use App\Http\Resources\CustomerOrder\CustomerOrderItemResource;
use App\Http\Resources\CustomerOrder\CustomerOrderListResource;
use App\Models\Order;
use App\Repositories\CustomerOrder\CustomerOrderRepositoryInterface;
use App\Services\InventoryService;
use App\Services\OrderReservationService;
use App\Services\SequenceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerOrderService
{
    public function __construct(
        private readonly CustomerOrderRepositoryInterface $customerOrderRepository,
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
        private readonly OrderReservationService $reservations,
    ) {}

    /**
     * Process online customer checkout in a single database transaction.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws InsufficientStockException|ValidationException
     */
    public function checkout(int $customerId, array $data): Order
    {
        return DB::transaction(function () use ($customerId, $data) {
            $lines = collect($data['items'])
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
                // Lock the medicine row so concurrent checkouts cannot over-allocate.
                $medicine = $this->customerOrderRepository->lockMedicineForUpdate($line['id']);

                if ($medicine->status === 'not_available') {
                    throw ValidationException::withMessages([
                        'items' => "{$medicine->name} is not available.",
                    ]);
                }

                $available = $this->inventory->availableQuantity($medicine);

                if ($line['qty'] > $available) {
                    throw new InsufficientStockException($medicine->name, $line['qty'], $available);
                }

                // Prices always come from the database.
                $total += $line['qty'] * (float) $medicine->selling_price;
                $resolved[] = [$medicine, $line['qty']];
            }

            $order = $this->customerOrderRepository->createOrder([
                'customer_id' => $customerId,
                'order_no' => $this->sequences->orderNumber(),
                'total' => round($total, 2),
                'status' => 'pending',
                'reserved_at' => now(),
                'reservation_expires_at' => $this->reservations->expiryFromNow(),
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'payment_method' => $data['payment_method'],
                'transaction_id' => $data['transaction_id'] ?? null,
            ]);

            foreach ($resolved as [$medicine, $qty]) {
                $this->customerOrderRepository->createOrderItem([
                    'order_id' => $order->id,
                    'medicine_id' => $medicine->id,
                    'qty' => $qty,
                    'price' => $medicine->selling_price,
                ]);
            }

            // Hold stock now pending admin approval.
            $this->reservations->reserveMissing(
                $order,
                $customerId,
                'Online checkout reservation',
            );

            return $order;
        });
    }

    /**
     * Get order list array for a customer.
     *
     * @return array<int, mixed>
     */
    public function getCustomerOrders(int $customerId): array
    {
        $orders = $this->customerOrderRepository->getOrdersForCustomer($customerId);

        return CustomerOrderListResource::collection($orders)->resolve();
    }

    /**
     * Get single order detail payload for a customer.
     *
     * @return array{order: array<string, mixed>, items: array<int, mixed>}
     */
    public function getCustomerOrderDetails(int $customerId, int $orderId): array
    {
        $order = $this->customerOrderRepository->findOrderForCustomer($customerId, $orderId);

        return [
            'order' => (new CustomerOrderDetailResource($order))->resolve(),
            'items' => CustomerOrderItemResource::collection($order->items)->resolve(),
        ];
    }
}
