<?php

namespace App\Repositories\Storefront;

use App\Models\Category;
use App\Models\Medicine;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class StorefrontRepository implements StorefrontRepositoryInterface
{
    /**
     * {@inheritDoc}
     */
    public function getFeaturedMedicines(array $filters = [], int $limit = 12): Collection
    {
        $query = Medicine::query()
            ->availableForSale()
            ->withSellableQty()
            ->with('category')
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->take($limit)->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getCategories(): Collection
    {
        return Category::query()->orderBy('name')->get(['id', 'name']);
    }

    /**
     * {@inheritDoc}
     */
    public function paginateMedicines(array $filters, int $perPage = 6): LengthAwarePaginator
    {
        $query = Medicine::query()
            ->availableForSale()
            ->withSellableQty()
            ->with('category');

        $this->applyFilters($query, $filters);

        match ($filters['sort'] ?? null) {
            'price-low-high' => $query->orderBy('selling_price', 'asc'),
            'price-high-low' => $query->orderBy('selling_price', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * {@inheritDoc}
     */
    public function getTopSellingMedicines(array $topIds, array $filters = []): Collection
    {
        if (empty($topIds)) {
            return collect();
        }

        $query = Medicine::query()
            ->availableForSale()
            ->withSellableQty()
            ->with('category')
            ->whereIn('id', $topIds);

        $this->applyFilters($query, $filters);

        $orderedIds = implode(',', array_map('intval', $topIds));

        return $query->orderByRaw("FIELD(id, {$orderedIds})")->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getNewArrivals(array $filters = [], int $limit = 9): Collection
    {
        $query = Medicine::query()
            ->availableForSale()
            ->withSellableQty()
            ->with('category')
            ->orderBy('created_at', 'desc');

        $this->applyFilters($query, $filters);

        return $query->limit($limit)->get();
    }

    /**
     * {@inheritDoc}
     */
    public function loadProductDetail(Medicine $medicine): Medicine
    {
        return $medicine->loadMissing('category');
    }

    /**
     * Apply common search and category filters.
     *
     * @param  Builder<Medicine>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
    }
}
