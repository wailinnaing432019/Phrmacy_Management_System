<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index(){
        return Inertia::render('pos/POS');
    }
    public function lookup($barcode)
{
    $medicine = Medicine::where('medicine_barcode', $barcode)->first();

    if (!$medicine) {
        return response()->json(['error' => 'Not found'], 404);
    }
    return response()->json(array_merge(
        $medicine->toArray(),
        ['available_qty' => $medicine->qty]
    ));

    // return response()->json($medicine);
}
public function invoice($id)
{
    $sale = Sale::with('items.medicine')->findOrFail($id);
    // dd($sale);
// return view('Sale.Invoice',compact('sale'));
    return Inertia::render('pos/Invoice', [
        'sale' => $sale,
    ]);
}


}
