<?php

namespace App\Http\Controllers;

use App\Http\Resources\Sale\InvoiceSaleResource;
use App\Services\Medicine\MedicineService;
use App\Services\Sale\SaleService;
use Inertia\Inertia;

class POSController extends Controller
{
    public function __construct(
        private readonly MedicineService $medicines,
        private readonly SaleService $sales,
    ) {}

    public function index()
    {
        return Inertia::render('pos/POS');
    }

    public function lookup($barcode)
    {
        $medicine = $this->medicines->lookup($barcode);

        if (! $medicine) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($medicine);
    }

    public function invoice($id)
    {
        $sale = $this->sales->findForCashier((int) $id);

        if (auth()->user()?->role !== 'admin') {
            abort_unless((int) $sale->sale_by === (int) auth()->id(), 403);
        }

        return Inertia::render('pos/Invoice', [
            'sale' => (new InvoiceSaleResource($sale))->resolve(),
        ]);
    }
}
