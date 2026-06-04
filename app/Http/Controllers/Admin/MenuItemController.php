<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Jobs\ProcessMenuItemImage;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    /**
     * Show the create form.
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Admin/MenuItems/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Display all menu items.
     */
    public function index()
    {
        $menuItems = MenuItem::with('category')
            ->orderBy('category_id')
            ->paginate(15);

        $categories = Category::all();

        return Inertia::render('Admin/MenuItems/Index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the edit form.
     */
    // public function edit(MenuItem $menuItem)
    // {
    //     $categories = Category::all();

    //     return Inertia::render('Admin/MenuItems/Edit', [
    //         'menuItem' => $menuItem,
    //         'categories' => $categories,
    //     ]);
    // }

    /**
     * Store a new menu item.
     */
    public function store(StoreMenuItemRequest $request)
    {
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menu-images', 'public');
        }

        $menuItem = MenuItem::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        if ($imagePath) {
            dispatch(new ProcessMenuItemImage($menuItem))->onQueue('default');
        }

        return redirect()->route('admin.menu-items.index')->with('success', 'Menu item created successfully');
    }

    // public function edit(MenuItem $menuItem)
    // {
    //     $categories = Category::all();

    //     return Inertia::render('Admin/MenuItems/Edit', [
    //         'menuItem' => $menuItem,
    //         'categories' => $categories,
    //     ]);
    // }

    /**
     * Update a menu item.
     */
    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        $validated = $request->validated();

        $imagePath = $menuItem->image_path;
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($menuItem->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
            }
            $imagePath = $request->file('image')->store('menu-images', 'public');
        }

        $menuItem->update([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        if ($request->hasFile('image') && $imagePath) {
            dispatch(new ProcessMenuItemImage($menuItem))->onQueue('default');
        }

        return back()->with('success', 'Menu item updated successfully');
    }

    /**
     * Soft delete a menu item.
     */
    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return back()->with('success', 'Menu item deleted successfully');
    }
}
