<?php

namespace App\Http\Controllers;

use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\Medicine\MedicineDetailResource;
use App\Http\Resources\Medicine\MedicineEditResource;
use App\Http\Resources\Medicine\MedicineResource;
use App\Http\Resources\Medicine\PurchasedItemResource;
use App\Models\Medicine;
use App\Services\Category\CategoryService;
use App\Services\Medicine\MedicineService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Picqer\Barcode\BarcodeGeneratorPNG;

class MedicineController extends Controller
{
    public function __construct(
        private readonly MedicineService $medicines,
        private readonly CategoryService $categories,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category', 'sortBy', 'sortDirection']);

        $medicines = $this->medicines->paginate($filters)
            ->through(fn (Medicine $medicine) => (new MedicineResource($medicine))->resolve());

        return Inertia::render('medicine/Index', [
            'medicines' => $medicines,
            'filters' => $filters,
            'categories' => $this->categories->names(),
        ]);
    }

    public function printBarcodes(Request $request, string $id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $medicine = $this->medicines->find((int) $id);
        $qty = $request->input('qty');

        $generator = new BarcodeGeneratorPNG;
        $barcodeData = base64_encode($generator->getBarcode($medicine->medicine_barcode, $generator::TYPE_CODE_128));
        $barcodeSrc = 'data:image/png;base64,'.$barcodeData;

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
            'categories' => CategoryResource::collection($this->categories->list())->resolve(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medicines', 'name')->whereNull('deleted_at'),
            ],
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'selling_price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:1',
            'stock_limit' => 'required|integer|min:0|lt:qty',
            'purchase_price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|in:available,not_available',
            'mfd_date' => 'required|date',
            'exp_date' => 'required|date|after:mfd_date',
        ], [
            'stock_limit.lt' => 'Stock limit must be less than quantity.',
        ]);

        try {
            $medicine = $this->medicines->create($validated, $request->file('image'));

            return to_route('medicines.index')
                ->with('success', 'Medicine Created Successfully!')
                ->with('print_barcode', [
                    'id' => $medicine->id,
                    'qty' => $validated['qty'],
                ]);
        } catch (\Exception $e) {
            return to_route('medicines.index')->with('error', 'Something Went Wrong!'.$e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Medicine $medicine)
    {
        $medicine = $this->medicines->findForShow($medicine->id);

        return Inertia::render('medicine/Show', [
            'medicine' => (new MedicineDetailResource($medicine))->resolve(),
            'purchasedItems' => PurchasedItemResource::collection($medicine->purchasedItems)->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Medicine $medicine)
    {
        $medicine = $this->medicines->findForEdit($medicine->id);

        return Inertia::render('medicine/Edit', [
            'medicine' => (new MedicineEditResource($medicine))->resolve(),
            'categories' => CategoryResource::collection($this->categories->list())->resolve(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medicines', 'name')
                    ->ignore($medicine->id)
                    ->whereNull('deleted_at'),
            ],
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'selling_price' => 'required|numeric|min:0',
            'stock_limit' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|in:available,not_available',
        ]);

        try {
            $this->medicines->update($medicine, $validated, $request->file('image'));

            return to_route('medicines.index')->with('success', 'Medicine updated.');
        } catch (\Exception $e) {
            return to_route('medicines.index')->with('error', 'Something Went Wrong while Updating.'.$e);
        }
    }

    /**
     * Restock an existing medicine.
     */
    public function addQty(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'qty' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'mfd_date' => 'required|date',
            'exp_date' => 'required|date|after:mfd_date',
        ]);

        try {
            $this->medicines->addQuantity($medicine, $validated);

            return to_route('medicines.index')->with('success', 'Quantity Restock successfully.');
        } catch (\Exception $e) {
            return to_route('medicines.index')->with('error', 'Something Went Wrong');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medicine $medicine)
    {
        try {
            $this->medicines->delete($medicine);

            return to_route('medicines.index')->with('error', 'Medicine '.$medicine->name.' Delete Successfullly!');
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->with('error', 'Cannot delete this medicine because it has related  orders.');
            }

            return back()->with('error', 'Something went wrong.');
        }
    }
}
