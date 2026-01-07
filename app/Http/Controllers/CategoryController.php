<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories=Category::all();
        return Inertia::render('category/Index',compact('categories'));
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
        $validated=$request->validated();
        Category::create($validated);
        return to_route('categories.index')->with('success',"Category added successfully");
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
    public function update(CategoryRequest $request, string $category)
    {
         $validated = $request->validated();
    $category = Category::findOrFail($category);

    $category->name = $validated['name'];
    $category->description = $validated['description'];
    $category->trending = $validated['trending'];  

    $category->save();

    return to_route('categories.index')
        ->with('message', "Category updated successfully");    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $category)
    {
        try {
        $category = Category::findOrFail($category);
        $category->delete();

        return back()->with('success', 'Category deleted successfully!');
    } catch (\Illuminate\Database\QueryException $e) {
        if ($e->getCode() == '23000') {
            return back()->with('error', 'Cannot delete this category because it has related medicines or orders.');
        }
        return back()->with('error', 'Something went wrong.');
    }
    }
}
