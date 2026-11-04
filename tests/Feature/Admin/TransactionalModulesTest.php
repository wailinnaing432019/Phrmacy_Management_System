<?php

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PurchasedItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/**
 * Build a completed shop sale with one line.
 */
function makeReportSale(User $cashier, Medicine $medicine, string $invoiceNo = 'INV-TEST-000001'): Sale
{
    $sale = Sale::create([
        'invoice_no' => $invoiceNo,
        'total' => 100,
        'sale_by' => $cashier->id,
        'received_amount' => 100,
        'refund_amount' => 0,
    ]);

    SaleItem::create([
        'sale_id' => $sale->id,
        'medicine_id' => $medicine->id,
        'purchased_item_id' => null,
        'quantity' => 1,
        'returned_qty' => 0,
        'unit_price' => 100,
        'subtotal' => 100,
    ]);

    return $sale;
}

it('renders the admin sales report and a shop sale detail', function () {
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create(['name' => 'Report Medicine']);
    $sale = makeReportSale($admin, $medicine);

    $this->actingAs($admin)
        ->get('/sales')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sale/Index')
            ->where('sales.data.0.invoice_no', $sale->invoice_no)
            ->where('sales.data.0.total', 100));

    $this->actingAs($admin)
        ->get("/sales/{$sale->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sale/Show')
            ->where('sale.invoice_no', $sale->invoice_no)
            ->where('sale.is_online', false)
            ->where('sale.items.0.medicine_name', 'Report Medicine'));
});

it('renders online orders through the sales report', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create(['total' => 250]);
    OrderItem::factory()->for($order)->create(['qty' => 2, 'price' => 125]);

    $this->actingAs($admin)
        ->get('/sales?source=online')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sale/Index')
            ->where('sales.data.0.order_no', $order->order_no)
            ->where('source', 'online'));

    $this->actingAs($admin)
        ->get("/sales/{$order->id}?source=online")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('sale/Show')
            ->where('sale.is_online', true)
            ->where('sale.invoice_no', $order->order_no));
});

it('renders the cashier sale list, detail, and dashboard', function () {
    $cashier = User::factory()->cashier()->create();
    $medicine = Medicine::factory()->create();
    $sale = makeReportSale($cashier, $medicine);

    $this->actingAs($cashier)
        ->get('/cashier/sale')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/Sale')
            ->where('sales.data.0.invoice_no', $sale->invoice_no)
            ->where('sales.data.0.user.name', $cashier->name));

    $this->actingAs($cashier)
        ->get("/cashier/sale/{$sale->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/SaleShow')
            ->where('sale.id', $sale->id));

    $this->actingAs($cashier)
        ->get('/cashier/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cashier/Dashboard')
            ->has('total_sales_today')
            ->has('daily_sales')
            ->has('medicine_alerts'));
});

it('renders the admin dashboard metrics', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('total_sales_today')
            ->has('total_purchases_today')
            ->has('total_revenue')
            ->has('total_cost')
            ->has('top_medicines'));
});

it('lists staff users and soft deletes them with an activity log', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create(['name' => 'Cashier One']);

    $this->actingAs($admin)
        ->get('/users?role=cashier')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user/Index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Cashier One')
            ->where('users.data.0.role', 'cashier'));

    $this->actingAs($admin)
        ->delete("/users/{$cashier->id}")
        ->assertRedirect();

    $this->assertSoftDeleted('users', ['id' => $cashier->id]);
    expect($cashier->activities()->where('event', 'deleted')->exists())->toBeTrue();
});

it('updates a batch and records the stock adjustment', function () {
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create(['qty' => 5]);
    $batch = PurchasedItem::factory()->for($medicine)->create([
        'qty' => 5,
        'sold_qty' => 0,
    ]);

    $this->actingAs($admin)
        ->put("/purchased-items/{$batch->id}", [
            'qty' => 8,
            'sold_qty' => 0,
            'available_qty' => 8,
            'unit_price' => 100,
            'mfd_date' => '2026-01-01',
            'exp_date' => '2027-01-01',
        ])
        ->assertRedirect();

    expect($batch->refresh()->qty)->toBe(8)
        ->and($medicine->refresh()->qty)->toBe(8);

    expect(StockMovement::where('medicine_id', $medicine->id)
        ->where('type', StockMovement::TYPE_ADJUSTMENT)
        ->exists())->toBeTrue();
});
