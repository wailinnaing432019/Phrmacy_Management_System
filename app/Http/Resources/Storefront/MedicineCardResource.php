<?php

namespace App\Http\Resources\Storefront;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Medicine
 */
class MedicineCardResource extends JsonResource
{
    /**
     * Transform the resource into an array matching the storefront card props.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'selling_price' => $this->selling_price,
            'image' => $this->image ? asset('storage/'.$this->image) : null,
            'category' => $this->category->name ?? '—',
            'qty' => (int) ($this->sellable_qty ?? $this->sellableQty()),
            'stock_limit' => $this->stock_limit,
            'medicine_barcode' => $this->medicine_barcode,
        ];
    }
}
