<?php

namespace App\Http\Resources\Medicine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape used to pre-fill the admin medicine edit form.
 *
 * @mixin \App\Models\Medicine
 */
class MedicineEditResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $availableQty = $this->purchasedItems
            ->sum(fn ($batch) => $batch->qty - $batch->sold_qty);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'selling_price' => $this->selling_price,
            'qty' => $availableQty,
            'stock_limit' => $this->stock_limit,
            'medicine_barcode' => $this->medicine_barcode,
            'category_id' => $this->category_id,
            'created_at' => $this->created_at->format('d-m-Y'),
            'updated_at' => $this->updated_at->format('d-m-Y'),
            'image' => $this->image,
            'status' => $this->status,
        ];
    }
}
