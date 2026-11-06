<?php

namespace App\Http\Resources\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Printable POS invoice shape.
 *
 * @mixin \App\Models\Sale
 */
class InvoiceSaleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_no' => $this->invoice_no,
            'total' => (float) $this->total,
            'received_amount' => (float) $this->received_amount,
            'refund_amount' => (float) $this->refund_amount,
            'refunded_total' => (float) $this->refunded_total,
            'payment_method' => $this->payment_method,
            'cashier_name' => $this->user?->name ?? 'Staff',
            'created_at' => $this->created_at,
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine' => [
                    'name' => $item->medicine?->name ?? 'Unknown',
                ],
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ]),
        ];
    }
}
