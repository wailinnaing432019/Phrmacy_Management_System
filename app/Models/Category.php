<?php

namespace App\Models;

use App\Models\Concerns\HasActivityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasActivityLog, HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'trending',
    ];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        static::saving(function (Category $category) {
            if ($category->description === null) {
                $category->description = '';
            }
        });
    }

    public function medicines(): HasMany
    {
        return $this->hasMany(Medicine::class);
    }
}
