<?php

use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function cashier(): User
{
    return User::factory()->cashier()->create();
}

it('prices a sale from the database and ignores tampered cart prices', function () {
    $medicine = Medicine::factory()->create(['selling_price' => 100]);
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);

    $response = $this->actingAs(cashier())->post('/cashier/pos/complete-sale', [
        'cart' => [
            ['id' => $medicine->id, 'quantity' => 2, 'selling_price' => 1],
        ],
        'total' => 2,
        'received' => 1000,
        'refund' => 998,
    ]);

    $response->assertSessionHasNoErrors();

    $sale = Sale::firstOrFail();

    expect((float) $sale->total)->toBe(200.0)
        ->and((float) $sale->received_amount)->toBe(1000.0)
        ->and((float) $sale->refund_amount)->toBe(800.0)
        ->and($sale->invoice_no)->toMatch('/^INV-\d{4}-\d{6}$/');

    expect($batch->fresh()->sold_qty)->toBe(2)
        ->and($medicine->fresh()->qty)->toBe(8);

    $item = SaleItem::firstOrFail();

    expect((float) $item->unit_price)->toBe(100.0)
        ->and((float) $item->subtotal)->toBe(200.0)
        ->and($item->purchased_item_id)->toBe($batch->id);

    $movement = StockMovement::where('type', StockMovement::TYPE_SALE)->firstOrFail();

    expect($movement->quantity)->toBe(-2)
        ->and($movement->balance_after)->toBe(8)
        ->and($movement->reference_type)->toBe('sale')
        ->and($movement->reference_id)->toBe($sale->id);
});

it('rejects a sale when stock is insufficient and writes nothing', function () {
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 1]);

    $response = $this->actingAs(cashier())->post('/cashier/pos/complete-sale', [
        'cart' => [
            ['id' => $medicine->id, 'quantity' => 2],
        ],
        'received' => 500,
    ]);

    $response->assertSessionHasErrors('error');

    expect(Sale::count())->toBe(0)
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(1);
});

it('rejects a sale when the received cash is less than the total', function () {
    $medicine = Medicine::factory()->create(['selling_price' => 100]);
    PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $response = $this->actingAs(cashier())->post('/cashier/pos/complete-sale', [
        'cart' => [
            ['id' => $medicine->id, 'quantity' => 2],
        ],
        'received' => 100,
    ]);

    $response->assertSessionHasErrors('received');

    expect(Sale::count())->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(5);
});

it('merges duplicate cart lines for the same medicine', function () {
    $medicine = Medicine::factory()->create(['selling_price' => 100]);
    PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);

    $this->actingAs(cashier())->post('/cashier/pos/complete-sale', [
        'cart' => [
            ['id' => $medicine->id, 'quantity' => 1],
            ['id' => $medicine->id, 'quantity' => 2],
        ],
        'received' => 300,
    ])->assertSessionHasNoErrors();

    expect((float) Sale::firstOrFail()->total)->toBe(300.0)
        ->and($medicine->fresh()->qty)->toBe(7);
});

it('rejects duplicate cart lines whose combined quantity exceeds stock', function () {
    $medicine = Medicine::factory()->create(['selling_price' => 100]);
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 3]);

    $response = $this->actingAs(cashier())->post('/cashier/pos/complete-sale', [
        'cart' => [
            ['id' => $medicine->id, 'quantity' => 2],
            ['id' => $medicine->id, 'quantity' => 2],
        ],
        'received' => 1000,
    ]);

    $response->assertSessionHasErrors('error');

    expect(Sale::count())->toBe(0)
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(3);
});
