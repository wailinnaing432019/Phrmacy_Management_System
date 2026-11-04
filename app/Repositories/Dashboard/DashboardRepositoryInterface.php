<?php

namespace App\Repositories\Dashboard;

use Illuminate\Support\Collection;

interface DashboardRepositoryInterface
{
    public function totalPurchasesToday(): float;

    public function totalSalesToday(): float;

    public function totalRevenue(): float;

    public function totalCost(): float;

    /**
     * @return Collection<int, array{day: int, date: string, total: float|int|string}>
     */
    public function dailySales(): Collection;

    /**
     * @return Collection<int, array{name: string, sales: float|int|string}>
     */
    public function topMedicines(): Collection;

    /**
     * @return Collection<int, array{medicine_id: int, name: string, stock: int, status: string}>
     */
    public function medicineAlerts(): Collection;
}
