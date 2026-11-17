<?php

namespace App\Repositories\MedicineSupplier;

use App\Models\MedicineSupplier;
use App\Repositories\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface MedicineSupplierRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Load every medicine-supplier link with both related names.
     */
    public function allWithRelations(): Collection;

    /**
     * Find the link between a medicine and a supplier, if it exists.
     */
    public function findLink(int $medicineId, int $supplierId): ?MedicineSupplier;

    /**
     * Clear the preferred flag for every other supplier of a medicine.
     */
    public function clearPreferredForMedicine(int $medicineId, ?int $exceptId = null): void;
}
