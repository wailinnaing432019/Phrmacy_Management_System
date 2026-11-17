<?php

namespace App\Http\Resources\Medicine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PurchasedItem
 */
class PurchasedItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'qty' => $this->qty,
            'sold_qty' => $this->sold_qty,
            'available_qty' => $this->qty - $this->sold_qty,
            'unit_price' => $this->unit_price,
            'mfd_date' => $this->mfd_date
                ? \Carbon\Carbon::parse($this->mfd_date)->format('Y-m-d')
                : null,
            'exp_date' => $this->exp_date
                ? \Carbon\Carbon::parse($this->exp_date)->format('Y-m-d')
                : null,
        ];
    }
}
