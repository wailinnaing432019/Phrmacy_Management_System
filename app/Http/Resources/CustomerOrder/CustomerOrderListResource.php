<?php

namespace App\Http\Resources\CustomerOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class CustomerOrderListResource extends JsonResource
{
    /**
     * Transform the resource into an array matching the MyOrders page.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_no' => $this->order_no,
            'total' => $this->total,
            'status' => $this->status,
            'created_at' => $this->created_at?->format('d-m-Y H:i'),
            'reservation_expires_at' => $this->reservation_expires_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
        ];
    }
}
