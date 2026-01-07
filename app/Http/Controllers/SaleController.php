<?php

namespace App\Http\Controllers;

use App\Exports\SalesExport;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\Sale;
use App\Models\SaleItem;
 
 
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
 
 use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    { 
 
    // Determine source: 'shop' or 'online'
    $source = request('source', 'shop'); // default to shop

    if ($source === 'online') {
        $query = Order::with('user');
        $invoiceCol = 'order_no';
    } else {
        $query = Sale::with('user');
        $invoiceCol = 'invoice_no';
    }

    // Sorting
    $col = request('col');
    $dir = request('dir');
    if ($col && $dir) {
        $query->orderBy($col, $dir);
    }

    // Search
    if ($search = request('search')) {
        $query->where(function($q) use ($search, $invoiceCol) {
            $q->where($invoiceCol, 'like', "%{$search}%")
              ->orWhere('total', 'like', "%{$search}%");
        });
    }

    // Filter by month/year
    if ($month = request('month')) $query->whereMonth('created_at', $month);
    if ($year = request('year')) $query->whereYear('created_at', $year);

    // Filter by start/end date
    if ($start = request('start_date')) $query->whereDate('created_at', '>=', $start);
    if ($end = request('end_date')) $query->whereDate('created_at', '<=', $end);

    // return [
    //     'sales' => $query->paginate(6)->appends(request()->only([
    //         'col', 'dir', 'search', 'month', 'year', 'start_date', 'end_date', 'source'
    //     ])),
    //     'filters' => request()->only(['search', 'month', 'year', 'start_date', 'end_date', 'source']),
    //     'source' => $source,
    // ];
    return Inertia::render('sale/Index', [
        'sales' => $query->orderBy('created_at','desc')->paginate(6)->appends(request()->only([
            'col', 'dir', 'search', 'month', 'year', 'start_date', 'end_date', 'source'
        ])),
        'filters' => request()->only(['search', 'month', 'year', 'start_date', 'end_date', 'source']),
        'source' => $source,
    ]);

}

 
public function export(Request $request, $format)
{
   $source = $request->input('source', 'shop'); // default to shop

    if ($source === 'online') {
        $query = Order::with('user');
        $invoiceCol = 'order_no';
    } else {
        $query = Sale::with('user');
        $invoiceCol = 'invoice_no';
    }

    // Filter by month & year
    if ($request->filled('month')) {
        $query->whereMonth('created_at', $request->month);
    }
    if ($request->filled('year')) {
        $query->whereYear('created_at', $request->year);
    }

    // Filter by start & end dates
    if ($request->filled('start_date')) {
        $query->whereDate('created_at', '>=', $request->start_date);
    }
    if ($request->filled('end_date')) {
        $query->whereDate('created_at', '<=', $request->end_date);
    }

    $data = $query->latest()->get();

    if ($format === 'csv') {
        return Excel::download(new SalesExport($data, $source), ($source === 'online' ? 'orders' : 'sales') . '.csv');
    }

    if ($format === 'pdf') {
        $pdf = Pdf::loadView('exports.sales_pdf', [
            'sales' => $data,
            'source' => $source
        ]);
        return $pdf->stream(($source === 'online' ? 'orders' : 'sales') . '.pdf');
    }

    abort(404);
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
    $request->validate([
        'cart' => 'required|array|min:1',
        'cart.*.id' => 'required|integer|exists:medicines,id',
        'cart.*.quantity' => 'required|integer|min:1',
        'cart.*.selling_price' => 'required|numeric|min:0',
        'total'=>'required|min:0',
        'received'=>'required|min:0',
        'refund'=>'required|min:0',
    ]);

    DB::beginTransaction();

    try {
        $cart = $request->cart;

        // Create Sale record with temporary total 0
        $sale = Sale::create([
            'invoice_no' => 'INV-' . strtoupper(Str::random(8)),
            'total' => 0,
            'sale_by' => auth()->user()->id,
            'received_amount'=>$request->received,
            'refund_amount'=>$request->refund,
        ]);

        $totalAmount = 0;

        // Process each medicine in cart
        foreach ($cart as $item) {
            $medicine = Medicine::with(['purchasedItems' => function ($q) {
                // FIFO: order by exp_date ascending, NULLs last
                $q->orderByRaw('CASE WHEN exp_date IS NULL THEN 1 ELSE 0 END, exp_date ASC');
            }])->findOrFail($item['id']);

            $neededQty = $item['quantity'];

            foreach ($medicine->purchasedItems as $batch) {
                if ($neededQty <= 0) break;

                // Skip expired batches
                if (!is_null($batch->exp_date) && $batch->exp_date < now()->toDateString()) {
                    continue;
                }

                $available = $batch->qty - $batch->sold_qty;
                if ($available <= 0) continue;

                $deduct = min($neededQty, $available);

                // Increment sold_qty
                $batch->increment('sold_qty', $deduct);

                // Deduct from needed quantity
                $neededQty -= $deduct;

                // Record SaleItem history
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'medicine_id' => $medicine->id,
                    'purchased_item_id' => $batch->id,
                    'quantity' => $deduct,
                    'unit_price' => $item['selling_price'],
                    'subtotal' => $deduct * $item['selling_price'],
                ]);

                $totalAmount += $deduct * $item['selling_price'];
            }

            // If after looping all batches we still need qty → insufficient stock
            if ($neededQty > 0) {
                throw new \Exception("Insufficient stock for {$medicine->name}");
            }

            // Update medicine total qty (in-memory + DB)
            $currentStock = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);
        }

        // Update total amount of sale
        $sale->update(['total' => $totalAmount]);

        DB::commit();

        return back()->with('sale_id', $sale->id);

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => 'Sale failed: ' . $e->getMessage()]);
    }
}


    /**
     * Display the specified resource.
     */
public function show(string $id, Request $request)
{
    $source = $request->query('source', 'shop'); // default: shop sale

    if ($source === 'online') {
        // --- Online sale (Orders) ---
        $order = Order::with(['items.medicine', 'user'])->findOrFail($id);

        return Inertia::render('sale/Show', [
            'sale' => [
                'id' => $order->id,
                'invoice_no' => $order->order_no, // online order uses order_no
                'sale_by' => $order->user->name ?? $order->name ?? 'N/A', // user name or guest
                'total' => $order->total,
                'payment_method' => $order->payment_method,
                'created_at' => $order->updated_at->format('d-m-Y H:s'),
                'items' => $order->items->map(fn($item) => [
                    'medicine_name' => $item->medicine->name ?? 'Unknown',
                    'quantity' => $item->qty,
                    'unit_price' => $item->price,
                    'subtotal' => $item->qty * $item->price, // calculate subtotal
                ]),
            ]
        ]);
    } else {
        // --- Shop sale (Sales) ---
        $sale = Sale::with(['items.medicine', 'user'])->findOrFail($id);

        return Inertia::render('sale/Show', [
            'sale' => [
                'id' => $sale->id,
                'invoice_no' => $sale->invoice_no,
                'sale_by' => $sale->user->name ?? 'N/A',
                'total' => $sale->total,
                'received_amount' => $sale->received_amount,
                'refund_amount' => $sale->refund_amount,
                'payment_method' => $sale->payment_method,
                'created_at' => $sale->updated_at->format('d-m-Y H:s'),
                'items' => $sale->items->map(fn($item) => [
                    'medicine_name' => $item->medicine->name ?? 'Unknown',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ]),
            ]
        ]);
    }
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        //
    }
}
