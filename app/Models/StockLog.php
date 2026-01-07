<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    //
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
