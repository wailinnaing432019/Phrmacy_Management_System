<?php

namespace App\Repositories\MedicineSupplier;

use App\Models\MedicineSupplier;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class MedicineSupplierRepository extends BaseRepository implements MedicineSupplierRepositoryInterface
{
    protected function model(): Model
    {
        return new MedicineSupplier;
    }

    public function allWithRelations(): Collection
    {
        return $this->query()
            ->with(['medicine:id,name', 'supplier:id,name'])
            ->get();
    }

    public function findLink(int $medicineId, int $supplierId): ?MedicineSupplier
    {
        return $this->query()
            ->where('medicine_id', $medicineId)
            ->where('supplier_id', $supplierId)
            ->first();
    }

    public function clearPreferredForMedicine(int $medicineId, ?int $exceptId = null): void
    {
        $this->query()
            ->where('medicine_id', $medicineId)
            ->when($exceptId !== null, fn ($query) => $query->where('id', '!=', $exceptId))
            ->update(['is_preferred' => false]);
    }
}
