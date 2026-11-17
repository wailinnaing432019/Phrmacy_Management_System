<?php

use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineSupplier;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('creates, updates, and soft deletes a category with activity logs', function () {
    $this->actingAs($this->admin)
        ->post('/categories', [
            'name' => 'Antibiotics',
            'description' => 'Bacteria killers',
            'trending' => true,
        ])
        ->assertRedirect(route('categories.index'));

    $category = Category::where('name', 'Antibiotics')->firstOrFail();

    expect($category->activities()->where('event', 'created')->exists())->toBeTrue();

    $this->actingAs($this->admin)
        ->put("/categories/{$category->id}", [
            'name' => 'Antibiotics Plus',
            'description' => 'Updated description',
            'trending' => false,
        ])
        ->assertRedirect(route('categories.index'));

    expect($category->refresh()->name)->toBe('Antibiotics Plus');

    $this->actingAs($this->admin)
        ->delete("/categories/{$category->id}")
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $category->id]);
    expect($category->activities()->where('event', 'deleted')->exists())->toBeTrue();
});

it('creates, updates, and soft deletes a supplier with activity logs', function () {
    $this->actingAs($this->admin)
        ->post('/suppliers', [
            'name' => 'Yangon Pharma',
            'email' => 'sales@yangon.test',
            'phone' => '0912345',
            'address' => 'Yangon',
        ])
        ->assertRedirect(route('suppliers.index'));

    $supplier = Supplier::where('name', 'Yangon Pharma')->firstOrFail();

    expect($supplier->activities()->where('event', 'created')->exists())->toBeTrue();

    $this->actingAs($this->admin)
        ->put("/suppliers/{$supplier->id}", [
            'name' => 'Yangon Pharma Co',
            'email' => 'hello@yangon.test',
            'phone' => '0999999',
            'address' => 'Mandalay',
        ])
        ->assertRedirect(route('suppliers.index'));

    expect($supplier->refresh()->name)->toBe('Yangon Pharma Co');

    $this->actingAs($this->admin)
        ->delete("/suppliers/{$supplier->id}")
        ->assertRedirect(route('suppliers.index'));

    $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    expect($supplier->activities()->where('event', 'deleted')->exists())->toBeTrue();
});

it('creates a medicine with its first batch, ledger entry, and activity log', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->admin)
        ->post('/medicines', [
            'name' => 'Amoxicillin 500mg',
            'category_id' => $category->id,
            'description' => 'Capsules',
            'selling_price' => 500,
            'qty' => 10,
            'stock_limit' => 2,
            'purchase_price' => 300,
            'status' => 'available',
            'mfd_date' => '2026-01-01',
            'exp_date' => '2027-01-01',
        ])
        ->assertRedirect(route('medicines.index'));

    $medicine = Medicine::where('name', 'Amoxicillin 500mg')->firstOrFail();

    expect($medicine->qty)->toBe(10)
        ->and($medicine->medicine_barcode)->toStartWith('MED')
        ->and($medicine->purchasedItems()->count())->toBe(1)
        ->and($medicine->activities()->where('event', 'created')->exists())->toBeTrue();

    expect(StockMovement::where('medicine_id', $medicine->id)
        ->where('type', StockMovement::TYPE_PURCHASE)
        ->exists())->toBeTrue();
});

it('updates a medicine and restocks it with a new batch', function () {
    $medicine = Medicine::factory()->create(['qty' => 0]);

    $this->actingAs($this->admin)
        ->put("/medicines/{$medicine->id}", [
            'name' => 'Updated Medicine',
            'category_id' => $medicine->category_id,
            'description' => 'Updated',
            'selling_price' => 450,
            'stock_limit' => 3,
            'status' => 'not_available',
        ])
        ->assertRedirect(route('medicines.index'));

    expect($medicine->refresh())
        ->name->toBe('Updated Medicine')
        ->selling_price->toBe('450.00')
        ->status->toBe('not_available');

    $this->actingAs($this->admin)
        ->patch("/medicines/{$medicine->id}/add-qty", [
            'qty' => 6,
            'unit_price' => 200,
            'description' => 'Restock',
            'mfd_date' => '2026-02-01',
            'exp_date' => '2027-02-01',
        ])
        ->assertRedirect(route('medicines.index'));

    expect($medicine->refresh()->qty)->toBe(6)
        ->and($medicine->purchasedItems()->count())->toBe(1);
});

it('rejects a medicine whose stock limit is not below its quantity', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->admin)
        ->from('/medicines/create')
        ->post('/medicines', [
            'name' => 'Invalid Medicine',
            'category_id' => $category->id,
            'description' => 'Capsules',
            'selling_price' => 500,
            'qty' => 5,
            'stock_limit' => 5,
            'purchase_price' => 300,
            'status' => 'available',
            'mfd_date' => '2026-01-01',
            'exp_date' => '2027-01-01',
        ])
        ->assertSessionHasErrors('stock_limit');

    expect(Medicine::where('name', 'Invalid Medicine')->exists())->toBeFalse();
});

