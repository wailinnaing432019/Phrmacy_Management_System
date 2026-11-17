<?php

namespace App\Repositories\Sale;

use App\Models\Sale;
use App\Repositories\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface SaleRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Paginate shop sales for the sales report.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateForReport(array $filters, int $perPage = 6): LengthAwarePaginator;

    /**
     * Paginate today's sales belonging to a single cashier.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateForCashier(int $userId, array $filters, int $perPage = 7): LengthAwarePaginator;

    /**
     * Fetch every sale matching the report filters for export.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportQuery(array $filters): Collection;

    /**
     * Load a sale with its lines and cashier.
     */
    public function findWithItems(int $id): Sale;
}
