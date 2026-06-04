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
            'orders' => $orders,
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
            'order' => $order,
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
