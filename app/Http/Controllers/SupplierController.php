<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Http\Resources\Supplier\SupplierResource;
use App\Models\Supplier;
use App\Services\Supplier\SupplierService;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function __construct(
        private readonly SupplierService $suppliers,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('supplier/Index', [
            'suppliers' => SupplierResource::collection($this->suppliers->list())->resolve(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SupplierRequest $request)
    {
        $this->suppliers->create($request->validated());

        return to_route('suppliers.index')->with('success', 'Supplier added successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SupplierRequest $request, Supplier $supplier)
    {
        $this->suppliers->update($supplier, $request->validated());

        return to_route('suppliers.index')->with('message', 'Supplier Update Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $this->suppliers->delete($supplier);

        return to_route('suppliers.index')
            ->with('error', 'Supplier '.$supplier->name.' deleted successfully');
    }
}
