<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    public const TYPE_PURCHASE = 'purchase';

    public const TYPE_SALE = 'sale';

    public const TYPE_ORDER = 'order';

    public const TYPE_ORDER_RESERVED = 'order_reserved';

    public const TYPE_ORDER_CANCELLED = 'order_cancelled';

    public const TYPE_ORDER_EXPIRED = 'order_expired';

    public const TYPE_SALE_RETURNED = 'sale_returned';

    public const TYPE_ADJUSTMENT = 'adjustment';

    protected $fillable = [
        'medicine_id',
        'purchased_item_id',
        'type',
        'quantity',
        'balance_after',
        'reference_type',
        'reference_id',
        'user_id',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function purchasedItem(): BelongsTo
    {
        return $this->belongsTo(PurchasedItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
