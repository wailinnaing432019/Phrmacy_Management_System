<?php

namespace App\Http\Resources\CustomerOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\OrderItem
 */
class CustomerOrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array matching the order items table on MyOrderItems.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medicine_name' => $this->medicine?->name ?? '',
            'qty' => $this->qty,
            'price' => $this->price,
        ];
    }
}
