<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineSupplier extends Model
{
    protected $fillable = [
    'medicine_id',
    'supplier_id',
    'supplier_price',
    'is_preferred', // ✅ include this
];
public function medicine()
{
    return $this->belongsTo(Medicine::class);
}

public function supplier()
{
    return $this->belongsTo(Supplier::class);
}
}
