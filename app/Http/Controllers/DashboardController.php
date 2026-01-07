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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
class DashboardController extends Controller
{
    

// public function index()
// {
//     $total_sales_today = Sale::whereDate('created_at', today())->sum('total');
//     $total_purchases_today = PurchasedItem::whereDate('created_at', today())
//     ->select(DB::raw('SUM(qty * unit_price) as total'))
//     ->value('total');
//     $total_revenue = SaleItem::sum('subtotal');
//     $total_cost = PurchasedItem::select(DB::raw('SUM(qty * unit_price) as costtotal'))
//     ->value('costtotal');

//     $monthly_sales = Sale::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as total')
//         ->groupBy('month')
//         ->orderBy('month')
//         ->get();

//     $top_medicines = SaleItem::selectRaw('medicine_id, SUM(quantity) as total_qty')
//         ->groupBy('medicine_id')
//         ->with('medicine:id,name')
//         ->orderByDesc('total_qty')
//         ->limit(5)
//         ->get();

//         $low_stock_medicines = Medicine::whereColumn('qty', '<=', 'stock_limit')
//                 ->select('id', 'name', 'qty', 'stock_limit')
//                 ->get();
//     return Inertia::render('dashboard', [
//         'total_sales_today' => $total_sales_today,
//         'total_purchases_today' => $total_purchases_today,
//         'total_revenue' => $total_revenue,
//         'total_cost' => $total_cost,
//         'monthly_sales' => $monthly_sales,
//         'top_medicines' => $top_medicines,
//         'low_stock_medicines'=>$low_stock_medicines,
//     ]);
// }

public  function index()
{
    
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
        return Inertia::render('dashboard', [
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
}
