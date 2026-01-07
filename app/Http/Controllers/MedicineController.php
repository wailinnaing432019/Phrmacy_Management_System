<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\PurchasedItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Picqer\Barcode\BarcodeGeneratorPNG;

class MedicineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
    $query = Medicine::with(['category', 'purchasedItems'])
        ->latest();

    // 🔍 Search by name or description
    if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%')
              ->orWhere('description', 'like', '%' . $request->search . '%');
        });
    }

    // 📂 Filter by category
    if ($request->filled('category')) {
        $query->whereHas('category', function ($q) use ($request) {
            $q->where('name', $request->category);
        });
    }

    // 📌 Sorting (Name & Unit Price)
    if ($request->filled('sortBy') && in_array($request->sortBy, ['name', 'selling_price'])) {
        $direction = $request->sortDirection === 'desc' ? 'desc' : 'asc';
        $query->orderBy($request->sortBy, $direction);
    } else {
        $query->latest(); // default order
    }

    // 📦 Pagination with available quantity calculation
    $medicines = $query->paginate(7)->through(function ($medicine) {
        $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

        return [
            'id' => $medicine->id,
            'name' => $medicine->name,
            'description' => $medicine->description,
            'selling_price' => $medicine->selling_price,
            'qty' => $availableQty,
            'stock_limit' => $medicine->stock_limit,
            'medicine_barcode' => $medicine->medicine_barcode,
            'category' => $medicine->category->name ?? '—',
            'created_at' => $medicine->created_at->format('d-m-Y'),
            'updated_at' => $medicine->updated_at->format('d-m-Y'),
            'image' => $medicine->image,
            'status' => $medicine->status,
        ];
    });

    // Send filters for frontend
    $categories = \App\Models\Category::pluck('name');

    return Inertia::render('medicine/Index', [
        'medicines'   => $medicines,
        'filters'     => $request->only(['search', 'category', 'sortBy', 'sortDirection']),
        'categories'  => $categories,
    ]);
}


