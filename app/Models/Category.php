<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable=[
        'name',
        'description',
        'trending',
    ];
    public function medicines(): HasMany
    {
        return $this->hasMany(Medicine::class);
    }
}
