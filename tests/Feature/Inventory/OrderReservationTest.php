<?php

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItemStock;
use App\Models\PurchasedItem;
use App\Models\StockMovement;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function orderReservationPayload(Medicine $medicine, int $qty): array
{
    return [
        'name' => 'Reservation Customer',
        'email' => 'reservation@example.com',
        'phone' => '09123456789',
        'address' => 'No. 1, Main Road',
        'payment_method' => 'cod',
        'transaction_id' => null,
        'items' => [
            ['id' => $medicine->id, 'qty' => $qty],
        ],
    ];
}

it('reserves stock when an online order is placed', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create(['selling_price' => 100]);
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    expect($batch->fresh()->sold_qty)->toBe(2)
        ->and($medicine->fresh()->qty)->toBe(3)
        ->and($order->reserved_at)->not->toBeNull()
        ->and($order->reservation_expires_at)->not->toBeNull()
        ->and($order->reservation_expires_at->between(now()->addHours(23), now()->addHours(25)))->toBeTrue()
        ->and(OrderItemStock::count())->toBe(1)
        ->and(StockMovement::where('type', StockMovement::TYPE_ORDER_RESERVED)->count())->toBe(1);
});

it('prevents two customers from reserving the same last item', function () {
    $firstCustomer = User::factory()->create();
    $secondCustomer = User::factory()->create();
    $medicine = Medicine::factory()->create();
    PurchasedItem::factory()->for($medicine)->create(['qty' => 1]);

    $this->actingAs($firstCustomer)
        ->post('/checkout', orderReservationPayload($medicine, 1))
        ->assertSessionHasNoErrors();

    $this->actingAs($secondCustomer)
        ->post('/checkout', orderReservationPayload($medicine, 1))
        ->assertSessionHasErrors('items');

    expect(Order::count())->toBe(1)
        ->and($medicine->fresh()->qty)->toBe(0)
        ->and(OrderItemStock::count())->toBe(1);
});

it('restores stock when a pending order is cancelled', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'cancelled'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('cancelled')
        ->and($order->fresh()->cancellation_reason)->toBe('manual')
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(5)
        ->and(OrderItemStock::count())->toBe(0)
        ->and(StockMovement::orderBy('id')->pluck('type')->all())
        ->toBe([StockMovement::TYPE_ORDER_RESERVED, StockMovement::TYPE_ORDER_CANCELLED]);
});

it('keeps the reservation when a pending order is completed', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'completed'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('completed')
        ->and($order->fresh()->reservation_expires_at)->toBeNull()
        ->and($batch->fresh()->sold_qty)->toBe(2)
        ->and($medicine->fresh()->qty)->toBe(3)
        ->and(OrderItemStock::count())->toBe(1)
        ->and(StockMovement::orderBy('id')->pluck('type')->all())
        ->toBe([StockMovement::TYPE_ORDER_RESERVED]);
});

it('restores stock when a completed order is cancelled', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    $this->actingAs($admin)->put("/orders/{$order->id}", ['status' => 'completed']);
    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'cancelled'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('cancelled')
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(5)
        ->and(OrderItemStock::count())->toBe(0)
        ->and(StockMovement::orderBy('id')->pluck('type')->all())
        ->toBe([StockMovement::TYPE_ORDER_RESERVED, StockMovement::TYPE_ORDER_CANCELLED]);
});

it('auto-cancels and releases expired pending orders', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();
    $order->update(['reservation_expires_at' => now()->subMinute()]);

    $this->artisan('orders:release-expired')->assertExitCode(0);

    expect($order->fresh()->status)->toBe('cancelled')
        ->and($order->fresh()->cancellation_reason)->toBe('expired')
        ->and($order->fresh()->reservation_expires_at)->toBeNull()
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(5)
        ->and(OrderItemStock::count())->toBe(0)
        ->and(StockMovement::orderBy('id')->pluck('type')->all())
        ->toBe([StockMovement::TYPE_ORDER_RESERVED, StockMovement::TYPE_ORDER_EXPIRED]);
});

it('keeps active reservations during the expiry sweep', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create();
    PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    $this->artisan('orders:release-expired')->assertExitCode(0);

    expect($order->fresh()->status)->toBe('pending')
        ->and($order->fresh()->reservation_expires_at)->not->toBeNull()
        ->and($medicine->fresh()->qty)->toBe(3)
        ->and(OrderItemStock::count())->toBe(1);
});

it('re-reserves stock when a cancelled order is reopened', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    $this->actingAs($admin)->put("/orders/{$order->id}", ['status' => 'cancelled']);
    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'pending'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe('pending')
        ->and($order->fresh()->cancellation_reason)->toBeNull()
        ->and($order->fresh()->reservation_expires_at)->not->toBeNull()
        ->and($batch->fresh()->sold_qty)->toBe(2)
        ->and($medicine->fresh()->qty)->toBe(3)
        ->and(OrderItemStock::count())->toBe(1);
});

it('refuses to reopen a cancelled order when the stock is gone', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    PurchasedItem::factory()->for($medicine)->create(['qty' => 1]);

    $this->actingAs($customer)
        ->post('/checkout', orderReservationPayload($medicine, 1))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();
    $this->actingAs($admin)->put("/orders/{$order->id}", ['status' => 'cancelled']);

    $this->actingAs($otherCustomer)
        ->post('/checkout', orderReservationPayload($medicine, 1))
        ->assertSessionHasNoErrors();

    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'pending'])
        ->assertSessionHas('error');

    expect($order->fresh()->status)->toBe('cancelled')
        ->and($medicine->fresh()->qty)->toBe(0);
});
