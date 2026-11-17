<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'order_no' => 'ORD-'.fake()->unique()->numerify('########'),
            'total' => 100.00,
            'status' => 'pending',
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('09#########'),
            'address' => fake()->address(),
            'payment_method' => 'cash',
            'transaction_id' => null,
        ];
    }
}
