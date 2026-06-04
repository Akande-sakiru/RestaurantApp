<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Category;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Map category names to emojis and images
     */
    private function getCategoryImage(string $categoryName): string
    {
        $categoryImages = [
            'appetizers' => '/images/amala.jpg',
            'sosa' => '/images/amala.jpg',
            'drinks' => '/images/amala.jpg',
            'desserts' => '/images/amala.jpg',
            'burgers' => '/images/amala.jpg',
            'pizza' => '/images/amala.jpg',
            'fried chicken' => '/images/amala.jpg',
            'wraps' => '/images/amala.jpg',
            'pasta' => '/images/amala.jpg',
            'salads' => '/images/amala.jpg',
        ];

        $lowerName = strtolower($categoryName);
        return $categoryImages[$lowerName] ?? '/images/amala.jpg';
    }

    /**
     * Show the landing page with featured menu items.
     */
    public function index()
    {
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
                'image_url' => $item->image_url ?? '/images/amala.jpg',
                'is_available' => (bool) $item->is_available,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
            ]);

        $categories = Category::query()
            ->withCount(['menuItems' => fn($q) => $q->where('is_available', true)])
            ->get()
            ->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'menu_items_count' => $category->menu_items_count,
                'image_url' => $this->getCategoryImage($category->name),
            ]);

        $restaurantInfo = [
            'name' => config('app.name', 'Restaurant'),
            'tagline' => 'Discover fine dining excellence',
            'address' => '123 Main Street, City, State',
            'phone' => '+1 (555) 123-4567',
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
