<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Jobs\ProcessMenuItemImage;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Log;
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
        $imageUrl = config('app.url') . '/images/amala.jpg';

        $menuItems = MenuItem::with('category')
            ->orderBy('category_id')
            ->paginate(15)
            ->map(fn($item) => [
                'id' => $item->id,
                'category_id' => $item->category_id,
                'name' => $item->name,
                'slug' => $item->slug,
                'description' => $item->description,
                'price' => (float) $item->price,
                'image_url' => $item->image_url,
                'is_available' => $item->is_available === 'yes',
                'sort_order' => $item->sort_order,
                'created_at' => $item->created_at,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
            ]);

        $categories = Category::all();

        return Inertia::render('Admin/MenuItems/Index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the edit form.
     */
    public function edit(MenuItem $menuItem)
    {
        $imageUrl = config('app.url') . '/images/amala.jpg';

        $categories = Category::all();

        return Inertia::render('Admin/MenuItems/Edit', [
            'menuItem' => [
                'id' => $menuItem->id,
                'category_id' => $menuItem->category_id,
                'name' => $menuItem->name,
                'slug' => $menuItem->slug,
                'description' => $menuItem->description,
                'price' => (float) $menuItem->price,
                'image_url' => $menuItem->image_url,
                'is_available' => $menuItem->is_available === 'yes',
                'sort_order' => $menuItem->sort_order,
                'category' => [
                    'id' => $menuItem->category->id,
                    'name' => $menuItem->category->name,
                ],
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new menu item.
     */
    public function store(StoreMenuItemRequest $request)
    {
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            // $imagePath = $request->file('image')->store('menu-images', 'public');
            $imagePath = $request->file('image')->store('menu-images', 'uploads');
        }

        $menuItem = MenuItem::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $validated['is_available'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        if ($imagePath) {
            dispatch(new ProcessMenuItemImage($menuItem))->onQueue('default');
        }

        return redirect()->route('admin.menu-items.index')->with('success', 'Menu item created successfully');
    }

    /**
     * Update a menu item.
     */
    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem)
    {
        Log::info('kjhjoijhk');
        $validated = $request->validated();

        $imagePath = $menuItem->image_path;
        if ($menuItem->image_path) {
            Storage::disk('uploads')->delete($menuItem->image_path);
        }
        $imagePath = $request->file('image')->store('menu-images', 'uploads');

        $menuItem->update([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $validated['is_available'],
            'sort_order' => $validated['sort_order'] ?? $request->sort_order,
        ]);

        if ($request->hasFile('image') && $imagePath) {
            dispatch(new ProcessMenuItemImage($menuItem))->onQueue('default');
        }

        return redirect()->route('admin.menu-items.index')->with('success', 'Menu item updated successfully');
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
