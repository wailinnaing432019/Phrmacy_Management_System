<?php

namespace App\Repositories\Order;

use App\Models\Order;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    /**
     * @var list<string>
     */
    private const SORTABLE = ['order_no', 'total', 'created_at', 'id'];

    protected function model(): Model
    {
        return new Order;
    }

    public function paginateFiltered(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->query()->with(['items.medicine']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function (Builder $builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function paginateForReport(array $filters, int $perPage = 6): LengthAwarePaginator
    {
        $query = $this->query()->with('customer');

        $this->applySort($query, $filters);
        $this->applySearch($query, $filters);
        $this->applyDateFilters($query, $filters);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function exportQuery(array $filters): Collection
    {
        $query = $this->query()->with('customer');

        $this->applyDateFilters($query, $filters);

        return $query->latest()->get();
    }

    public function findWithItemsAndCustomer(int $id): Order
    {
        /** @var Order $order */
        $order = $this->query()
            ->with(['items.medicine', 'customer'])
            ->findOrFail($id);

        return $order;
    }

    public function findWithItemsAndUser(int $id): Order
    {
        return $this->findWithItemsAndCustomer($id);
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
            $builder->where('order_no', 'like', "%{$search}%")
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
