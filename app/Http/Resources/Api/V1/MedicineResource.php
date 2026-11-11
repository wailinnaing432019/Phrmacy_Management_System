<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Medicine
 */
class MedicineResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'selling_price' => (float) $this->selling_price,
            'available_qty' => (int) ($this->sellable_qty ?? $this->sellableQty()),
            'stock_limit' => (int) $this->stock_limit,
            'medicine_barcode' => $this->medicine_barcode,
            'category_id' => $this->category_id,
            'category_name' => $this->category?->name,
            'image_url' => $this->image ? asset('storage/'.$this->image) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
