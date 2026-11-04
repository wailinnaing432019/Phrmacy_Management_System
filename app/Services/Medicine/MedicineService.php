<?php

namespace App\Services\Medicine;

use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Repositories\Medicine\MedicineRepositoryInterface;
use App\Services\InventoryService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MedicineService
{
    public function __construct(
        private readonly MedicineRepositoryInterface $medicines,
        private readonly InventoryService $inventory,
    ) {}

    public function find(int $id): Medicine
    {
        /** @var Medicine $medicine */
        $medicine = $this->medicines->findOrFail($id);

        return $medicine;
    }

    /**
     * Lightweight medicine options for select inputs.
     */
    public function options(): Collection
    {
        return $this->medicines->all(['id', 'name']);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->medicines->paginateFiltered($filters);
    }

    public function findForShow(int $id): Medicine
    {
        /** @var Medicine $medicine */
        $medicine = $this->medicines->query()
            ->with([
                'category',
                'purchasedItems' => function ($query) {
                    $query->orderByRaw('CASE WHEN exp_date IS NULL THEN 1 ELSE 0 END, exp_date DESC');
                },
            ])
            ->findOrFail($id);

        return $medicine;
    }

    public function findForEdit(int $id): Medicine
    {
        /** @var Medicine $medicine */
        $medicine = $this->medicines->query()->with('purchasedItems')->findOrFail($id);

        return $medicine;
    }

    /**
     * Create a medicine together with its first purchase batch.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image = null): Medicine
    {
        return DB::transaction(function () use ($data, $image) {
            /** @var Medicine $medicine */
            $medicine = $this->medicines->create([
                'name' => $data['name'],
                'category_id' => $data['category_id'],
                'description' => $data['description'],
                'selling_price' => $data['selling_price'],
                'qty' => $data['qty'],
                'stock_limit' => $data['stock_limit'],
                'medicine_barcode' => $this->generateBarcode(),
                'image' => $image?->store('medicines', 'public') ?? '',
                'status' => $data['status'] ?? 'available',
            ]);

            $batch = PurchasedItem::create([
                'medicine_id' => $medicine->id,
                'qty' => $data['qty'],
                'unit_price' => $data['purchase_price'],
                'description' => $data['description'],
                'mfd_date' => $data['mfd_date'],
                'exp_date' => $data['exp_date'],
            ]);

            $this->inventory->recordPurchase(
                $medicine,
                $batch,
                (int) $data['qty'],
                auth()->id(),
            );

            return $medicine;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Medicine $medicine, array $data, ?UploadedFile $image = null): Medicine
    {
        return DB::transaction(function () use ($medicine, $data, $image) {
            $filePath = $medicine->image;

            if ($image) {
                $filePath = $image->store('medicines', 'public');

                if ($medicine->image) {
                    Storage::disk('public')->delete($medicine->image);
                }
            }

            /** @var Medicine $medicine */
            $medicine = $this->medicines->update($medicine, [
                'name' => $data['name'],
                'category_id' => $data['category_id'],
                'description' => $data['description'],
                'selling_price' => $data['selling_price'],
                'stock_limit' => $data['stock_limit'],
                'image' => $filePath,
                'status' => $data['status'] ?? 'available',
            ]);

            return $medicine;
        });
    }

    /**
     * Restock a medicine by creating a new purchase batch.
     *
     * @param  array<string, mixed>  $data
     */
    public function addQuantity(Medicine $medicine, array $data): Medicine
    {
        return DB::transaction(function () use ($medicine, $data) {
            $medicine->qty += (int) $data['qty'];
            $medicine->save();

            $batch = PurchasedItem::create([
                'medicine_id' => $medicine->id,
                'qty' => $data['qty'],
                'unit_price' => $data['unit_price'],
                'description' => $data['description'] ?? null,
                'mfd_date' => $data['mfd_date'],
                'exp_date' => $data['exp_date'],
            ]);

            $this->inventory->recordPurchase(
                $medicine,
                $batch,
                (int) $data['qty'],
                auth()->id(),
            );

            return $medicine;
        });
    }

    public function delete(Medicine $medicine): bool
    {
        return $this->medicines->delete($medicine);
    }

    /**
     * Generate a short, unique medicine barcode.
     */
    private function generateBarcode(): string
    {
        do {
            $barcode = 'MED'.rand(100000, 999999);
        } while ($this->medicines->barcodeExists($barcode));

        return $barcode;
    }
}
