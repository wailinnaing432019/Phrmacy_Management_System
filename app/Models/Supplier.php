<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable=[
        'name',
        'email',
        'phone',
        'address'
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
