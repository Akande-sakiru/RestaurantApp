<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly OrderService $orderService
    ) {
    }

    /**
     * Display the user's orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = $user->orders()->latest()->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'type' => $order->type,
                'status' => $order->status,
                'total' => (float) $order->total,
                'created_at' => $order->created_at,
            ])->toArray(),
        ]);
    }

    /**
     * Display a specific order.
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('items');

        return Inertia::render('Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'type' => $order->type,
                'status' => $order->status,
                'delivery_address' => $order->delivery_address,
                'table_number' => $order->table_number,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
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
     * Store a new order from the cart.
     */
    public function store(StoreOrderRequest $request)
    {
        $user = $request->user();
        $order = $this->orderService->createFromCart($user, $request->validated());

        return Inertia::render('Orders/Confirmation', [
            'order' => $order,
        ]);
    }
}
