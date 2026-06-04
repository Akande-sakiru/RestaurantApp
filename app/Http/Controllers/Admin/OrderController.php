<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderStatusUpdated;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display all orders with optional status filter.
     */
    public function index(Request $request)
    {
        $query = Order::with('user')->latest();

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15);
        $pendingOrderCount = Order::where('status', 'pending')->count();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'status' => $request->status,
            ],
            'pendingOrderCount' => $pendingOrderCount,
        ]);
    }

    /**
     * Display a specific order.
     */
    public function show(Order $order)
    {
        $order->load(['items', 'user']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Update the status of an order.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:confirmed,preparing,ready,completed,cancelled',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

        // Dispatch email job if status is ready or cancelled
        if (in_array($validated['status'], ['ready', 'cancelled'])) {
            dispatch(new SendOrderStatusUpdateEmail($order))->onQueue('notifications');
        }

        // Dispatch broadcast event
        OrderStatusUpdated::dispatch($order);

        return back()->with('success', 'Order status updated successfully');
    }
}
