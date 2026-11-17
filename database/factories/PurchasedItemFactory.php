<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\PurchasedItem;
use App\Services\InventoryService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchasedItem>
 */
class PurchasedItemFactory extends Factory
{
    protected $model = PurchasedItem::class;

    public function configure(): static
    {
        return $this->afterCreating(function (PurchasedItem $batch) {
            if ($batch->medicine) {
                app(InventoryService::class)->syncQuantity($batch->medicine);
            }
        });
    }

    public function definition(): array
    {
        return [
            'medicine_id' => Medicine::factory(),
            'qty' => 10,
            'sold_qty' => 0,
            'unit_price' => 50.00,
            'description' => null,
            'mfd_date' => now()->subYear(),
            'exp_date' => now()->addYear(),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'mfd_date' => now()->subYears(2),
            'exp_date' => now()->subDay(),
        ]);
    }
}
