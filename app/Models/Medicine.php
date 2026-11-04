<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'selling_price',
        'category_id',
        'medicine_barcode',
        'qty',
        'stock_limit',
        'status',
        'image',
    ];

    //
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Relation: Medicine has many PurchasedItems (batches)
    public function purchasedItems()
    {
        return $this->hasMany(PurchasedItem::class);
    }

    // Relation: Medicine has many SaleItems (sold history)
    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Quantity that can actually be sold right now (non-expired batches only).
     */
    public function sellableQty(): int
    {
        return (int) $this->purchasedItems()
            ->whereColumn('qty', '>', 'sold_qty')
            ->where(function (Builder $query) {
                $query->whereNull('exp_date')->orWhereDate('exp_date', '>=', today());
            })
            ->sum(DB::raw('qty - sold_qty'));
    }

    /**
     * Add a `sellable_qty` column without loading every batch.
     */
    public function scopeWithSellableQty(Builder $query): Builder
    {
        return $query->addSelect([
            'sellable_qty' => PurchasedItem::query()
                ->selectRaw('COALESCE(SUM(qty - sold_qty), 0)')
                ->whereColumn('medicine_id', 'medicines.id')
                ->whereColumn('qty', '>', 'sold_qty')
                ->where(function (Builder $batch) {
                    $batch->whereNull('exp_date')->orWhereDate('exp_date', '>=', today());
                }),
        ]);
    }

    /**
     * Only medicines with at least one non-expired unit remaining.
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->whereHas('purchasedItems', function (Builder $batch) {
            $batch->whereColumn('qty', '>', 'sold_qty')
                ->where(function (Builder $sub) {
                    $sub->whereNull('exp_date')->orWhereDate('exp_date', '>=', today());
                });
        });
    }

    /**
     * Storefront-safe medicines: enabled and actually sellable today.
     */
    public function scopeAvailableForSale(Builder $query): Builder
    {
        return $query->where('status', 'available')->inStock();
    }
}
