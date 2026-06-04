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
            ->get();

        $categories = Category::orderBy('sort_order')->get();

        return Inertia::render('Menu/Index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
        ]);
    }
}
