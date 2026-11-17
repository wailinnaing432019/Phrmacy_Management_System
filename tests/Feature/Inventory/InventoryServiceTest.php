<?php

use App\Exceptions\InsufficientStockException;
use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Models\StockMovement;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function allocateStock(InventoryService $service, Medicine $medicine, int $quantity): array
{
    return DB::transaction(
        fn () => $service->deduct($medicine->fresh(), $quantity, StockMovement::TYPE_SALE),
    );
}

it('takes stock from the earliest expiring batch first', function () {
    $medicine = Medicine::factory()->create();
    $later = PurchasedItem::factory()->for($medicine)->create([
        'qty' => 5,
        'exp_date' => now()->addMonths(6),
    ]);
    $sooner = PurchasedItem::factory()->for($medicine)->create([
        'qty' => 5,
        'exp_date' => now()->addMonth(),
    ]);

    allocateStock(app(InventoryService::class), $medicine, 7);

    expect($sooner->fresh()->sold_qty)->toBe(5)
        ->and($later->fresh()->sold_qty)->toBe(2)
        ->and($medicine->fresh()->qty)->toBe(3);
});

it('never sells an expired batch', function () {
    $medicine = Medicine::factory()->create();
    $expired = PurchasedItem::factory()->for($medicine)->expired()->create(['qty' => 5]);
    $valid = PurchasedItem::factory()->for($medicine)->create(['qty' => 3]);

    allocateStock(app(InventoryService::class), $medicine, 3);

    expect($expired->fresh()->sold_qty)->toBe(0)
        ->and($valid->fresh()->sold_qty)->toBe(3);

    expect(fn () => allocateStock(app(InventoryService::class), $medicine, 1))
        ->toThrow(InsufficientStockException::class);

    expect($expired->fresh()->sold_qty)->toBe(0);
});

it('rolls everything back when stock is insufficient', function () {
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);

    expect(fn () => allocateStock(app(InventoryService::class), $medicine, 11))
        ->toThrow(InsufficientStockException::class);

    expect($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(10)
        ->and(StockMovement::count())->toBe(0);
});

it('restores stock to the batch it came from', function () {
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);
    $service = app(InventoryService::class);

    $allocations = allocateStock($service, $medicine, 4);

    DB::transaction(fn () => $service->restore(
        $medicine->fresh(),
        $allocations,
        StockMovement::TYPE_SALE_RETURNED,
    ));

    expect($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(10);

    expect(StockMovement::where('type', StockMovement::TYPE_SALE_RETURNED)->value('quantity'))->toBe(4);
});

it('records purchases in the ledger and keeps the cached quantity honest', function () {
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 8]);
    $service = app(InventoryService::class);

    $service->recordPurchase($medicine, $batch, 8, null);

    expect($medicine->fresh()->qty)->toBe(8);

    $movement = StockMovement::where('type', StockMovement::TYPE_PURCHASE)->firstOrFail();

    expect($movement->quantity)->toBe(8)
        ->and($movement->balance_after)->toBe(8)
        ->and($movement->purchased_item_id)->toBe($batch->id);
});
