<?php

namespace App\Http\Resources\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Detail shape for a shop sale (admin and cashier).
 *
 * @mixin \App\Models\Sale
 */
class SaleShowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_online' => false,
            'invoice_no' => $this->invoice_no,
            'sale_by' => $this->user->name ?? 'N/A',
            'total' => (float) $this->total,
            'refunded_total' => (float) $this->refunded_total,
            'received_amount' => (float) $this->received_amount,
            'refund_amount' => (float) $this->refund_amount,
            'payment_method' => $this->payment_method,
            'created_at' => $this->created_at->format('d-m-Y H:i'),
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'returned_qty' => $item->returned_qty,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ]),
        ];
    }
}
