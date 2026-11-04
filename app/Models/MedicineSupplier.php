<?php

namespace App\Models;

use App\Models\Concerns\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicineSupplier extends Model
{
    use HasActivityLog, SoftDeletes;

    protected $fillable = [
        'medicine_id',
        'supplier_id',
        'supplier_price',
        'is_preferred',
    ];

    protected function casts(): array
    {
        return [
            'is_preferred' => 'boolean',
            'supplier_price' => 'decimal:2',
        ];
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
