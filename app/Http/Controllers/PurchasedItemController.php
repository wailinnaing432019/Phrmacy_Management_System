<?php

namespace App\Http\Controllers;

use App\Models\PurchasedItem;
use Illuminate\Http\Request;

class PurchasedItemController extends Controller
{
    public function update(Request $request, $id)
{
    $data = $request->validate([
        'qty' => 'required|numeric|min:0',
        'sold_qty' => 'required|numeric|min:0',
        'available_qty' => 'required|numeric|min:0',
        'unit_price'=>'required|numeric|min:0',
        'mfd_date' => 'required|date',
        'exp_date' => 'required|date',
    ]);

    $purchasedItem = PurchasedItem::findOrFail($id);
    $purchasedItem->update($data);

    return back()->with('success', 'Purchased Item updated successfully!');
}
}
