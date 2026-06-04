<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display all categories.
     */
    public function index()
    {
        $categories = Category::withCount('menuItems')->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show category with item count.
     */
    public function show(Category $category)
    {
        return $category->loadCount('menuItems');
    }

    /**
     * Store a new category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'required|integer',
        ]);

        Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'],
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully');
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:500',
            'sort_order' => 'required|integer',

        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'],
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully');
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category)
    {
        if ($category->menuItems()->count() > 0) {
            return back()->withErrors([
                'category' => 'Cannot delete category with menu items. Please reassign items to another category first.',
            ])->setStatusCode(422);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully');
    }
}