it('soft deletes a medicine', function () {
    $medicine = Medicine::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/medicines/{$medicine->id}")
        ->assertRedirect(route('medicines.index'));

    $this->assertSoftDeleted('medicines', ['id' => $medicine->id]);
    expect($medicine->activities()->where('event', 'deleted')->exists())->toBeTrue();
});

it('links suppliers to a medicine and keeps a single preferred supplier', function () {
    $medicine = Medicine::factory()->create();

    $first = Supplier::create([
        'name' => 'Supplier One',
        'email' => 'one@example.test',
        'phone' => '111',
        'address' => 'Yangon',
    ]);

    $second = Supplier::create([
        'name' => 'Supplier Two',
        'email' => 'two@example.test',
        'phone' => '222',
        'address' => 'Mandalay',
    ]);

    $this->actingAs($this->admin)
        ->post('/medicine-supply', [
            'medicine_id' => $medicine->id,
            'supplier_id' => $first->id,
            'supplier_price' => 100,
            'is_preferred' => true,
        ])
        ->assertRedirect(route('medicine-supply.index'));

    $this->actingAs($this->admin)
        ->post('/medicine-supply', [
            'medicine_id' => $medicine->id,
            'supplier_id' => $second->id,
            'supplier_price' => 90,
            'is_preferred' => true,
        ])
        ->assertRedirect(route('medicine-supply.index'));

    expect(MedicineSupplier::where('medicine_id', $medicine->id)->count())->toBe(2)
        ->and(MedicineSupplier::where('supplier_id', $first->id)->first()->is_preferred)->toBeFalse()
        ->and(MedicineSupplier::where('supplier_id', $second->id)->first()->is_preferred)->toBeTrue();

    // Linking the same pair again updates instead of duplicating.
    $this->actingAs($this->admin)
        ->post('/medicine-supply', [
            'medicine_id' => $medicine->id,
            'supplier_id' => $first->id,
            'supplier_price' => 95,
            'is_preferred' => true,
        ]);

    expect(MedicineSupplier::where('medicine_id', $medicine->id)->count())->toBe(2)
        ->and(MedicineSupplier::where('supplier_id', $first->id)->first()->supplier_price)->toBe('95.00')
        ->and(MedicineSupplier::where('supplier_id', $second->id)->first()->is_preferred)->toBeFalse();
});

it('soft deletes a medicine-supplier link', function () {
    $medicine = Medicine::factory()->create();
    $supplier = Supplier::create([
        'name' => 'Link Supplier',
        'email' => 'link@example.test',
        'phone' => '333',
        'address' => 'Naypyidaw',
    ]);

    $link = MedicineSupplier::create([
        'medicine_id' => $medicine->id,
        'supplier_id' => $supplier->id,
        'supplier_price' => 120,
        'is_preferred' => false,
    ]);

    $this->actingAs($this->admin)
        ->delete("/medicine-supply/{$link->id}")
        ->assertRedirect(route('medicine-supply.index'));

    $this->assertSoftDeleted('medicine_suppliers', ['id' => $link->id]);
});

it('renders the master data pages with resource props', function () {
    $medicine = Medicine::factory()->create();
    $supplier = Supplier::create([
        'name' => 'Render Supplier',
        'email' => 'render@example.test',
        'phone' => '444',
        'address' => 'Yangon',
    ]);

    $link = MedicineSupplier::create([
        'medicine_id' => $medicine->id,
        'supplier_id' => $supplier->id,
        'supplier_price' => 50,
        'is_preferred' => true,
    ]);

    $this->actingAs($this->admin)
        ->get('/medicines')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine/Index')
            ->has('medicines.data', 1)
            ->has('categories'));

    $this->actingAs($this->admin)
        ->get("/medicines/{$medicine->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine/Show')
            ->where('medicine.id', $medicine->id)
            ->has('purchasedItems'));

    $this->actingAs($this->admin)
        ->get("/medicines/{$medicine->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine/Edit')
            ->where('medicine.id', $medicine->id)
            ->has('categories'));

    $this->actingAs($this->admin)
        ->get('/categories')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('category/Index')->has('categories'));

    $this->actingAs($this->admin)
        ->get('/suppliers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('supplier/Index')->has('suppliers'));

    $this->actingAs($this->admin)
        ->get('/medicine-supply')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine-supply/Index')
            ->has('medicineSuppliers', 1)
            ->where('medicineSuppliers.0.medicine.name', $medicine->name));

    $this->actingAs($this->admin)
        ->get("/medicine-supply/{$link->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('medicine-supply/Edit')
            ->where('link.id', $link->id)
            ->has('existingLinks', 1));
});
