<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Models\Category;
use App\Services\Category\CategoryService;
use Illuminate\Database\QueryException;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categories,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('category/Index', [
            'categories' => CategoryResource::collection($this->categories->list())->resolve(),
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
    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        $data['description'] = $data['description'] ?? '';
        $data['trending'] = (bool) ($data['trending'] ?? false);

        $this->categories->create($data);

        return to_route('categories.index')->with('success', 'Category added successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        $data['description'] = $data['description'] ?? '';
        $data['trending'] = (bool) ($data['trending'] ?? false);

        $this->categories->update($category, $data);

        return to_route('categories.index')
            ->with('success', 'Category updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        try {
            $this->categories->delete($category);

            return back()->with('success', 'Category deleted successfully!');
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->with('error', 'Cannot delete this category because it has related medicines or orders.');
            }

            return back()->with('error', 'Something went wrong.');
        }
    }
}
