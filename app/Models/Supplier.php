<?php

namespace App\Models;

use App\Models\Concerns\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasActivityLog, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
    ];
    //
    //     public function medicines()
    // {
    //     return $this->hasMany(Medicine::class);
    // }

    public function medicineSuppliers()
    {
        return $this->hasMany(MedicineSupplier::class);
    }
}
