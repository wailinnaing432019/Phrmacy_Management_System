<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'medicine_id', 'purchased_item_id', 'quantity', 'unit_price', 'subtotal'];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function purchasedItem()
    {
        return $this->belongsTo(PurchasedItem::class);
    }
}
