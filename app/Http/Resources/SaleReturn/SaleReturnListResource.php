<?php

namespace App\Http\Resources\SaleReturn;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Row shape for the returns list.
 *
 * @mixin \App\Models\SaleReturn
 */
class SaleReturnListResource extends JsonResource
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
            'created_at' => $this->created_at,
            'processor' => [
                'name' => $this->processor?->name,
            ],
            'sale' => [
                'id' => $this->sale?->id,
                'invoice_no' => $this->sale?->invoice_no,
                'total' => (float) $this->sale?->total,
            ],
        ];
    }
}
