<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'order_no',
        'total',
        'status',
        'reserved_at',
        'reservation_expires_at',
        'cancelled_at',
        'cancellation_reason',
        'name',
        'email',
        'phone',
        'address',
        'payment_method',
        'transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'reserved_at' => 'datetime',
            'reservation_expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Customer account that placed the order.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
