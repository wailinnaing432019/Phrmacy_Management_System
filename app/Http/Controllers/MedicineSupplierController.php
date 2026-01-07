<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineSupplier;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineSupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $medicineSuppliers = MedicineSupplier::with('medicine', 'supplier')->get();

        return Inertia::render('medicine-supply/Index', [
            'medicineSuppliers' => $medicineSuppliers
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('medicine-supply/Create', [
            'medicines' => Medicine::select('id', 'name')->get(),
            'suppliers' => Supplier::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'medicine_id' => 'required|exists:medicines,id',
        'supplier_id' => 'required|exists:suppliers,id',
        'supplier_price' => 'required|numeric|min:0',
        'is_preferred' => 'required|boolean',
    ]);

    // Check if this link already exists
    $existing = MedicineSupplier::where('medicine_id', $validated['medicine_id'])
        ->where('supplier_id', $validated['supplier_id'])
        ->first();

    // If preferred, unset preferred from others
    if ($validated['is_preferred']) {
        MedicineSupplier::where('medicine_id', $validated['medicine_id'])
            ->where('supplier_id', '!=', $validated['supplier_id'])
            ->update(['is_preferred' => false]);
    }

    if ($existing) {
        // Update existing record
        $existing->update($validated);
    } else {
        // Create new record
        MedicineSupplier::create($validated);
    }

    return redirect()->route('medicine-supply.index')->with('success', 'Supplier linked successfully.');
}


    /**
     * Display the specified resource.
     */
    public function show(MedicineSupplier $medicineSupplier)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $link = MedicineSupplier::findOrFail($id);
 $existingLinks = MedicineSupplier::select('id', 'medicine_id', 'supplier_id')->get();
return Inertia::render('medicine-supply/Edit', [
    'link' => $link,
    'medicines' => Medicine::all(['id', 'name']),
    'suppliers' => Supplier::all(['id', 'name']),
    'existingLinks' => $existingLinks,
]);
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, MedicineSupplier $medicine_supply)
{
    $validated = $request->validate([
        'medicine_id' => 'required|exists:medicines,id',
        'supplier_id' => 'required|exists:suppliers,id',
        'supplier_price' => 'required|numeric|min:0',
        'is_preferred' => 'required|boolean',
    ]);

    if ($validated['is_preferred']) {
        MedicineSupplier::where('medicine_id', $validated['medicine_id'])
            ->where('id', '!=', $medicine_supply->id)
            ->update(['is_preferred' => false]);
    }

    $medicine_supply->update($validated);

    return redirect()->route('medicine-supply.index')->with('success', 'Supplier updated successfully.');
}





    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         $link = MedicineSupplier::findOrFail($id);
        $link->delete();

        return redirect()->route('medicine-supply.index')
            ->with('success', 'Link deleted successfully.');
    }
}
