<?php

namespace App\Repositories\Storefront;

use App\Models\Medicine;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface StorefrontRepositoryInterface
{
    /**
     * Get featured/latest medicines for the storefront homepage.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Medicine>
     */
    public function getFeaturedMedicines(array $filters = [], int $limit = 12): Collection;

    /**
     * Get all categories for storefront filtering.
     *
     * @return Collection<int, \App\Models\Category>
     */
    public function getCategories(): Collection;

    /**
     * Paginate sellable medicines with search, category, and price sorting.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginateMedicines(array $filters, int $perPage = 6): LengthAwarePaginator;

    /**
     * Get top-selling medicines in ranked order.
     *
     * @param  array<int, int>  $topIds
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Medicine>
     */
    public function getTopSellingMedicines(array $topIds, array $filters = []): Collection;

    /**
     * Get latest new arrival medicines.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Medicine>
     */
    public function getNewArrivals(array $filters = [], int $limit = 9): Collection;

    /**
     * Load relations and available stock for a product detail view.
     */
    public function loadProductDetail(Medicine $medicine): Medicine;
}
