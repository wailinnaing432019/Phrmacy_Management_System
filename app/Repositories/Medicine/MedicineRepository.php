<?php

namespace App\Repositories\Medicine;

use App\Models\Medicine;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class MedicineRepository extends BaseRepository implements MedicineRepositoryInterface
{
    /**
     * Columns the medicine list may be sorted by.
     *
     * @var list<string>
     */
    private const SORTABLE = ['name', 'selling_price'];

    protected function model(): Model
    {
        return new Medicine;
    }

    public function paginateFiltered(array $filters, int $perPage = 7): LengthAwarePaginator
    {
        $query = $this->query()
            ->with(['category', 'purchasedItems'])
            ->latest();

        if (! empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['category'])) {
            $category = $filters['category'];

            $query->whereHas('category', function ($builder) use ($category) {
                $builder->where('name', $category);
            });
        }

        if (! empty($filters['sortBy']) && in_array($filters['sortBy'], self::SORTABLE, true)) {
            $direction = ($filters['sortDirection'] ?? null) === 'desc' ? 'desc' : 'asc';

            $query->orderBy($filters['sortBy'], $direction);
        }

        return $query->paginate($perPage);
    }

    public function barcodeExists(string $barcode): bool
    {
        return $this->query()
            ->withTrashed()
            ->where('medicine_barcode', $barcode)
            ->exists();
    }
}
