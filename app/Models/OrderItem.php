<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
   protected $fillable = ['order_id', 'medicine_id', 'qty', 'price'];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function medicine() {
        return $this->belongsTo(Medicine::class);
    }

    public function orderItemStock()
    {
        return $this->hasMany(OrderItemStock::class);
    }
}
