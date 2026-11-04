<?php

namespace App\Http\Controllers;

use App\Http\Resources\Sale\SaleListResource;
use App\Http\Resources\Sale\SaleShowResource;
use App\Models\Sale;
use App\Services\Dashboard\DashboardService;
use App\Services\Sale\SaleService;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function __construct(
        private readonly SaleService $sales,
        private readonly DashboardService $dashboard,
    ) {}

    public function index()
    {
        return Inertia::render('cashier/Pos');
    }

    public function dashboard()
    {
        return Inertia::render('cashier/Dashboard', $this->dashboard->metrics());
    }

    public function sale()
    {
        $filters = request()->only(['col', 'dir', 'search', 'month', 'year', 'start_date', 'end_date']);

        $sales = $this->sales->cashierSales((int) auth()->id(), $filters)
            ->through(fn (Sale $sale) => (new SaleListResource($sale))->resolve());

        return Inertia::render('cashier/Sale', [
            'sales' => $sales,
            'filters' => request()->only(['search', 'month', 'year', 'start_date', 'end_date']),
        ]);
    }

    public function show(Sale $sale)
    {
        abort_unless((int) $sale->sale_by === (int) auth()->id(), 403);

        $sale = $this->sales->findForCashier($sale->id);

        return Inertia::render('cashier/SaleShow', [
            'sale' => (new SaleShowResource($sale))->resolve(),
        ]);
    }
}
