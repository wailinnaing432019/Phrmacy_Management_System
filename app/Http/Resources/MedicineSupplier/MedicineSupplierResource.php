<?php

namespace App\Http\Resources\MedicineSupplier;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\MedicineSupplier
 */
class MedicineSupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medicine_id' => $this->medicine_id,
            'supplier_id' => $this->supplier_id,
            'supplier_price' => $this->supplier_price,
            'is_preferred' => (bool) $this->is_preferred,
            'medicine' => [
                'id' => $this->medicine?->id,
                'name' => $this->medicine?->name,
            ],
            'supplier' => [
                'id' => $this->supplier?->id,
                'name' => $this->supplier?->name,
            ],
        ];
    }
}
