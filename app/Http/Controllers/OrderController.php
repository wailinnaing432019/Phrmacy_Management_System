<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Http\Resources\Order\OrderListResource;
use App\Http\Resources\Order\OrderShowResource;
use App\Models\Order;
use App\Services\Order\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $orders = $this->orders->paginate($request->only(['search', 'status', 'date']))
            ->withQueryString()
            ->through(fn (Order $order) => (new OrderListResource($order))->resolve());

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
        $order = $this->orders->findForShow($order->id);

        return Inertia::render('orders/Show', [
            'order' => (new OrderShowResource($order))->resolve(),
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

        try {
            $this->orders->updateStatus($order, $validated['status']);
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
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
