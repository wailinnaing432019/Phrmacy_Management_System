<?php

namespace App\Repositories\Supplier;

use App\Models\Supplier;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;

class SupplierRepository extends BaseRepository implements SupplierRepositoryInterface
{
    protected function model(): Model
    {
        return new Supplier;
    }
}
