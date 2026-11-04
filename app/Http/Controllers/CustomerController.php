<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Mail\ContactConfirmation;
use App\Mail\ContactMessage;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SaleItem;
use App\Services\InventoryService;
use App\Services\SequenceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly SequenceService $sequences,
    ) {}

    public function login()
    {
        return Inertia::render('customers/LoginForm');
    }

    public function register()
    {
        return Inertia::render('customers/Register2');
    }

    public function index(Request $request)
    {
        $query = Medicine::query()->where('status', 'available')->latest();

        // ✅ Search filter
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // ✅ Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // ✅ Get only latest 10 records
        $medicines = $query->with(['category', 'purchasedItems'])
            ->take(12)
            ->get()
            ->map(function ($medicine) {
                $availableQty = $medicine->purchasedItems->sum(fn ($b) => $b->qty - $b->sold_qty);

                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'selling_price' => $medicine->selling_price,
                    'image' => $medicine->image ? asset('storage/'.$medicine->image) : null,
                    'category' => $medicine->category->name ?? '—',
                    'qty' => $availableQty,
                    'stock_limit' => $medicine->stock_limit,
                    'medicine_barcode' => $medicine->medicine_barcode,
                ];
            });

        return Inertia::render('customers/Index', [
            'medicines' => $medicines,
            'filters' => $request->only(['search', 'category_id']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function products(Request $request)
    {
        $query = Medicine::query()->where('status', 'available');
        $limit = 6; // default pagination size

        // ✅ Search filter
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // ✅ Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $isSpecial = false; // check if we need limited query instead of paginate

        // ✅ Sorting / Special filters
        switch ($request->input('sort')) {
            case 'price-low-high':
                $query->orderBy('selling_price', 'asc');
                break;

            case 'price-high-low':
                $query->orderBy('selling_price', 'desc');
                break;

            case 'top-selling':
                $isSpecial = true;

                // --- Get top selling IDs ---
                $topMedicinesOnline = OrderItem::with('medicine')
                    ->whereHas('medicine')
                    ->select('medicine_id', DB::raw('SUM(qty * price) as sales'))
                    ->groupBy('medicine_id');

                $topMedicinesShop = SaleItem::with('medicine')
                    ->whereHas('medicine')
                    ->select('medicine_id', DB::raw('SUM(subtotal) as sales'))
                    ->groupBy('medicine_id');

                $combined = $topMedicinesOnline
                    ->unionAll($topMedicinesShop)
                    ->get()
                    ->groupBy('medicine_id')
                    ->map(function ($items) {
                        $item = $items->first();

                        return [
                            'id' => $item->medicine->id,
                            'sales' => $items->sum('sales'),
                        ];
                    })
                    ->sortByDesc('sales')
                    ->take(9) // ✅ limit top 9
                    ->pluck('id')
                    ->toArray();

                $query->whereIn('id', $combined)
                    ->orderByRaw('FIELD(id, '.implode(',', $combined).')');
                break;

            case 'new-arrivals':
                $isSpecial = true;
                $query->orderBy('created_at', 'desc')->limit(9); // ✅ latest 9
                break;

            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // ✅ Final query
        if ($isSpecial) {
            $medicines = $query->with(['category', 'purchasedItems'])
                ->get()
                ->map(function ($medicine) {
                    $availableQty = $medicine->purchasedItems->sum(fn ($b) => $b->qty - $b->sold_qty);

                    return [
                        'id' => $medicine->id,
                        'name' => $medicine->name,
                        'description' => $medicine->description,
                        'selling_price' => $medicine->selling_price,
                        'image' => $medicine->image ? asset('storage/'.$medicine->image) : null,
                        'category' => $medicine->category->name ?? '—',
                        'qty' => $availableQty,
                        'stock_limit' => $medicine->stock_limit,
                        'medicine_barcode' => $medicine->medicine_barcode,
                    ];
                });

            // Wrap in `data` so frontend works as if paginated
            $medicines = [
                'data' => $medicines,
                'links' => [], // optional: empty for no pagination
                'meta' => [],  // optional: empty meta
            ];
        } else {
            $medicines = $query->with(['category', 'purchasedItems'])
                ->paginate($limit)
                ->withQueryString()
                ->through(function ($medicine) {
                    $availableQty = $medicine->purchasedItems->sum(fn ($b) => $b->qty - $b->sold_qty);

                    return [
                        'id' => $medicine->id,
                        'name' => $medicine->name,
                        'description' => $medicine->description,
                        'selling_price' => $medicine->selling_price,
                        'image' => $medicine->image ? asset('storage/'.$medicine->image) : null,
                        'category' => $medicine->category->name ?? '—',
                        'qty' => $availableQty,
                        'stock_limit' => $medicine->stock_limit,
                        'medicine_barcode' => $medicine->medicine_barcode,
                    ];
                });
        }

        return Inertia::render('customers/Product', [
            'medicines' => $medicines,
            'filters' => $request->only(['search', 'category_id', 'sort']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function product(Medicine $medicine)
    {
        // Calculate available quantity from purchasedItems
        $availableQty = $medicine->purchasedItems->sum(fn ($b) => $b->qty - $b->sold_qty);

        // Get all categories for the filter panel
        $categories = Category::all();

        return Inertia::render('customers/Show', [
            'medicine' => [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'description' => $medicine->description,
                'selling_price' => $medicine->selling_price,
                'qty' => $availableQty, // <-- updated available quantity
                'stock_limit' => $medicine->stock_limit,
                'medicine_barcode' => $medicine->medicine_barcode,
                'category' => $medicine->category->name ?? '—',
                'image' => $medicine->image ? asset('storage/'.$medicine->image) : null,
                'created_at' => Carbon::parse($medicine->created_at)->format('d-m-Y'),
                'updated_at' => Carbon::parse($medicine->updated_at)->format('d-m-Y'),
            ],
            'categories' => $categories,
            'filters' => [
                'category_id' => $medicine->category_id,
            ],
        ]);
    }

    public function home(Request $request)
    {
        $query = Medicine::query()->where('status', 'available');

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $medicines = $query->with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->through(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'selling_price' => $medicine->selling_price,
                    'image' => $medicine->image ? asset('storage/'.$medicine->image) : null,
                    'category' => $medicine->category->name ?? '—',
                    'qty' => $medicine->qty,
                ];
            });

        return Inertia::render('customers/Home', [
            'medicines' => $medicines,
        ]);
    }

    public function cart()
    {
        return Inertia::render('customers/Cart');
    }

    public function showCheckout()
    {

        return Inertia::render('customers/Checkout');
    }

    public function liked()
    {
        return Inertia::render('customers/Liked');
    }

    public function orders()
    {
        return Inertia::render('customers/Orders');
    }

    public function checkout(Request $request)
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
            $order = DB::transaction(function () use ($validated) {
                $lines = collect($validated['items'])
                    ->groupBy('id')
                    ->map(fn ($rows) => [
                        'id' => (int) $rows->first()['id'],
                        'qty' => (int) $rows->sum('qty'),
                    ])
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
                    'user_id' => auth()->id(),
                    'order_no' => $this->sequences->orderNumber(),
                    'total' => round($total, 2),
                    'status' => 'pending',
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

                return $order;
            });
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['items' => $e->getMessage()]);
        }

        return back()->with('message', 'Order placed successfully, waiting for admin approval.');
    }

    public function myOrders()
    {
        $orders = Order::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at->format('d-m-Y H:i'),
            ]);

        return Inertia::render('customers/MyOrders', ['orders' => $orders]);
    }

    public function myOrderItems($orderId)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($orderId);

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
            ],
            'items' => $items,
        ]);
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:150', 'not_regex:/[\r\n]/'],
            'user_message' => ['required', 'string', 'max:5000'],
        ]);

        Mail::to(config('mail.contact_address'))->send(new ContactMessage($data));

        Mail::to($data['email'])->send(new ContactConfirmation($data));

        return back()->with('success', 'Message sent successfully!');
    }
}
