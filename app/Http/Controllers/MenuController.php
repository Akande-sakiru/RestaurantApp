<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;

class MenuController extends Controller
{
    /**
     * Display the menu with optional category and search filters.
     */
    public function index()
    {
        $category = request('category');
        $search = request('search');

        $query = MenuItem::query()
            ->where('is_available', true)
            ->with('category')
            ->orderBy('sort_order');

        if ($category) {
            $query->where('category_id', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $menuItems = $query->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'price' => $item->price,
                'image_url' => $item->image_url,
                'is_available' => $item->is_available,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
            ]);

        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('Menu/Index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }
}
