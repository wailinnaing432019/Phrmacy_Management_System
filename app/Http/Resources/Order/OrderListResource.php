<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Row shape for the admin order list.
 *
 * @mixin \App\Models\Order
 */
class OrderListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'total' => (float) $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'transaction_id' => $this->transaction_id,
            'created_at' => $this->created_at,
            'user' => [
                'name' => $this->customer?->name ?? $this->name,
            ],
            'customer' => [
                'name' => $this->customer?->name ?? $this->name,
            ],
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine' => [
                    'name' => $item->medicine?->name,
                ],
                'qty' => $item->qty,
                'price' => $item->price,
            ]),
        ];
    }
}
