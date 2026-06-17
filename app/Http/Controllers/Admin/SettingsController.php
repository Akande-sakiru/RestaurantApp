<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Show the settings page
     */
    public function index()
    {
        $user = auth()->user();
        
        return Inertia::render('Admin/Settings/Index', [
            'restaurantSettings' => [
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
                'max_delivery_radius_km' => $user->max_delivery_radius_km ?? 20,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Update restaurant settings
     */
    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'max_delivery_radius_km' => 'required|integer|min:1|max:100',
            ]);

            $user = auth()->user();
            $user->update([
                'latitude' => (float) $validated['latitude'],
                'longitude' => (float) $validated['longitude'],
                'max_delivery_radius_km' => (int) $validated['max_delivery_radius_km'],
            ]);

            return back()->with([
                'success' => 'Restaurant settings updated successfully!',
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Failed to update settings: ' . $e->getMessage(),
            ]);
        }
    }
}
