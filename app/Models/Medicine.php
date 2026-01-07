<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medicine extends Model
{
    protected $fillable=[
        'name',
        'description',
        'selling_price', 
        'category_id',
        'medicine_barcode',
        'qty',
        'stock_limit',
        'status',
        'image',
    ];
    //
public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
 // Relation: Medicine has many PurchasedItems (batches)
    public function purchasedItems()
    {
        return $this->hasMany(PurchasedItem::class);
    }

    // Relation: Medicine has many SaleItems (sold history)
    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
 

}
