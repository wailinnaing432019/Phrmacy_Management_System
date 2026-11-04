<?php

namespace App\Services\MedicineSupplier;

use App\Models\MedicineSupplier;
use App\Repositories\MedicineSupplier\MedicineSupplierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MedicineSupplierService
{
    public function __construct(
        private readonly MedicineSupplierRepositoryInterface $medicineSuppliers,
    ) {}

    public function list(): Collection
    {
        return $this->medicineSuppliers->allWithRelations();
    }

    public function find(int $id): MedicineSupplier
    {
        /** @var MedicineSupplier $link */
        $link = $this->medicineSuppliers->findOrFail($id);

        return $link;
    }

    /**
     * Existing links, used to disable duplicate options in the edit form.
     */
    public function existingLinks(): Collection
    {
        return $this->medicineSuppliers->query()
            ->select('id', 'medicine_id', 'supplier_id')
            ->get();
    }

    /**
     * Link a supplier to a medicine, updating the link when it already exists.
     *
     * @param  array<string, mixed>  $data
     */
    public function link(array $data): MedicineSupplier
    {
        return DB::transaction(function () use ($data) {
            $medicineId = (int) $data['medicine_id'];

            if ((bool) $data['is_preferred']) {
                $exceptId = $this->medicineSuppliers
                    ->findLink($medicineId, (int) $data['supplier_id'])?->id;

                $this->medicineSuppliers->clearPreferredForMedicine($medicineId, $exceptId);
            }

            $existing = $this->medicineSuppliers->findLink($medicineId, (int) $data['supplier_id']);

            if ($existing) {
                /** @var MedicineSupplier $updated */
                $updated = $this->medicineSuppliers->update($existing, $data);

                return $updated;
            }

            /** @var MedicineSupplier $created */
            $created = $this->medicineSuppliers->create($data);

            return $created;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(MedicineSupplier $link, array $data): MedicineSupplier
    {
        return DB::transaction(function () use ($link, $data) {
            if ((bool) $data['is_preferred']) {
                $this->medicineSuppliers->clearPreferredForMedicine(
                    (int) $data['medicine_id'],
                    $link->id,
                );
            }

            /** @var MedicineSupplier $updated */
            $updated = $this->medicineSuppliers->update($link, $data);

            return $updated;
        });
    }

    public function delete(MedicineSupplier $link): bool
    {
        return $this->medicineSuppliers->delete($link);
    }
}
