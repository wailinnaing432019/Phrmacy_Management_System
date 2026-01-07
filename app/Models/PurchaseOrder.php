<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    //
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseorderitems()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
   
}
