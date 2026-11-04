<?php

namespace App\Repositories\Medicine;

use App\Repositories\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MedicineRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Paginate medicines with search, category filter, and whitelisted sorting.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateFiltered(array $filters, int $perPage = 7): LengthAwarePaginator;

    /**
     * Whether a barcode is already taken, including soft-deleted medicines.
     */
    public function barcodeExists(string $barcode): bool;
}
