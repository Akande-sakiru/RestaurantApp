<?php

namespace App\Services;

use App\Events\OrderCreated;
use App\Jobs\SendOrderConfirmationEmail;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Create a new OrderService instance.
     */
    public function __construct(private readonly CartService $cartService)
    {
    }

    /**
     * Create a pending order (for payment initialization).
     * Does NOT clear cart - only creates order record.
     */
    public function createPendingOrder(User $user, array $validated): Order
    {
        return DB::transaction(function () use ($user, $validated) {
            // 1. Fetch cart items
            $cartItems = $this->cartService->get($user);

            if (empty($cartItems)) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            // 2. Validate all menu items are still available
            $menuItemIds = array_column($cartItems, 'id');
            $menuItems = MenuItem::whereIn('id', $menuItemIds)->get()->keyBy('id');

            foreach ($cartItems as $cartItem) {
                $menuItem = $menuItems->get($cartItem['id']);

                if ($menuItem === null || !$menuItem->is_available) {
                    throw ValidationException::withMessages([
                        'cart' => [
                            "'{$cartItem['name']}' is no longer available and cannot be ordered.",
                        ],
                    ]);
                }
            }

            // 3. Calculate subtotal/total
            $subtotal = 0.0;
            foreach ($cartItems as $cartItem) {
                $subtotal += (float) $cartItem['price'] * (int) $cartItem['quantity'];
            }
            $subtotal = round($subtotal, 2);
            $tax = round($subtotal * 0.1, 2);
            $total = round($subtotal + $tax, 2);

            // 4. Create Order record with payment_status = pending
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'type' => $validated['type'],
                'status' => 'pending',
                'payment_status' => 'pending', // Not paid yet
                'delivery_address' => $validated['delivery_address'] ?? null,
                'table_number' => $validated['table_number'] ?? null,
                'subtotal' => $subtotal,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            // 5. Create OrderItem records
            foreach ($cartItems as $cartItem) {
                $menuItem = $menuItems->get($cartItem['id']);

                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'menu_item_name' => $menuItem->name,
                    'menu_item_price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'customization_notes' => $cartItem['notes'] ?? null,
                ]);
            }

            return $order;
        });
    }

    /**
     * Create an order from the authenticated user's cart.
     *
     * Wraps the entire process in a database transaction:
     * 1. Fetch cart items from Redis.
     * 2. Validate all cart items are still available (is_available = true, not soft-deleted).
     * 3. Create the Order record with a unique order_number.
     * 4. Create OrderItem records snapshotting name and price at time of order.
     * 5. Clear the cart.
     * 6. Dispatch OrderCreated broadcast event and SendOrderConfirmationEmail job.
     *
     * @param  array{type: string, delivery_address: string|null, table_number: string|null, notes: string|null}  $validated
     *
     * @throws ValidationException if the cart is empty or any item is no longer available.
     */
    public function createFromCart(User $user, array $validated): Order
    {
        return DB::transaction(function () use ($user, $validated) {
            // 1. Fetch cart items
            $cartItems = $this->cartService->get($user);

            if (empty($cartItems)) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            // 2. Validate all menu items are still available (not soft-deleted, is_available = true)
            $menuItemIds = array_column($cartItems, 'id');

            /** @var \Illuminate\Database\Eloquent\Collection<int, MenuItem> $menuItems */
            $menuItems = MenuItem::whereIn('id', $menuItemIds)->get()->keyBy('id');

            foreach ($cartItems as $cartItem) {
                $menuItem = $menuItems->get($cartItem['id']);

                if ($menuItem === null || !$menuItem->is_available) {
                    throw ValidationException::withMessages([
                        'cart' => [
                            "'{$cartItem['name']}' is no longer available and cannot be ordered.",
                        ],
                    ]);
                }
            }

            // 3. Calculate subtotal / total
            $subtotal = 0.0;

            foreach ($cartItems as $cartItem) {
                $subtotal += (float) $cartItem['price'] * (int) $cartItem['quantity'];
            }

            $subtotal = round($subtotal, 2);
            $tax = round($subtotal * 0.1, 2);
            $total = round($subtotal + $tax, 2);

            // 4. Create the Order record
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'type' => $validated['type'],
                'status' => 'pending',
                'delivery_address' => $validated['delivery_address'] ?? null,
                'table_number' => $validated['table_number'] ?? null,
                'subtotal' => $subtotal,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            // 5. Create OrderItem records (snapshot name + price from cart/MenuItem)
            foreach ($cartItems as $cartItem) {
                $menuItem = $menuItems->get($cartItem['id']);

                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'menu_item_name' => $menuItem->name,
                    'menu_item_price' => $menuItem->price,
                    'quantity' => $cartItem['quantity'],
                    'customization_notes' => $cartItem['notes'] ?? null,
                ]);
            }

            // 6. Clear the cart
            $this->cartService->clear($user);

            // 7. Dispatch broadcast event and email confirmation job
            OrderCreated::dispatch($order);
            dispatch(new SendOrderConfirmationEmail($order))->onQueue('notifications');

            return $order;
        });
    }

    /**
     * Generate a unique order number in the format ORD-{timestamp}-{random}.
     *
     * Example: ORD-1716000000-4821
     */
    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . time() . '-' . random_int(1000, 9999);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
