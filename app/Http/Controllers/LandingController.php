<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LandingController extends Controller
{

    /**
     * Show the landing page with featured menu items.
     */
    public function index()
    {
        $imageUrl = config('app.url') . '/images/amala.jpg';

        $featuredItems = MenuItem::query()
            ->where('is_available', true)
            ->with('category')
            ->orderBy('sort_order')
            ->limit(6)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'price' => (float) $item->price,
                'image_url' => $item->image_path ? Storage::url($item->image_path) : $imageUrl,
                'is_available' => (bool) $item->is_available,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
            ]);

        $categories = Category::query()
            ->withCount(['menuItems' => fn($q) => $q->where('is_available', true)])
            ->orderBy('sort_order')
            ->get()
            ->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image_url' => $category->image_path ? Storage::url($category->image_path) : $imageUrl,
                'menu_items_count' => $category->menu_items_count,
            ]);

        $restaurantInfo = [
            'name' => config('app.name', 'Restaurant'),
            'tagline' => 'Discover fine dining excellence',
            'address' => '02 GRA conference road, Ijebu-Ode, Ogun State, Nigeria',
            'phone' => '+2348057938850',
            'hours' => [
                'monday' => '11:00 AM - 10:00 PM',
                'tuesday' => '11:00 AM - 10:00 PM',
                'wednesday' => '11:00 AM - 10:00 PM',
                'thursday' => '11:00 AM - 10:00 PM',
                'friday' => '11:00 AM - 11:00 PM',
                'saturday' => '10:00 AM - 11:00 PM',
                'sunday' => '10:00 AM - 9:00 PM',
            ],
        ];

        return Inertia::render('Welcome', [
            'featuredItems' => $featuredItems,
            'categories' => $categories,
            'restaurantInfo' => $restaurantInfo,
        ]);
    }
}
