<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PurchasedItem;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index(){
        return Inertia::render('cashier/Pos');
    }

    public function dashboard(){
    $totalPurchasesToday = PurchasedItem::whereDate('created_at', now())
    ->sum(DB::raw('qty * unit_price'));
    // --- Summary Cards ---
     $totalSalesToday = Order::whereDate('updated_at', now())->where('status','completed')->sum(DB::raw('total'))
     + SaleItem::whereDate('created_at', now())->sum('subtotal');

    $totalRevenue = OrderItem::sum(DB::raw('qty * price')) + SaleItem::sum('subtotal');

        $totalCost = PurchasedItem::sum(DB::raw('qty * unit_price'));

        $currentYear = now()->year;
    $currentMonth = now()->month;
       // --- Daily Online Sales ---
    $dailyOnline = Order::select(
            DB::raw("DAY(updated_at) as day_num"),
            DB::raw("SUM(total) as total")
        )
        ->where('status','completed')
        ->whereYear('updated_at', $currentYear)
        ->whereMonth('updated_at', $currentMonth)
        ->groupBy('day_num');

    // --- Daily Shop Sales ---
    $dailyShop = SaleItem::select(
            DB::raw("DAY(created_at) as day_num"),
            DB::raw("SUM(subtotal) as total")
        )
        ->whereYear('created_at', $currentYear)
        ->whereMonth('created_at', $currentMonth)
        ->groupBy('day_num');

    // --- Combine Daily ---
   $daysInMonth = CarbonPeriod::create(
    now()->startOfMonth(),
    now()->endOfMonth()
);

$dailyCombined = $dailyOnline
    ->unionAll($dailyShop)
    ->get()
    ->groupBy('day_num')
    ->map(function ($items, $day_num) use ($currentMonth, $currentYear) {
        return [
            'day' => (int) $day_num,
            'date' => date('M d', mktime(0, 0, 0, $currentMonth, $day_num, $currentYear)),
            'total' => $items->sum('total'),
        ];
    });

// Fill missing days with zero
$dailySales = collect();
foreach ($daysInMonth as $day) {
    $dayNum = $day->day;
    $dailySales->push([
        'day' => $dayNum,
        'date' => $day->format('M d'),
        'total' => $dailyCombined->get($dayNum)['total'] ?? 0,
    ]);
}

        // --- Top Medicines (Combined) ---
        $topMedicinesOnline = OrderItem::with('medicine')
            ->whereHas('medicine')
            ->select('medicine_id', DB::raw('SUM(qty * price) as sales'))
            ->groupBy('medicine_id');

        $topMedicinesShop = SaleItem::with('medicine')
            ->whereHas('medicine')
            ->select('medicine_id', DB::raw('SUM(subtotal) as sales'))
            ->groupBy('medicine_id');

        $topMedicinesCombined = $topMedicinesOnline
            ->unionAll($topMedicinesShop)
            ->get()
            ->groupBy('medicine_id')
            ->map(function($items) {
                $item = $items->first();
                return [
                    'name' => $item->medicine->name,
                    'sales' => $items->sum('sales'),
                ];
            })
            ->sortByDesc('sales')
            ->take(5)
            ->values();

// --- Low Stock Medicines ---
$lowStockMedicines = PurchasedItem::select('medicine_id', DB::raw('SUM(qty - sold_qty) as stock'))
    ->with('medicine')
    ->groupBy('medicine_id')
    ->havingRaw('SUM(qty - sold_qty) < ?', [10])
    ->get()
    ->map(function($item) {
        return [
            'medicine_id' => $item->medicine_id,
            'name' => $item->medicine->name,
            'stock' => $item->stock,
            'status' => 'Low Stock',
        ];
    });

// --- Expired Medicines ---
$expiredMedicines = PurchasedItem::with('medicine')
    ->whereDate('exp_date', '<', now())
    ->get()
    ->map(function($item) {
        return [
            'medicine_id' => $item->medicine_id,
            'name' => $item->medicine->name,
            'stock' => ($item->qty - $item->sold_qty),
            'status' => 'Expired',
        ];
    });

// --- Near Expiry Medicines ---
$nearExpiryMedicines = PurchasedItem::with('medicine')
    ->whereBetween('exp_date', [now(), now()->addDays(30)])
    ->get()
    ->map(function($item) {
        return [
            'medicine_id' => $item->medicine_id,
            'name' => $item->medicine->name,
            'stock' => ($item->qty - $item->sold_qty),
            'status' => 'Near Expiry',
        ];
    });

// --- Merge All ---
$medicineAlerts = collect($lowStockMedicines)
    ->merge(collect($expiredMedicines))
    ->merge(collect($nearExpiryMedicines))
    ->values();
        // --- Return to React Dashboard ---
        return Inertia::render('cashier/Dashboard', [
            'total_sales_today' => $totalSalesToday,
            'total_purchases_today' => $totalPurchasesToday,
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'daily_sales' => $dailySales->values(),
            'top_medicines' => $topMedicinesCombined,
            // 'expired_medicines' => $expiredMedicines,
            // 'low_stock_medicines' => $lowStockMedicines,
            // 'nearExpiryMedicines'=>$nearExpiryMedicines,
            'medicine_alerts' => $medicineAlerts,
        ]);
    }

        // --- Return to React Dashboard ---
        // return Inertia::render('cashier/Dashboard', [
        //     'total_sales_today' => $totalSalesToday,
        //     'total_purchases_today' => $totalPurchasesToday,
        //     'total_revenue' => $totalRevenue,
        //     'total_cost' => $totalCost,
        //     'monthly_sales' => $monthlyCombined,
        //     'top_medicines' => $topMedicinesCombined,
        //     'low_stock_medicines' => $lowStockMedicines,
        // ]);
    // }
    

    public function sale()
    { 
 
    $query = Sale::with('user')->whereDate('created_at',Carbon::now())->where('sale_by',Auth::user()->id);

    // Handle sorting
    $col = request('col');
    $dir = request('dir');

    if ($col && $dir) {
        $query->orderBy($col, $dir);
    }

    // Handle search
    if ($search = request('search')) {
        $query->where('invoice_no', 'like', "%{$search}%")
              ->orWhere('total', 'like', "%{$search}%");
    }

 



    return Inertia::render('cashier/Sale', [
        'sales' => $query->paginate(7)->appends(request()->only([
            'col', 'dir', 'search', 'month', 'year', 'start_date', 'end_date'
        ])),
        'filters' => request()->only(['search', 'month', 'year', 'start_date', 'end_date']),
    ]);

}

public function show(Sale $sale)
{
    
    // Load related data like sale items and customer (if available)
    $sale->load('items.medicine','user');

    return Inertia::render('cashier/SaleShow', [
        'sale' => $sale
    ]);
}
}
