<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('creates customers through the factory with the expected schema', function () {
    $customer = Customer::factory()->create([
        'name' => 'Daw Aye',
        'phone' => '09123456789',
    ]);

    expect($customer->exists)->toBeTrue()
        ->and($customer->name)->toBe('Daw Aye')
        ->and($customer->phone)->toBe('09123456789')
        ->and($customer->email_verified_at)->not->toBeNull()
        ->and(Schema::hasColumn('customers', 'deleted_at'))->toBeTrue()
        ->and(Schema::hasColumn('customers', 'google_id'))->toBeTrue();
});

it('authenticates customers on the customer guard, isolated from staff', function () {
    $customer = Customer::factory()->create();
    $staff = User::factory()->admin()->create();

    expect(Auth::guard('customer')->attempt([
        'email' => $customer->email,
        'password' => 'password',
    ]))->toBeTrue();

    expect(Auth::guard('customer')->user()->is($customer))->toBeTrue()
        ->and(Auth::guard('web')->check())->toBeFalse();

    // A staff account cannot authenticate against the customer guard.
    Auth::guard('customer')->logout();

    expect(Auth::guard('customer')->attempt([
        'email' => $staff->email,
        'password' => 'password',
    ]))->toBeFalse();
});

it('registers the customer guard, provider, and password broker', function () {
    expect(config('auth.guards.customer.driver'))->toBe('session')
        ->and(config('auth.guards.customer.provider'))->toBe('customers')
        ->and(config('auth.providers.customers.driver'))->toBe('eloquent')
        ->and(config('auth.providers.customers.model'))->toBe(Customer::class)
        ->and(config('auth.passwords.customers.provider'))->toBe('customers')
        ->and(config('auth.passwords.customers.table'))->toBe('customer_password_reset_tokens')
        ->and(Schema::hasTable('customer_password_reset_tokens'))->toBeTrue();
});

it('soft deletes customers and records activity', function () {
    $customer = Customer::factory()->create();

    expect($customer->activities()->where('event', 'created')->exists())->toBeTrue();

    $customer->delete();

    expect($customer->trashed())->toBeTrue()
        ->and($customer->activities()->where('event', 'deleted')->exists())->toBeTrue();

    $this->assertSoftDeleted('customers', ['id' => $customer->id]);
});

it('links orders to customers through the nullable customer_id foreign key', function () {
    $customer = Customer::factory()->create();

    $linked = Order::factory()->create(['customer_id' => $customer->id]);
    $guest = Order::factory()->create(['customer_id' => null]);

    expect($linked->customer->is($customer))->toBeTrue()
        ->and($customer->orders()->count())->toBe(1)
        ->and($guest->customer)->toBeNull()
        ->and(Schema::hasColumn('orders', 'customer_id'))->toBeTrue();
});
