<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchasedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'qty',
        'unit_price',
        'description',
        'sold_qty',
        'mfd_date',
        'exp_date',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'sold_qty' => 'integer',
            'unit_price' => 'decimal:2',
            'mfd_date' => 'date',
            'exp_date' => 'date',
        ];
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
