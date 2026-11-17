<?php

namespace App\Http\Controllers;

use App\Http\Resources\Medicine\MedicineOptionResource;
use App\Http\Resources\MedicineSupplier\MedicineSupplierLinkResource;
use App\Http\Resources\MedicineSupplier\MedicineSupplierResource;
use App\Http\Resources\Supplier\SupplierOptionResource;
use App\Models\MedicineSupplier;
use App\Services\Medicine\MedicineService;
use App\Services\MedicineSupplier\MedicineSupplierService;
use App\Services\Supplier\SupplierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineSupplierController extends Controller
{
    public function __construct(
        private readonly MedicineSupplierService $medicineSuppliers,
        private readonly MedicineService $medicines,
        private readonly SupplierService $suppliers,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('medicine-supply/Index', [
            'medicineSuppliers' => MedicineSupplierResource::collection($this->medicineSuppliers->list())->resolve(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('medicine-supply/Create', [
            'medicines' => MedicineOptionResource::collection($this->medicines->options())->resolve(),
            'suppliers' => SupplierOptionResource::collection($this->suppliers->options())->resolve(),
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

        $this->medicineSuppliers->link($validated);

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
        $link = $this->medicineSuppliers->find((int) $id);

        return Inertia::render('medicine-supply/Edit', [
            'link' => (new MedicineSupplierResource($link))->resolve(),
            'medicines' => MedicineOptionResource::collection($this->medicines->options())->resolve(),
            'suppliers' => SupplierOptionResource::collection($this->suppliers->options())->resolve(),
            'existingLinks' => MedicineSupplierLinkResource::collection($this->medicineSuppliers->existingLinks())->resolve(),
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

        $this->medicineSuppliers->update($medicine_supply, $validated);

        return redirect()->route('medicine-supply.index')->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $link = $this->medicineSuppliers->find((int) $id);
        $this->medicineSuppliers->delete($link);

        return redirect()->route('medicine-supply.index')
            ->with('success', 'Link deleted successfully.');
    }
}
