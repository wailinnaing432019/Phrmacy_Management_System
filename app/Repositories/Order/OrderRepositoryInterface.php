<?php

namespace App\Repositories\Order;

use App\Models\Order;
use App\Repositories\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Paginate orders for the admin order list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateFiltered(array $filters, int $perPage = 10): LengthAwarePaginator;

    /**
     * Paginate online orders for the sales report.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateForReport(array $filters, int $perPage = 6): LengthAwarePaginator;

    /**
     * Fetch every order matching the report filters for export.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportQuery(array $filters): Collection;

    /**
     * Load an order with its lines and customer.
     */
    public function findWithItemsAndCustomer(int $id): Order;

    /**
     * Compatibility alias.
     */
    public function findWithItemsAndUser(int $id): Order;
}
