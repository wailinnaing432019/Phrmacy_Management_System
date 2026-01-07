<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers=Supplier::all();
        return Inertia::render('supplier/Index',compact('suppliers'));
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
         
        $validated=$request->validated(); 
        Supplier::create($validated);
        return to_route('suppliers.index')->with('success',"Supplier added successfully");
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
    public function update(SupplierRequest $request, string $supplier)
    {
        $validated=$request->validated();
        $supplier=Supplier::find($supplier);
        $supplier->name=$validated['name'];
        $supplier->email=$validated['email'];
        $supplier->phone=$validated['phone'];
        $supplier->address=$validated['address'];

         $supplier->save();
        return to_route('suppliers.index')->with('message', "Supplier Update Successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        Supplier::destroy($supplier->id);
        return to_route('suppliers.index')->with('error',"Supplier ". $supplier->name ." deleted successfully");
    }
}
