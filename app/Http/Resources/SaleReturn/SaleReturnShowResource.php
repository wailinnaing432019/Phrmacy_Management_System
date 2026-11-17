<?php

namespace App\Http\Resources\SaleReturn;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Detail shape for a processed return.
 *
 * @mixin \App\Models\SaleReturn
 */
class SaleReturnShowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'return_no' => $this->return_no,
            'total' => (float) $this->total,
            'refund_method' => $this->refund_method,
            'reason' => $this->reason,
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('d-m-Y H:i'),
            'processed_by' => $this->processor->name ?? 'N/A',
            'sale' => [
                'id' => $this->sale->id,
                'invoice_no' => $this->sale->invoice_no,
                'total' => (float) $this->sale->total,
                'refunded_total' => (float) $this->sale->refunded_total,
            ],
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
                'restocked' => (bool) $item->restocked,
            ]),
        ];
    }
}
