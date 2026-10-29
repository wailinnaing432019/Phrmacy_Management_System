<?php

use App\Models\Medicine;
use App\Models\Order;
use App\Models\PurchasedItem;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function checkoutPayload(Medicine $medicine, int $qty, float $tamperedPrice = 1): array
{
    return [
        'name' => 'Customer One',
        'email' => 'customer@example.com',
        'phone' => '09123456789',
        'address' => 'No. 1, Main Road',
        'payment_method' => 'cod',
        'transaction_id' => null,
        'items' => [
            ['id' => $medicine->id, 'qty' => $qty, 'price' => $tamperedPrice],
        ],
    ];
}

it('places an order using database prices and a sequential order number', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create(['selling_price' => 250]);
    PurchasedItem::factory()->for($medicine)->create(['qty' => 5]);

    $this->actingAs($customer)
        ->post('/checkout', checkoutPayload($medicine, 2))
        ->assertSessionHasNoErrors();

    $order = Order::firstOrFail();

    expect((float) $order->total)->toBe(500.0)
        ->and($order->order_no)->toMatch('/^ORD-\d{4}-\d{6}$/')
        ->and($order->status)->toBe('pending')
        ->and($order->items()->count())->toBe(1)
        ->and((float) $order->items()->first()->price)->toBe(250.0);
});

it('rejects an order that asks for more than the available stock', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create();
    PurchasedItem::factory()->for($medicine)->create(['qty' => 3]);

    $this->actingAs($customer)
        ->post('/checkout', checkoutPayload($medicine, 4))
        ->assertSessionHasErrors('items');

    expect(Order::count())->toBe(0);
});

it('ignores expired stock when checking availability', function () {
    $customer = User::factory()->create();
    $medicine = Medicine::factory()->create();
    PurchasedItem::factory()->for($medicine)->expired()->create(['qty' => 10]);

    $this->actingAs($customer)
        ->post('/checkout', checkoutPayload($medicine, 1))
        ->assertSessionHasErrors('items');

    expect(Order::count())->toBe(0);
});
