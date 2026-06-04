<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $imageUrl = config('app.url') . '/images/amala.jpg';
        
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
                'image_url' => $item->image_url ?? $imageUrl,
                'is_available' => (bool) $item->is_available,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                    'slug' => $item->category->slug,
                ],
            ]);

        $categories = Category::orderBy('sort_order', 'asc')->get()->map(fn($category) => [
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
