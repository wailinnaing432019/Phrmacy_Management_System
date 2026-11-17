<?php

namespace App\Services\Dashboard;

use App\Repositories\Dashboard\DashboardRepositoryInterface;

class DashboardService
{
    public function __construct(
        private readonly DashboardRepositoryInterface $dashboard,
    ) {}

    /**
     * Summary metrics shared by the admin and cashier dashboards.
     *
     * @return array<string, mixed>
     */
    public function metrics(): array
    {
        return [
            'total_sales_today' => $this->dashboard->totalSalesToday(),
            'total_purchases_today' => $this->dashboard->totalPurchasesToday(),
            'total_revenue' => $this->dashboard->totalRevenue(),
            'total_cost' => $this->dashboard->totalCost(),
            'daily_sales' => $this->dashboard->dailySales()->values(),
            'top_medicines' => $this->dashboard->topMedicines(),
            'medicine_alerts' => $this->dashboard->medicineAlerts(),
        ];
    }
}
