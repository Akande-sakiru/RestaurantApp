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

        // Cast totals to floats for proper JSON serialization
        $orders->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'customer_name' => $order->user?->name ?? 'Guest',
                'type' => $order->type,
                'status' => $order->status,
                'delivery_address' => $order->delivery_address,
                'table_number' => $order->table_number,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ] : null,
            ];
        });

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
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'type' => $order->type,
                'status' => $order->status,
                'delivery_address' => $order->delivery_address,
                'delivery_phone' => $order->delivery_phone,
                'table_number' => $order->table_number,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ] : null,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'menu_item_id' => $item->menu_item_id,
                    'menu_item_name' => $item->menu_item_name,
                    'menu_item_price' => (float) $item->menu_item_price,
                    'quantity' => $item->quantity,
                    'customization_notes' => $item->customization_notes,
                ])->toArray(),
            ],
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
