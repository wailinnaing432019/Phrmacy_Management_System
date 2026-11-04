<?php

namespace App\Repositories\Dashboard;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PurchasedItem;
use App\Models\SaleItem;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Read-only reporting queries. There is no Eloquent model for the dashboard,
 * so this repository composes aggregates instead of extending BaseRepository.
 */
class DashboardRepository implements DashboardRepositoryInterface
{
    public function totalPurchasesToday(): float
    {
        return (float) PurchasedItem::query()
            ->whereDate('created_at', today())
            ->sum(DB::raw('qty * unit_price'));
    }

    public function totalSalesToday(): float
    {
        $online = (float) Order::query()
            ->whereDate('updated_at', today())
            ->where('status', 'completed')
            ->sum(DB::raw('total'));

        $shop = (float) SaleItem::query()
            ->whereDate('created_at', today())
            ->sum('subtotal');

        return $online + $shop;
    }

    public function totalRevenue(): float
    {
        return (float) OrderItem::query()->sum(DB::raw('qty * price'))
            + (float) SaleItem::query()->sum('subtotal');
    }

    public function totalCost(): float
    {
        return (float) PurchasedItem::query()->sum(DB::raw('qty * unit_price'));
    }

    public function dailySales(): Collection
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;

        $dailyOnline = Order::query()
            ->select(DB::raw('DAY(updated_at) as day_num'), DB::raw('SUM(total) as total'))
            ->where('status', 'completed')
            ->whereYear('updated_at', $currentYear)
            ->whereMonth('updated_at', $currentMonth)
            ->groupBy('day_num');

        $dailyShop = SaleItem::query()
            ->select(DB::raw('DAY(created_at) as day_num'), DB::raw('SUM(subtotal) as total'))
            ->whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->groupBy('day_num');

        $combined = $dailyOnline
            ->unionAll($dailyShop)
            ->get()
            ->groupBy('day_num');

        $days = collect();

        foreach (CarbonPeriod::create(now()->startOfMonth(), now()->endOfMonth()) as $day) {
            $dayNumber = $day->day;

            $days->push([
                'day' => $dayNumber,
                'date' => $day->format('M d'),
                'total' => $combined->get($dayNumber)['total'] ?? 0,
            ]);
        }

        return $days;
    }

    public function topMedicines(): Collection
    {
        $online = OrderItem::query()
            ->with('medicine')
            ->whereHas('medicine')
            ->select('medicine_id', DB::raw('SUM(qty * price) as sales'))
            ->groupBy('medicine_id');

        $shop = SaleItem::query()
            ->with('medicine')
            ->whereHas('medicine')
            ->select('medicine_id', DB::raw('SUM(subtotal) as sales'))
            ->groupBy('medicine_id');

        return $online
            ->unionAll($shop)
            ->get()
            ->groupBy('medicine_id')
            ->map(function (Collection $items) {
                $item = $items->first();

                return [
                    'name' => $item->medicine->name,
                    'sales' => $items->sum('sales'),
                ];
            })
            ->sortByDesc('sales')
            ->take(5)
            ->values();
    }

    public function medicineAlerts(): Collection
    {
        $lowStock = PurchasedItem::query()
            ->select('medicine_id', DB::raw('SUM(qty - sold_qty) as stock'))
            ->with('medicine')
            ->groupBy('medicine_id')
            ->havingRaw('SUM(qty - sold_qty) < ?', [10])
            ->get()
            ->map(fn (PurchasedItem $item) => [
                'medicine_id' => $item->medicine_id,
                'name' => $item->medicine->name,
                'stock' => $item->stock,
                'status' => 'Low Stock',
            ]);

        $expired = PurchasedItem::query()
            ->with('medicine')
            ->whereDate('exp_date', '<', now())
            ->get()
            ->map(fn (PurchasedItem $item) => [
                'medicine_id' => $item->medicine_id,
                'name' => $item->medicine->name,
                'stock' => $item->qty - $item->sold_qty,
                'status' => 'Expired',
            ]);

        $nearExpiry = PurchasedItem::query()
            ->with('medicine')
            ->whereBetween('exp_date', [now(), now()->addDays(30)])
            ->get()
            ->map(fn (PurchasedItem $item) => [
                'medicine_id' => $item->medicine_id,
                'name' => $item->medicine->name,
                'stock' => $item->qty - $item->sold_qty,
                'status' => 'Near Expiry',
            ]);

        return collect($lowStock)
            ->merge($expired)
            ->merge($nearExpiry)
            ->values();
    }
}