public function printBarcodes(Request $request, string $id)
{
    $request->validate([
        'qty' => 'required|integer|min:1',
    ]);

    $medicine = Medicine::findOrFail($id);
    $qty = $request->input('qty');

    $generator = new BarcodeGeneratorPNG();
    $barcodeData = base64_encode($generator->getBarcode($medicine->medicine_barcode, $generator::TYPE_CODE_128));
    $barcodeSrc = 'data:image/png;base64,' . $barcodeData;

    $medicinesData = [
        'name' => $medicine->name,
        'barcode' => $medicine->medicine_barcode,
        'barcode_src' => $barcodeSrc,
        'qty' => $qty,
    ];

    $pdf = Pdf::loadView('pdf.barcodes', compact('medicinesData'))
              ->setPaper('A4', 'portrait');

    return $pdf->stream("barcode_{$medicine->id}.pdf");
}
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('medicine/Create', [
        'categories' => Category::all(),
    ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
 
        $validated = $request->validate([
            'name' => 'required|string|unique:medicines,name|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'selling_price' => 'required|numeric|min:0',
            // 'medicine_barcode' => 'nullable|string|max:255|unique:medicines,medicine_barcode',
            'qty' => 'required|integer|min:1', // qty must be greater than stock_limit
            'stock_limit' => 'required|integer|min:0|lt:qty', // stock_limit must be less than qty
            'purchase_price'=>'required|numeric|min:0',
            'image'=>'nullable|image|max:2048',
            'status'=>'nullable',
            
            'mfd_date'=>'required|date',
            'exp_date'=>'required|date|after:mfd_date',
        ], [
            'stock_limit.lt' => 'Stock limit must be less than quantity.',
        ]);
        // Generate a shorter, unique barcode (e.g., MED + random 6 digits)
        do {
            $barcode = 'MED' . rand(100000, 999999);
        } while (Medicine::where('medicine_barcode', $barcode)->exists());

        
        //generate barcode
// $validated['medicine_barcode'] = 'MED' . now()->format('YmdHis') . rand(100, 999);
        $filePath="";
        if($request->hasFile('image')){
            $file = $request->file('image');
            $filePath=$file->store('medicines','public');

        }
        try{
            DB::beginTransaction();
            $medicine=Medicine::create([
                'name'=>$validated['name'],
                'category_id' => $validated['category_id'],
                'description' => $validated['description'],
                'selling_price' => $validated['selling_price'], 
                'qty' => $validated['qty'],  
                'stock_limit' => $validated['stock_limit'],  
                'medicine_barcode'=>$barcode,
                'image'=>$filePath,
                'status'=>$validated['status'],
            ]);
 
            if($medicine){
                PurchasedItem::create([
                    'medicine_id'=>$medicine->id,
                    'qty'=>$validated['qty'],
                    'unit_price'=>$validated['purchase_price'],
                    'description'=>$validated['description'],
                    'mfd_date'=>$validated['mfd_date'],
                    'exp_date'=>$validated['exp_date'],
                ]);
            }
            DB::commit();


            return to_route('medicines.index')
            ->with('success', "Medicine Created Successfully!")
            ->with('print_barcode', [
                'id' => $medicine->id,
                'qty' => $validated['qty'],
            ]);
            // return to_route('medicines.index')->with('success',"Medicine Created Successfully!");
        }catch(\Exception $e){
            DB::rollBack();
            return to_route('medicines.index')->with('error',"Something Went Wrong!".$e);
        }
    
    
    }

    /**
     * Display the specified resource.
     */
 
public function show(Medicine $medicine)
{
    // Eager load purchasedItems ordered by exp_date ASC (oldest first, NULLs last)
    $medicine->load([
        'category',
        'purchasedItems' => function ($query) {
            $query->orderByRaw('CASE WHEN exp_date IS NULL THEN 1 ELSE 0 END, exp_date DESC');
        }
    ]);

    $purchasedItems = $medicine->purchasedItems->map(fn($batch) => [
        'id' => $batch->id,
        'qty' => $batch->qty,
        'sold_qty' => $batch->sold_qty,
        'available_qty' => $batch->qty - $batch->sold_qty,
        'unit_price'=>$batch->unit_price,
        'mfd_date' => $batch->mfd_date ? Carbon::parse($batch->mfd_date)->format('Y-m-d') : null,
        'exp_date' => $batch->exp_date ? Carbon::parse($batch->exp_date)->format('Y-m-d') : null,
    ]);

    return Inertia::render('medicine/Show', [
        'medicine' => [
            'id' => $medicine->id,
            'name' => $medicine->name,
            'description' => $medicine->description,
            'selling_price' => $medicine->selling_price,
            'medicine_barcode' => $medicine->medicine_barcode,
            'stock_limit' => $medicine->stock_limit,
            'image' => $medicine->image ? asset('storage/' . $medicine->image) : null,
            'category' => $medicine->category->name ?? '—',
            'created_at' => Carbon::parse($medicine->created_at)->format('d-m-Y'),
            'updated_at' => Carbon::parse($medicine->updated_at)->format('d-m-Y'),
        ],
        'purchasedItems' => $purchasedItems,
    ]);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medicine $medicine)
{
    $categories = Category::select('id', 'name')->get();

    // Load purchasedItems to calculate available qty
    $medicine->load('purchasedItems');

    $availableQty = $medicine->purchasedItems->sum(fn($b) => $b->qty - $b->sold_qty);

    return Inertia::render('medicine/Edit', [
        'medicine' => [
            'id' => $medicine->id,
            'name' => $medicine->name,
            'description' => $medicine->description,
            'selling_price' => $medicine->selling_price,
            'qty' => $availableQty, // ✅ Add available qty here
            'stock_limit' => $medicine->stock_limit,
            'medicine_barcode' => $medicine->medicine_barcode,
            'category_id' => $medicine->category_id,
            'created_at' => $medicine->created_at->format('d-m-Y'),
            'updated_at' => $medicine->updated_at->format('d-m-Y'),
            'image'=>$medicine->image,
            'status'=>$medicine->status
        ],
        'categories' => $categories,
    ]);
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
    'name' => 'required|string|max:255|unique:medicines,name,' . $medicine->id,
    'category_id' => 'required|exists:categories,id',
    'description' => 'nullable|string',
    'selling_price' => 'required|numeric|min:0',  
    'stock_limit' => 'required|integer|min:0', 
    'image'=>'nullable|max:2048',
    'status'=>'nullable', 
]); 
    $filePath=$medicine->image;
    if($request->hasFile('image')){
        $file = $request->file('image');
                $filePath=$file->store('medicines','public');
                Storage::disk('public')->delete($medicine->image);
    }
    try{
DB::beginTransaction();
    $medicine->update([
        'name'=>$validated['name'],
        'category_id'=>$validated['category_id'],
        'description'=>$validated['description'],
        'selling_price'=>$validated['selling_price'],
        'stock_limit'=>$validated['stock_limit'],
        'image'=>$filePath,
        'status'=>$validated['status'],
    ]);
    DB::commit();
return to_route('medicines.index')->with('success', 'Medicine updated.');
    }catch(\Exception $e){
        DB::rollBack();
return to_route('medicines.index')->with('error', 'Something Went Wrong while Updating.'.$e);

    }
    

        
    }

    // MedicineController.php
public function addQty(Request $request, Medicine $medicine)
{
    $validated = $request->validate([
        'qty' => 'required|integer|min:1',
        'unit_price'=>'required|numeric|min:0',
        'description'=>'nullable|string',
        'mfd_date'=>'required|date',
        'exp_date'=>'required|date|after:mfd_date',
    ]);
 
    try{
        DB::beginTransaction();
        $medicine->qty += $validated['qty'];
        $medicine->save();

        PurchasedItem::create([
            'medicine_id'=>$medicine->id,
            'qty'=>$validated['qty'],
            'unit_price'=>$validated['unit_price'],
            'description'=>$validated['description'],
            'mfd_date'=>$validated['mfd_date'],
            'exp_date'=>$validated['exp_date'],
        ]);

        DB::commit();
    return to_route('medicines.index')->with('success', 'Quantity Restock successfully.');

    }catch(\Exception $e){
        DB::rollBack();
        return to_route('medicines.index')->with('error', 'Something Went Wrong');
    }


}
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medicine $medicine)
    {
         try {
         Medicine::destroy($medicine->id);
        return to_route('medicines.index')->with('error',"Medicine ".$medicine->name." Delete Successfullly!");

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->with('error', 'Cannot delete this medicine because it has related  orders.');
            }
            return back()->with('error', 'Something went wrong.');
        }
    }
}
