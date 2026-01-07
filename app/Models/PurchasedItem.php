<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchasedItem extends Model
{
    protected $fillable=[
        'medicine_id',
        'qty',
        'unit_price',
        'description',
        'sold_qty',
        'mfd_date',
        'exp_date',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
    
}
