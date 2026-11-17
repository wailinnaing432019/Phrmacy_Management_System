<?php

use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Models\User;
use App\Services\InventoryService;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/**
 * Create a medicine with the given batches and sync its cached totals.
 *
 * @param  array<int, array<string, mixed>>  $batches
 */
function makeAvailabilityMedicine(array $batches, string $status = 'available'): Medicine
{
    $medicine = Medicine::factory()->create(['status' => $status]);

    foreach ($batches as $batch) {
        PurchasedItem::factory()->for($medicine)->create($batch);
    }

    app(InventoryService::class)->syncQuantity($medicine);

    return $medicine->refresh();
}

it('shows only sellable stock on every storefront listing', function () {
    $medicine = makeAvailabilityMedicine([
        ['qty' => 10, 'sold_qty' => 0, 'exp_date' => now()->subDay()],
        ['qty' => 3, 'sold_qty' => 1, 'exp_date' => now()->addMonth()],
    ]);

    expect($medicine->qty)->toBe(12)
        ->and($medicine->sellableQty())->toBe(2);

    $this->get('/customers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/Index')
            ->where('medicines.0.qty', 2));

    $this->get('/customers/products')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('medicines.data.0.qty', 2));

    $this->get("/customers/product/{$medicine->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/Show')
            ->where('medicine.qty', 2));
});

it('hides medicines with no sellable batches from storefront listings', function () {
    $sellable = makeAvailabilityMedicine([
        ['qty' => 1, 'sold_qty' => 0, 'exp_date' => null],
    ]);

    makeAvailabilityMedicine([
        ['qty' => 5, 'sold_qty' => 0, 'exp_date' => now()->subDay()],
    ]);

    Medicine::factory()->create(['status' => 'available']);

    makeAvailabilityMedicine([
        ['qty' => 5, 'sold_qty' => 0, 'exp_date' => now()->addMonth()],
    ], 'not_available');

    $this->get('/customers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('medicines', 1)
            ->where('medicines.0.id', $sellable->id));

    $this->get('/customers/products')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('medicines.data', 1)
            ->where('medicines.data.0.id', $sellable->id));
});

it('counts batches expiring today but never expired batches', function () {
    $medicine = makeAvailabilityMedicine([
        ['qty' => 2, 'sold_qty' => 0, 'exp_date' => today()],
        ['qty' => 3, 'sold_qty' => 0, 'exp_date' => null],
        ['qty' => 4, 'sold_qty' => 0, 'exp_date' => now()->subDay()],
    ]);

    expect($medicine->sellableQty())->toBe(5);
});

it('returns sellable quantity to the cashier POS lookup', function () {
    $cashier = User::factory()->cashier()->create();

    $medicine = makeAvailabilityMedicine([
        ['qty' => 10, 'sold_qty' => 0, 'exp_date' => now()->subDay()],
        ['qty' => 4, 'sold_qty' => 1, 'exp_date' => now()->addMonth()],
    ]);

    $this->actingAs($cashier)
        ->get("/cashier/pos/lookup/{$medicine->medicine_barcode}")
        ->assertOk()
        ->assertJsonPath('available_qty', 3)
        ->assertJsonPath('qty', 3);
});

it('shows physical and sellable stock in the admin medicine list', function () {
    $admin = User::factory()->admin()->create();

    $medicine = makeAvailabilityMedicine([
        ['qty' => 10, 'sold_qty' => 0, 'exp_date' => now()->subDay()],
        ['qty' => 3, 'sold_qty' => 1, 'exp_date' => now()->addMonth()],
    ]);

    $this->actingAs($admin)
        ->get('/medicines')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine/Index')
            ->where('medicines.data.0.id', $medicine->id)
            ->where('medicines.data.0.qty', 12)
            ->where('medicines.data.0.sellable_qty', 2));
});
