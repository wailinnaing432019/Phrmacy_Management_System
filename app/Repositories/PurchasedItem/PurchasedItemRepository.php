<?php

namespace App\Repositories\PurchasedItem;

use App\Models\PurchasedItem;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;

class PurchasedItemRepository extends BaseRepository implements PurchasedItemRepositoryInterface
{
    protected function model(): Model
    {
        return new PurchasedItem;
    }
}
