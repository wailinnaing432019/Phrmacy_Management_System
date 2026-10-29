<?php

namespace App\Http\Controllers;

use App\Models\PurchasedItem;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class PurchasedItemController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
    ) {}

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'qty' => 'required|numeric|min:0',
            'sold_qty' => 'required|numeric|min:0',
            'available_qty' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'mfd_date' => 'required|date',
            'exp_date' => 'required|date',
        ]);

        $purchasedItem = PurchasedItem::findOrFail($id);

        $before = $purchasedItem->qty - $purchasedItem->sold_qty;

        $purchasedItem->update($data);

        $after = $purchasedItem->qty - $purchasedItem->sold_qty;
        $medicine = $purchasedItem->medicine;

        if ($medicine) {
            $this->inventory->recordAdjustment(
                $medicine,
                $after - $before,
                auth()->id(),
                "Batch #{$purchasedItem->id} edited manually.",
            );
        }

        return back()->with('success', 'Purchased Item updated successfully!');
    }
}
