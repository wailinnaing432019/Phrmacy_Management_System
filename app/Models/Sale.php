<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = ['invoice_no', 'total','sale_by','received_amount', 'refund_amount', 'payment_method'];
 
public function user()
{
    return $this->belongsTo(User::class, 'sale_by');
}


    public function items()
{
    return $this->hasMany(SaleItem::class);
}
}
