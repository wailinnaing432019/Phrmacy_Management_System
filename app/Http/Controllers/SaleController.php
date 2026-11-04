<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Exports\SalesExport;
use App\Http\Resources\Order\OrderListResource;
use App\Http\Resources\Sale\OrderSaleShowResource;
use App\Http\Resources\Sale\SaleListResource;
use App\Http\Resources\Sale\SaleShowResource;
use App\Models\Sale;
use App\Services\Sale\SaleService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class SaleController extends Controller
{
    public function __construct(
        private readonly SaleService $sales,
    ) {}

    /**
     * Display a listing of sales or online orders.
     */
    public function index()
    {
        $source = request('source', 'shop');
        $filters = request()->only(['col', 'dir', 'search', 'month', 'year', 'start_date', 'end_date', 'source']);

        $sales = $this->sales->report($source, $filters)
            ->through(fn ($row) => $source === 'online'
                ? (new OrderListResource($row))->resolve()
                : (new SaleListResource($row))->resolve());

        return Inertia::render('sale/Index', [
            'sales' => $sales,
            'filters' => request()->only(['search', 'month', 'year', 'start_date', 'end_date', 'source']),
            'source' => $source,
        ]);
    }

    public function export(Request $request, $format)
    {
        $source = $request->input('source', 'shop');
        $data = $this->sales->exportData($source, $request->only([
            'month', 'year', 'start_date', 'end_date',
        ]));

        if ($format === 'csv') {
            return Excel::download(new SalesExport($data, $source), ($source === 'online' ? 'orders' : 'sales').'.csv');
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.sales_pdf', [
                'sales' => $data,
                'source' => $source,
            ]);

            return $pdf->stream(($source === 'online' ? 'orders' : 'sales').'.pdf');
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
     * Store a newly created sale in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|integer|exists:medicines,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'received' => 'required|numeric|min:0',
        ]);

        try {
            $sale = $this->sales->complete($validated);
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('sale_id', $sale->id);
    }

    /**
     * Display the specified sale or online order.
     */
    public function show(string $id, Request $request)
    {
        $source = $request->query('source', 'shop');
        $sale = $this->sales->findForShow($source, (int) $id);

        return Inertia::render('sale/Show', [
            'sale' => $source === 'online'
                ? (new OrderSaleShowResource($sale))->resolve()
                : (new SaleShowResource($sale))->resolve(),
        ]);
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
