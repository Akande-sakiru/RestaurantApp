<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Inertia\Inertia;

class LandingController extends Controller
{
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
                'price' => $item->price,
                'image_url' => $item->image_url,
                'category' => [
                    'id' => $item->category->id,
                    'name' => $item->category->name,
                ],
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
            'restaurantInfo' => $restaurantInfo,
        ]);
    }
}
