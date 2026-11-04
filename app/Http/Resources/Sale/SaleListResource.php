<?php

namespace App\Http\Resources\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Row shape for the sales report (shop source).
 *
 * @mixin \App\Models\Sale
 */
class SaleListResource extends JsonResource
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
            'payment_method' => $this->payment_method,
            'sale_by' => $this->sale_by,
            'created_at' => $this->created_at,
            'user' => [
                'name' => $this->user?->name,
            ],
        ];
    }
}
