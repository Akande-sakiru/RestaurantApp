<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        $today = now()->toDateString();

        // Today's statistics
        $todayOrderCount = (int) Order::whereDate('created_at', $today)->count();
        $todayRevenue = (float) Order::whereDate('created_at', $today)
            ->sum(DB::raw('CAST(total AS DECIMAL(10,2))'));
        $pendingOrderCount = (int) Order::where('status', 'pending')->count();
        $todayReservationCount = (int) Reservation::whereDate('reserved_date', $today)->count();
        $pendingReservationCount = (int) Reservation::where('status', 'pending')->count();

        // Overall statistics
        $activeMenuItemCount = (int) MenuItem::where('is_available', true)->count();
        $categoryCount = (int) Category::count();

        // Recent orders (5 most recent)
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => (float) $order->total,
                    'status' => $order->status,
                    'user' => [
                        'id' => $order->user->id,
                        'name' => $order->user->name,
                    ],
                ];
            });

        // Today's reservations
        $todayReservations = Reservation::with('user')
            ->whereDate('reserved_date', $today)
            ->get()
            ->map(function($reservation) {
                return [
                    'id' => $reservation->id,
                    'user' => [
                        'id' => $reservation->user->id,
                        'name' => $reservation->user->name,
                    ],
                    'party_size' => $reservation->party_size,
                    'reserved_time' => $reservation->reserved_time,
                    'status' => $reservation->status,
                ];
            });

        return Inertia::render('Admin/Dashboard/Index', [
            'todayOrderCount' => $todayOrderCount,
            'todayRevenue' => $todayRevenue,
            'pendingOrderCount' => $pendingOrderCount,
            'todayReservationCount' => $todayReservationCount,
            'pendingReservationCount' => $pendingReservationCount,
            'activeMenuItemCount' => $activeMenuItemCount,
            'categoryCount' => $categoryCount,
            'recentOrders' => $recentOrders,
            'todayReservations' => $todayReservations,
        ]);
    }
}
