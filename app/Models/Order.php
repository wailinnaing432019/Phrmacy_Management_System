<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
