<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Detail shape for the admin order page.
 *
 * @mixin \App\Models\Order
 */
class OrderShowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'customer' => $this->user->name ?? $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'total' => $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'created_at' => $this->created_at->format('d-m-Y H:i'),
            'items' => $this->items->map(fn ($item) => [
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'qty' => $item->qty,
                'price' => $item->price,
            ]),
        ];
    }
}
