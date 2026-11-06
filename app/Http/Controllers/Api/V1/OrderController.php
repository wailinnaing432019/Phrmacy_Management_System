<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerOrder\CheckoutRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Repositories\CustomerOrder\CustomerOrderRepositoryInterface;
use App\Services\CustomerOrder\CustomerOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(
        private readonly CustomerOrderService $customerOrderService,
        private readonly CustomerOrderRepositoryInterface $customerOrderRepository,
    ) {}

    /**
     * List all orders for the authenticated customer.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $customerId = (int) auth('customer')->id();
        $orders = $this->customerOrderRepository->getOrdersForCustomer($customerId);

        return OrderResource::collection($orders);
    }

    /**
     * Show details of a specific order for the authenticated customer.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $customerId = (int) auth('customer')->id();
        $order = $this->customerOrderRepository->findOrderForCustomer($customerId, $id);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Place a new order via API.
     */
    public function store(CheckoutRequest $request): JsonResponse
    {
        $customerId = (int) auth('customer')->id();

        try {
            $order = $this->customerOrderService->checkout($customerId, $request->validated());
        } catch (InsufficientStockException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['items' => [$e->getMessage()]],
            ], 422);
        }

        $order->loadMissing('items.medicine');

        return response()->json([
            'message' => 'Order placed successfully',
            'data' => new OrderResource($order),
        ], 201);
    }
}
