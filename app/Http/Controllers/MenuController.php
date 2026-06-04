<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menuItems = MenuItem::with('category')
            ->where('is_available', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'description' => $item->description,
                'price' => (float) $item->price,
                'image_url' => $item->image_url ?? '/images/amala.jpg', // Fallback to test image
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                    'slug' => $item->category->slug,
                ],
            ]);

        $categories = Category::orderBy('sort_order')->get()->map(fn($category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
        ]);

        return Inertia::render('Menu/Index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
        ]);
    }
}
