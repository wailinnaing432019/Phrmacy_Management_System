<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Http\Requests\CustomerOrder\CheckoutRequest;
use App\Services\CustomerOrder\CustomerOrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerOrderController extends Controller
{
    public function __construct(
        private readonly CustomerOrderService $customerOrderService,
    ) {}

    /**
     * Show customer checkout page.
     */
    public function showCheckout(): Response
    {
        return Inertia::render('customers/Checkout');
    }

    /**
     * Process customer checkout submission.
     */
    public function checkout(CheckoutRequest $request): RedirectResponse
    {
        $customerId = (int) auth('customer')->id();

        try {
            $this->customerOrderService->checkout($customerId, $request->validated());
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['items' => $e->getMessage()]);
        }

        $hours = max(1, (int) config('orders.reservation_hours', 24));

        return back()->with('message', "Order placed successfully. We are holding your items for {$hours} hours pending approval.");
    }

    /**
     * Customer orders list.
     */
    public function myOrders(): Response
    {
        $customerId = (int) auth('customer')->id();
        $orders = $this->customerOrderService->getCustomerOrders($customerId);

        return Inertia::render('customers/MyOrders', ['orders' => $orders]);
    }

    /**
     * Single customer order detail and items.
     */
    public function myOrderItems(int $order): Response
    {
        $customerId = (int) auth('customer')->id();
        $data = $this->customerOrderService->getCustomerOrderDetails($customerId, $order);

        return Inertia::render('customers/MyOrderItems', $data);
    }

    /**
     * Legacy customer orders page view.
     */
    public function orders(): Response
    {
        return Inertia::render('customers/Orders');
    }
}
