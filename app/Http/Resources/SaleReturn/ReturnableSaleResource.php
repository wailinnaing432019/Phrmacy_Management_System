<?php

namespace App\Http\Resources\SaleReturn;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Sale shape used by the return form, including remaining returnable quantities.
 *
 * @mixin \App\Models\Sale
 */
class ReturnableSaleResource extends JsonResource
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
            'refunded_total' => (float) $this->refunded_total,
            'sale_by' => $this->user->name ?? 'N/A',
            'created_at' => $this->created_at->format('d-m-Y H:i'),
            'items' => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'medicine_name' => $item->medicine->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
                'returned_qty' => $item->returned_qty,
                'returnable_qty' => $item->quantity - $item->returned_qty,
                'can_restock' => $item->purchased_item_id !== null,
            ]),
        ];
    }
}
