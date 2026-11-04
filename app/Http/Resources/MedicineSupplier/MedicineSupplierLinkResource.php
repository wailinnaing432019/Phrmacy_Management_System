<?php

namespace App\Http\Resources\MedicineSupplier;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Existing link summary used by the medicine-supply edit form.
 *
 * @mixin \App\Models\MedicineSupplier
 */
class MedicineSupplierLinkResource extends JsonResource
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
        ];
    }
}
