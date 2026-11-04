<?php

use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/**
 * Build a completed shop sale (the POS endpoint is covered by PosSaleTest).
 *
 * @return array{0: Sale, 1: User, 2: Medicine, 3: PurchasedItem}
 */
function makeReturnableSale(int $quantity = 5, float $price = 100.0): array
{
    $cashier = User::factory()->cashier()->create();
    $medicine = Medicine::factory()->create(['selling_price' => $price]);
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => $quantity]);

    $sale = Sale::create([
        'invoice_no' => 'INV-TEST-'.Str::upper(Str::random(8)),
        'sale_by' => $cashier->id,
        'total' => $quantity * $price,
        'received_amount' => $quantity * $price,
        'refund_amount' => 0,
    ]);

    DB::transaction(function () use ($sale, $medicine, $quantity, $price) {
        $allocations = app(InventoryService::class)->deduct(
            $medicine->fresh(),
            $quantity,
            StockMovement::TYPE_SALE,
            $sale,
            $sale->sale_by,
        );

        foreach ($allocations as $allocation) {
            SaleItem::create([
                'sale_id' => $sale->id,
                'medicine_id' => $medicine->id,
                'purchased_item_id' => $allocation['purchased_item_id'],
                'quantity' => $allocation['quantity'],
                'unit_price' => $price,
                'subtotal' => $allocation['quantity'] * $price,
            ]);
        }
    });

    return [$sale->fresh(), $cashier, $medicine, $batch];
}

/**
 * @return array<string, mixed>
 */
function returnPayload(SaleItem $item, int $quantity, bool $restock = true): array
{
    return [
        'items' => [
            [
                'sale_item_id' => $item->id,
                'quantity' => $quantity,
                'restock' => $restock,
            ],
        ],
        'refund_method' => 'cash',
        'reason' => 'Customer changed their mind',
    ];
}

it('restocks a partial return into the original batch and records the refund', function () {
    [$sale, $cashier, $medicine, $batch] = makeReturnableSale(5, 100);
    $item = $sale->items()->firstOrFail();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 2))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $saleReturn = SaleReturn::firstOrFail();

    expect($saleReturn->return_no)->toMatch('/^RET-\d{4}-\d{6}$/')
        ->and((float) $saleReturn->total)->toBe(200.0)
        ->and($saleReturn->refund_method)->toBe('cash')
        ->and($saleReturn->processed_by)->toBe($cashier->id);

    expect($item->fresh()->returned_qty)->toBe(2)
        ->and($batch->fresh()->sold_qty)->toBe(3)
        ->and($medicine->fresh()->qty)->toBe(2)
        ->and((float) $sale->fresh()->refunded_total)->toBe(200.0);

    $movement = StockMovement::where('type', StockMovement::TYPE_SALE_RETURNED)->firstOrFail();

    expect($movement->quantity)->toBe(2)
        ->and($movement->balance_after)->toBe(2)
        ->and($movement->reference_type)->toBe('sale_return')
        ->and($movement->reference_id)->toBe($saleReturn->id);
});

it('leaves stock untouched when a line is not restocked', function () {
    [$sale, $cashier, $medicine, $batch] = makeReturnableSale(5, 100);
    $item = $sale->items()->firstOrFail();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 2, false))
        ->assertSessionHasNoErrors();

    expect($batch->fresh()->sold_qty)->toBe(5)
        ->and($medicine->fresh()->qty)->toBe(0)
        ->and($item->fresh()->returned_qty)->toBe(2)
        ->and(SaleReturnItem::firstOrFail()->restocked)->toBeFalse()
        ->and(StockMovement::where('type', StockMovement::TYPE_SALE_RETURNED)->count())->toBe(0);
});

it('refuses to return more than the remaining quantity', function () {
    [$sale, $cashier, $medicine, $batch] = makeReturnableSale(5, 100);
    $item = $sale->items()->firstOrFail();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 6))
        ->assertSessionHasErrors('items');

    expect(SaleReturn::count())->toBe(0)
        ->and($item->fresh()->returned_qty)->toBe(0)
        ->and($batch->fresh()->sold_qty)->toBe(5)
        ->and($medicine->fresh()->qty)->toBe(0);
});

it('allows several returns until the line is exhausted', function () {
    [$sale, $cashier, $medicine, $batch] = makeReturnableSale(5, 100);
    $item = $sale->items()->firstOrFail();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 3))
        ->assertSessionHasNoErrors();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 2))
        ->assertSessionHasNoErrors();

    expect($item->fresh()->returned_qty)->toBe(5)
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(5)
        ->and((float) $sale->fresh()->refunded_total)->toBe(500.0)
        ->and(SaleReturn::count())->toBe(2);

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 1))
        ->assertSessionHasErrors('items');

    expect(SaleReturn::count())->toBe(2);
});

it('never trusts prices sent by the client', function () {
    [$sale, $cashier] = makeReturnableSale(5, 100);
    $item = $sale->items()->firstOrFail();

    $payload = returnPayload($item, 2);
    $payload['items'][0]['unit_price'] = 1;
    $payload['items'][0]['subtotal'] = 2;

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", $payload)
        ->assertSessionHasNoErrors();

    expect((float) SaleReturn::firstOrFail()->total)->toBe(200.0);
});

it('rejects lines that belong to another sale', function () {
    [$saleA, $cashierA] = makeReturnableSale(2, 100);
    [$saleB] = makeReturnableSale(2, 100);
    $foreignItem = $saleB->items()->firstOrFail();

    $this->actingAs($cashierA)
        ->post("/sales/{$saleA->id}/return", [
            'items' => [
                [
                    'sale_item_id' => $foreignItem->id,
                    'quantity' => 1,
                    'restock' => true,
                ],
            ],
            'refund_method' => 'cash',
        ])
        ->assertSessionHasErrors('items');

    expect(SaleReturn::count())->toBe(0)
        ->and($foreignItem->fresh()->returned_qty)->toBe(0);
});

it('lets an admin process a return on a cashier sale', function () {
    [$sale] = makeReturnableSale(2, 100);
    $admin = User::factory()->admin()->create();
    $item = $sale->items()->firstOrFail();

    $this->actingAs($admin)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 1))
        ->assertSessionHasNoErrors();

    expect(SaleReturn::count())->toBe(1)
        ->and((float) $sale->fresh()->refunded_total)->toBe(100.0);
});

it('shows the remaining returnable quantity on the form', function () {
    [$sale, $cashier] = makeReturnableSale(5, 100);

    $this->actingAs($cashier)
        ->get("/sales/{$sale->id}/return")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('returns/Create')
            ->where('sale.items.0.returnable_qty', 5)
            ->where('sale.items.0.can_restock', true));
});

it('lets cashiers and admins see returns but not customers', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();
    $customer = User::factory()->create();

    $this->get('/returns')->assertRedirect(route('login'));
    $this->actingAs($cashier)->get('/returns')->assertOk();
    $this->actingAs($admin)->get('/returns')->assertOk();
    $this->actingAs($customer)->get('/returns')->assertForbidden();
});

it('renders a printable credit note', function () {
    [$sale, $cashier] = makeReturnableSale(2, 100);
    $item = $sale->items()->firstOrFail();

    $this->actingAs($cashier)
        ->post("/sales/{$sale->id}/return", returnPayload($item, 1));

    $saleReturn = SaleReturn::firstOrFail();

    $this->actingAs($cashier)
        ->get("/returns/{$saleReturn->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
