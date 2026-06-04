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
        $todayOrderCount = Order::whereDate('created_at', $today)->count();
        $todayRevenue = (float) Order::whereDate('created_at', $today)
            ->sum(DB::raw('CAST(total AS DECIMAL(10,2))'));
        $pendingOrderCount = Order::where('status', 'pending')->count();
        $todayReservationCount = Reservation::whereDate('reserved_date', $today)->count();
        $pendingReservationCount = Reservation::where('status', 'pending')->count();

        // Overall statistics
        $activeMenuItemCount = MenuItem::where('is_available', true)->count();
        $categoryCount = Category::count();

        // Recent orders (5 most recent)
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get();

        // Today's reservations
        $todayReservations = Reservation::with('user')
            ->whereDate('reserved_date', $today)
            ->get();

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
