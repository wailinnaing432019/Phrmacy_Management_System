<?php

namespace App\Http\Controllers;

use App\Http\Resources\SaleReturn\ReturnableSaleResource;
use App\Http\Resources\SaleReturn\SaleReturnListResource;
use App\Http\Resources\SaleReturn\SaleReturnShowResource;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Services\SaleReturn\SaleReturnService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleReturnController extends Controller
{
    public function __construct(
        private readonly SaleReturnService $returns,
    ) {}

    public function index(Request $request)
    {
        $returns = $this->returns->paginate($request->search)
            ->through(fn (SaleReturn $saleReturn) => (new SaleReturnListResource($saleReturn))->resolve());

        return Inertia::render('returns/Index', [
            'returns' => $returns,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Sale $sale)
    {
        $sale = $this->returns->findSaleForReturn($sale->id);

        return Inertia::render('returns/Create', [
            'sale' => (new ReturnableSaleResource($sale))->resolve(),
        ]);
    }

    public function store(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.sale_item_id' => 'required|integer|exists:sale_items,id',
            'items.*.quantity' => 'required|integer|min:0',
            'items.*.restock' => 'boolean',
            'refund_method' => 'required|in:cash,card,transfer,other',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $saleReturn = $this->returns->process($sale, $validated);

        return redirect()
            ->route('returns.show', $saleReturn)
            ->with('success', 'Return processed successfully.');
    }

    public function show(SaleReturn $saleReturn)
    {
        $saleReturn = $this->returns->findForShow($saleReturn->id);

        return Inertia::render('returns/Show', [
            'saleReturn' => (new SaleReturnShowResource($saleReturn))->resolve(),
        ]);
    }

    public function pdf(SaleReturn $saleReturn)
    {
        $saleReturn = $this->returns->findForShow($saleReturn->id);

        $pdf = Pdf::loadView('returns.pdf', ['return' => $saleReturn])
            ->setPaper('A4', 'portrait');

        return $pdf->stream("{$saleReturn->return_no}.pdf");
    }
}
