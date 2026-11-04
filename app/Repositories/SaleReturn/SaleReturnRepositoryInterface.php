<?php

namespace App\Repositories\SaleReturn;

use App\Models\SaleReturn;
use App\Repositories\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SaleReturnRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Paginate returns with their sale and processor.
     */
    public function paginateFiltered(?string $search, int $perPage = 15): LengthAwarePaginator;

    /**
     * Load a return with everything the detail and PDF pages need.
     */
    public function findWithRelations(int $id): SaleReturn;
}
