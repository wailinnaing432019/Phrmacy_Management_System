<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicine>
 */
class MedicineFactory extends Factory
{
    protected $model = Medicine::class;

    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'category_id' => Category::factory(),
            'description' => fake()->sentence(),
            'selling_price' => 100.00,
            'qty' => 0,
            'stock_limit' => 5,
            'status' => 'available',
            'medicine_barcode' => 'MED'.fake()->unique()->numerify('######'),
            'image' => null,
        ];
    }
}
