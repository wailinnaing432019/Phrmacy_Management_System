<?php

namespace App\Services\PurchasedItem;

use App\Models\PurchasedItem;
use App\Repositories\PurchasedItem\PurchasedItemRepositoryInterface;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;

class PurchasedItemService
{
    public function __construct(
        private readonly PurchasedItemRepositoryInterface $purchasedItems,
        private readonly InventoryService $inventory,
    ) {}

    /**
     * Update a purchase batch and log the resulting stock adjustment.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): PurchasedItem
    {
        return DB::transaction(function () use ($id, $data) {
            /** @var PurchasedItem $purchasedItem */
            $purchasedItem = $this->purchasedItems->findOrFail($id);

            $before = $purchasedItem->qty - $purchasedItem->sold_qty;

            /** @var PurchasedItem $purchasedItem */
            $purchasedItem = $this->purchasedItems->update($purchasedItem, $data);

            $after = $purchasedItem->qty - $purchasedItem->sold_qty;
            $medicine = $purchasedItem->medicine;

            if ($medicine) {
                $this->inventory->recordAdjustment(
                    $medicine,
                    $after - $before,
                    auth()->id(),
                    "Batch #{$purchasedItem->id} edited manually.",
                );
            }

            return $purchasedItem;
        });
    }
}
