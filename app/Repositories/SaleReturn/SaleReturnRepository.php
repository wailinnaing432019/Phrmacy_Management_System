<?php

namespace App\Repositories\SaleReturn;

use App\Models\SaleReturn;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class SaleReturnRepository extends BaseRepository implements SaleReturnRepositoryInterface
{
    protected function model(): Model
    {
        return new SaleReturn;
    }

    public function paginateFiltered(?string $search, int $perPage = 15): LengthAwarePaginator
    {
        return $this->query()
            ->with(['sale:id,invoice_no,total', 'processor:id,name'])
            ->when($search, function (Builder $query, string $value) {
                $query->where(function (Builder $sub) use ($value) {
                    $sub->where('return_no', 'like', "%{$value}%")
                        ->orWhereHas('sale', fn (Builder $sale) => $sale->where('invoice_no', 'like', "%{$value}%"));
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findWithRelations(int $id): SaleReturn
    {
        /** @var SaleReturn $saleReturn */
        $saleReturn = $this->query()
            ->with(['sale.user', 'items.medicine', 'processor'])
            ->findOrFail($id);

        return $saleReturn;
    }
}
