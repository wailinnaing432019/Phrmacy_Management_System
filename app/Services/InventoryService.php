<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Allocate stock for a medicine using first-expiry-first-out (FEFO).
     *
     * Expired batches are never sold. The caller must run this inside a
     * database transaction so the row locks and the ledger commit together.
     *
     * @return array<int, array{purchased_item_id: int, quantity: int}>
     */
    public function deduct(
        Medicine $medicine,
        int $quantity,
        string $type,
        ?Model $reference = null,
        ?int $userId = null,
        ?string $note = null,
    ): array {
        if ($quantity < 1) {
            throw new \InvalidArgumentException('Quantity must be at least 1.');
        }

        $batches = $medicine->purchasedItems()
            ->whereColumn('qty', '>', 'sold_qty')
            ->where(function ($query) {
                $query->whereNull('exp_date')->orWhereDate('exp_date', '>=', today());
            })
            ->orderByRaw('CASE WHEN exp_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('exp_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $remaining = $quantity;
        $allocations = [];

        foreach ($batches as $batch) {
            if ($remaining === 0) {
                break;
            }

            $take = min($remaining, $batch->qty - $batch->sold_qty);

            if ($take <= 0) {
                continue;
            }

            $batch->sold_qty += $take;
            $batch->save();

            $allocations[] = [
                'purchased_item_id' => $batch->id,
                'quantity' => $take,
            ];

            $remaining -= $take;
        }

        if ($remaining > 0) {
            throw new InsufficientStockException(
                $medicine->name,
                $quantity,
                $quantity - $remaining,
            );
        }

        $this->syncQuantity($medicine);
        $this->record($medicine, -$quantity, $type, $reference, $userId, $note);

        return $allocations;
    }

    /**
     * Put previously allocated quantities back into their original batches.
     *
     * @param  array<int, array{purchased_item_id: int, quantity: int}>  $allocations
     */
    public function restore(
        Medicine $medicine,
        array $allocations,
        string $type,
        ?Model $reference = null,
        ?int $userId = null,
        ?string $note = null,
    ): void {
        $restored = 0;

        foreach ($allocations as $allocation) {
            $batch = PurchasedItem::query()
                ->lockForUpdate()
                ->find($allocation['purchased_item_id']);

            if (! $batch) {
                continue;
            }

            $quantity = min($allocation['quantity'], $batch->sold_qty);

            if ($quantity <= 0) {
                continue;
            }

            $batch->sold_qty -= $quantity;
            $batch->save();

            $restored += $quantity;
        }

        if ($restored === 0) {
            return;
        }

        $this->syncQuantity($medicine);
        $this->record($medicine, $restored, $type, $reference, $userId, $note);
    }

    /**
     * Record a new purchase batch and keep the cached stock in sync.
     */
    public function recordPurchase(
        Medicine $medicine,
        PurchasedItem $batch,
        int $quantity,
        ?int $userId = null,
        ?string $note = null,
    ): void {
        $this->syncQuantity($medicine);
        $this->record(
            $medicine,
            $quantity,
            StockMovement::TYPE_PURCHASE,
            $batch,
            $userId,
            $note,
            $batch->id,
        );
    }

    /**
     * Record a manual stock correction (batch edit, inventory count, write-off).
     */
    public function recordAdjustment(
        Medicine $medicine,
        int $signedQuantity,
        ?int $userId = null,
        ?string $note = null,
    ): void {
        if ($signedQuantity === 0) {
            return;
        }

        $this->syncQuantity($medicine);
        $this->record(
            $medicine,
            $signedQuantity,
            StockMovement::TYPE_ADJUSTMENT,
            null,
            $userId,
            $note,
        );
    }

    /**
     * Recompute medicines.qty from the batch ledger.
     */
    public function syncQuantity(Medicine $medicine): int
    {
        $quantity = (int) PurchasedItem::query()
            ->where('medicine_id', $medicine->id)
            ->sum(DB::raw('qty - sold_qty'));

        $medicine->forceFill(['qty' => $quantity])->save();

        return $quantity;
    }

    /**
     * How much of this medicine can be sold right now (ignores expired batches).
     */
    public function availableQuantity(Medicine $medicine): int
    {
        return (int) $medicine->purchasedItems()
            ->whereColumn('qty', '>', 'sold_qty')
            ->where(function ($query) {
                $query->whereNull('exp_date')->orWhereDate('exp_date', '>=', today());
            })
            ->sum(DB::raw('qty - sold_qty'));
    }

    protected function record(
        Medicine $medicine,
        int $signedQuantity,
        string $type,
        ?Model $reference = null,
        ?int $userId = null,
        ?string $note = null,
        ?int $purchasedItemId = null,
    ): void {
        StockMovement::create([
            'medicine_id' => $medicine->id,
            'purchased_item_id' => $purchasedItemId,
            'type' => $type,
            'quantity' => $signedQuantity,
            'balance_after' => $medicine->qty,
            'reference_type' => $reference ? strtolower(class_basename($reference)) : null,
            'reference_id' => $reference?->getKey(),
            'user_id' => $userId,
            'note' => $note,
        ]);
    }
}
