<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sequence extends Model
{
    protected $fillable = [
        'name',
        'year',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'value' => 'integer',
        ];
    }
}
