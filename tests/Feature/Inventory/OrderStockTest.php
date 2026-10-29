<?php

use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemStock;
use App\Models\PurchasedItem;
use App\Models\StockMovement;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function pendingOrder(Medicine $medicine, int $qty = 4): Order
{
    $order = Order::factory()->for(User::factory())->create(['status' => 'pending']);

    OrderItem::factory()->for($order)->for($medicine)->create(['qty' => $qty]);

    return $order;
}

it('deducts stock once when an order is completed', function () {
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);
    $order = pendingOrder($medicine, 4);

    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'completed'])
        ->assertSessionHasNoErrors();

    expect($batch->fresh()->sold_qty)->toBe(4)
        ->and($medicine->fresh()->qty)->toBe(6)
        ->and($order->fresh()->status)->toBe('completed')
        ->and(OrderItemStock::count())->toBe(1);

    // Completing an already-completed order must not deduct again.
    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'completed'])
        ->assertSessionHasNoErrors();

    expect($batch->fresh()->sold_qty)->toBe(4)
        ->and($medicine->fresh()->qty)->toBe(6);
});

it('restores stock exactly when a completed order is cancelled', function () {
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 10]);
    $order = pendingOrder($medicine, 4);

    $this->actingAs($admin)->put("/orders/{$order->id}", ['status' => 'completed']);
    $this->actingAs($admin)->put("/orders/{$order->id}", ['status' => 'cancelled'])
        ->assertSessionHasNoErrors();

    expect($batch->fresh()->sold_qty)->toBe(0)
        ->and($medicine->fresh()->qty)->toBe(10)
        ->and($order->fresh()->status)->toBe('cancelled')
        ->and(OrderItemStock::count())->toBe(0);

    $types = StockMovement::orderBy('id')->pluck('type')->all();

    expect($types)->toBe([StockMovement::TYPE_ORDER, StockMovement::TYPE_ORDER_CANCELLED]);
});

it('refuses to complete an order without enough stock', function () {
    $admin = User::factory()->admin()->create();
    $medicine = Medicine::factory()->create();
    $batch = PurchasedItem::factory()->for($medicine)->create(['qty' => 2]);
    $order = pendingOrder($medicine, 5);

    $this->actingAs($admin)
        ->put("/orders/{$order->id}", ['status' => 'completed'])
        ->assertSessionHas('error');

    expect($order->fresh()->status)->toBe('pending')
        ->and($batch->fresh()->sold_qty)->toBe(0)
        ->and(OrderItemStock::count())->toBe(0);
});
