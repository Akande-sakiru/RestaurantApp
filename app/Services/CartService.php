<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class CartService
{
    /**
     * The TTL for a cart in seconds (7 days).
     */
    private const TTL = 60 * 60 * 24 * 7;

    /**
     * Retrieve all cart items for the given user.
     *
     * @return array<int, array{id: int, name: string, price: float, quantity: int, notes: string|null}>
     */
    public function get(User $user): array
    {
        return Cache::get($this->key($user), []);
    }

    /**
     * Add a menu item to the cart, or increment its quantity if it already exists.
     */
    public function add(User $user, MenuItem $item, int $qty, ?string $notes): void
    {
        $key = $this->key($user);
        $items = Cache::get($key, []);

        $itemId = (string) $item->id;

        if (isset($items[$itemId])) {
            $items[$itemId]['quantity'] += $qty;
        } else {
            $items[$itemId] = [
                'id' => $item->id,
                'name' => $item->name,
                'price' => (float) $item->price,
                'quantity' => $qty,
                'notes' => $notes,
            ];
        }
        // dd($items);


        Cache::put($key, $items, self::TTL);
    }

    /**
     * Update the quantity of a cart item. Calls remove() if qty is 0.
     */
    public function update(User $user, MenuItem $item, int $qty): void
    {
        if ($qty === 0) {
            $this->remove($user, $item);
            return;
        }

        $key = $this->key($user);
        $items = Cache::get($key, []);

        $itemId = (string) $item->id;

        if (!isset($items[$itemId])) {
            return;
        }

        $items[$itemId]['quantity'] = $qty;

        Cache::put($key, $items, self::TTL);
    }

    /**
     * Remove a specific menu item from the cart.
     */
    public function remove(User $user, MenuItem $item): void
    {
        $key = $this->key($user);
        $items = Cache::get($key, []);

        $itemId = (string) $item->id;
        unset($items[$itemId]);

        if (empty($items)) {
            Cache::forget($key);
        } else {
            Cache::put($key, $items, self::TTL);
        }
    }

    /**
     * Clear the entire cart for the given user.
     */
    public function clear(User $user): void
    {
        Cache::forget($this->key($user));
    }

    /**
     * Return the number of distinct items (lines) in the cart.
     */
    public function count(User $user): int
    {
        return count(Cache::get($this->key($user), []));
    }

    /**
     * Calculate the cart subtotal (sum of price * quantity), accurate to 2 decimal places.
     */
    public function subtotal(User $user): float
    {
        $items = Cache::get($this->key($user), []);

        if (empty($items)) {
            return 0.0;
        }

        $total = 0.0;

        foreach ($items as $entry) {
            $total += (float) $entry['price'] * (int) $entry['quantity'];
        }

        return round($total, 2);
    }

    /**
     * Return the cache key for the given user's cart.
     */
    private function key(User $user): string
    {
        return "cart:{$user->id}";
    }
}
