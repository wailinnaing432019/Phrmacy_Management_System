<?php

namespace App\Http\Resources\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Detail shape for an online order shown through the sale page.
 *
 * @mixin \App\Models\Order
 */
class OrderSaleShowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_online' => true,
            'refunded_total' => 0,
            'invoice_no' => $this->order_no,
            'sale_by' => $this->user->name ?? $this->name ?? 'N/A',
            'total' => $this->total,
            'payment_method' => $this->payment_method,
            'created_at' => $this->updated_at->format('d-m-Y H:s'),
            'items' => $this->items->map(fn ($item) => [
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->qty,
                'unit_price' => $item->price,
                'subtotal' => $item->qty * $item->price,
            ]),
        ];
    }
}
