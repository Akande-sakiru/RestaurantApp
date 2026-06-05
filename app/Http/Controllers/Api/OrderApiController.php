<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderApiController extends Controller
{
    /**
     * Get order details for real-time status updates
     */
    public function show(Request $request, Order $order)
    {
        // Check if user owns this order
        if ($order->user_id !== $request->user()?->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $order->load('items');

        return response()->json([
            'status' => true,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'order_status' => $order->status,
            'payment_status' => $order->payment_status,
            'type' => $order->type,
            'delivery_address' => $order->delivery_address,
            'table_number' => $order->table_number,
            'subtotal' => (float) $order->subtotal,
            'total' => (float) $order->total,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'items' => $order->items->map(fn($item) => [
                'id' => $item->id,
                'menu_item_name' => $item->menu_item_name,
                'menu_item_price' => (float) $item->menu_item_price,
                'quantity' => $item->quantity,
                'customization_notes' => $item->customization_notes,
            ])->toArray(),
        ]);
    }

    /**
     * Get all orders for user (for tracking page)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = $user->orders()
            ->latest()
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'type' => $order->type,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'total' => (float) $order->total,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ]);

        return response()->json([
            'status' => true,
            'orders' => $orders,
        ]);
    }
}
