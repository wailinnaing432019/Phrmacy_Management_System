<?php

namespace App\Http\Resources\Medicine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Detail shape for the admin medicine show page.
 *
 * @mixin \App\Models\Medicine
 */
class MedicineDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'selling_price' => $this->selling_price,
            'medicine_barcode' => $this->medicine_barcode,
            'stock_limit' => $this->stock_limit,
            'sellable_qty' => $this->sellableQty(),
            'image' => $this->image ? asset('storage/'.$this->image) : null,
            'category' => $this->category->name ?? '—',
            'created_at' => $this->created_at->format('d-m-Y'),
            'updated_at' => $this->updated_at->format('d-m-Y'),
        ];
    }
}
