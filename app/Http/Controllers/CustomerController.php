<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function login()
    {
        return Inertia::render('customers/LoginForm');
    }
    public function register(){
        return Inertia::render('customers/Register2');
    }
    public function index(Request $request)
{
    $query = Medicine::query()->where('status', 'available')->latest();

    // ✅ Search filter
    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
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
            $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'description' => $medicine->description,
                'selling_price' => $medicine->selling_price,
                'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
                'category' => $medicine->category->name ?? '—',
                'qty' => $availableQty,
                'stock_limit' => $medicine->stock_limit,
                'medicine_barcode' => $medicine->medicine_barcode,
            ];
        }); 
 
    return Inertia::render('customers/Index', [
        'medicines' => $medicines,
        'filters' => $request->only(['search', 'category_id']),
        'categories' => Category::orderBy('name')->get(['id','name']),
    ]);
}


public function products(Request $request)
{
    $query = Medicine::query()->where('status', 'available');
    $limit = 6; // default pagination size

    // ✅ Search filter
    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
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
                  ->orderByRaw('FIELD(id, ' . implode(',', $combined) . ')');
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
            $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'description' => $medicine->description,
                'selling_price' => $medicine->selling_price,
                'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
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
                $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'selling_price' => $medicine->selling_price,
                    'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
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


public function product(Medicine $medicine){ 
    // Calculate available quantity from purchasedItems
    $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

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
            'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
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
            $query->where('name', 'like', '%' . $request->search . '%');
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
                    'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
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
    public function showCheckout(){
 
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
    $items = $request->input('items', []);

    if (empty($items)) {
        return response()->json(['message' => 'Cart is empty'], 400);
    }

    DB::beginTransaction();

    try {
        $total = 0;

        // Validate medicines exist & calculate total
        foreach ($items as $item) {
            $medicine = Medicine::find($item['id']);
            if (!$medicine) {
                throw new \Exception("Medicine not found: {$item['name']}");
            }

            $total += $item['qty'] * $medicine->selling_price;
        }

        $datePrefix = now()->format('Ymd'); // e.g. 20250817
        $orderCountToday = Order::whereDate('created_at', now()->toDateString())->count();
        $orderNo = $datePrefix . str_pad($orderCountToday + 1, 2, '0', STR_PAD_LEFT); // e.g. 2025081704

        // Create order with pending status
        $order = Order::create([
            'user_id' => auth()->id(),
            'order_no'=>$orderNo,
            'total' => $total,
            'status' => 'pending',  
            'name'=>$request->name,
            'email'=>$request->email,
            'phone'=>$request->phone,
            'address'=>$request->address,
            'payment_method'=>$request->payment_method,
            'transaction_id'=>$request->transaction_id,

        ]);

        // Create order items (without reducing stock)
        foreach ($items as $item) {
            $medicine = Medicine::find($item['id']);

            OrderItem::create([
                'order_id' => $order->id,
                'medicine_id' => $medicine->id,
                'qty' => $item['qty'],
                'price' => $medicine->selling_price,
            ]);
        }

        DB::commit();
        return back()->with('message', 'Order placed successfully, waiting for admin approval.');
        return response()->json(['message' => 'Order placed successfully, waiting for admin approval.']);
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('message', $e->getMessage());
        return response()->json(['message' => $e->getMessage()], 400);
    }
}
 
public function myOrders()
{
    $orders = Order::where('user_id', auth()->id())
        ->orderByDesc('created_at')
        ->get()
        ->map(fn($order) => [
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

    $items = $order->items()->with('medicine')->get()->map(fn($item) => [
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
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email',
            'subject'    => 'required|string',
            'user_message'    => 'required|string',
        ]);

 

        Mail::send('emails.admin_contact', $data, function ($mail) use ($data) {
            $mail->to('shwezin56824@gmail.com')
                ->subject('New Contact Message: ' . $data['subject']);
        });

        Mail::send('emails.user_response', $data, function ($mail) use ($data) {
            $mail->to($data['email'])
                ->subject('We received your message');
        });

        return back()->with('success', 'Message sent successfully!');
    }
}
