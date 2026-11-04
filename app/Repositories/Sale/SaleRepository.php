<?php

namespace App\Repositories\Sale;

use App\Models\Sale;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class SaleRepository extends BaseRepository implements SaleRepositoryInterface
{
    /**
     * @var list<string>
     */
    private const SORTABLE = ['invoice_no', 'total', 'created_at', 'id'];

    protected function model(): Model
    {
        return new Sale;
    }

    public function paginateForReport(array $filters, int $perPage = 6): LengthAwarePaginator
    {
        $query = $this->query()->with('user');

        $this->applySort($query, $filters);
        $this->applySearch($query, $filters);
        $this->applyDateFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function paginateForCashier(int $userId, array $filters, int $perPage = 7): LengthAwarePaginator
    {
        $query = $this->query()
            ->with('user')
            ->whereDate('created_at', today())
            ->where('sale_by', $userId);

        $this->applySort($query, $filters);
        $this->applySearch($query, $filters);

        return $query->paginate($perPage);
    }

    public function exportQuery(array $filters): Collection
    {
        $query = $this->query()->with('user');

        $this->applyDateFilters($query, $filters);

        return $query->latest()->get();
    }

    public function findWithItems(int $id): Sale
    {
        /** @var Sale $sale */
        $sale = $this->query()
            ->with(['items.medicine', 'user'])
            ->findOrFail($id);

        return $sale;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applySort(Builder $query, array $filters): void
    {
        $column = $filters['col'] ?? null;
        $direction = ($filters['dir'] ?? null) === 'asc' ? 'asc' : 'desc';

        if (is_string($column) && in_array($column, self::SORTABLE, true)) {
            $query->orderBy($column, $direction);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applySearch(Builder $query, array $filters): void
    {
        if (! $search = $filters['search'] ?? null) {
            return;
        }

        $query->where(function (Builder $builder) use ($search) {
            $builder->where('invoice_no', 'like', "%{$search}%")
                ->orWhere('total', 'like', "%{$search}%");
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyDateFilters(Builder $query, array $filters): void
    {
        if ($month = $filters['month'] ?? null) {
            $query->whereMonth('created_at', $month);
        }

        if ($year = $filters['year'] ?? null) {
            $query->whereYear('created_at', $year);
        }

        if ($start = $filters['start_date'] ?? null) {
            $query->whereDate('created_at', '>=', $start);
        }

        if ($end = $filters['end_date'] ?? null) {
            $query->whereDate('created_at', '<=', $end);
        }
    }
}
