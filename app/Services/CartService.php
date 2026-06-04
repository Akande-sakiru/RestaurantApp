<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Redis\Connections\Connection;
use Illuminate\Support\Facades\Redis;

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
        try {
            $raw = Redis::hgetall($this->key($user));

            if (empty($raw)) {
                return [];
            }

            return array_values(
                array_map(fn(string $json) => json_decode($json, true), $raw)
            );
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Add a menu item to the cart, or increment its quantity if it already exists.
     */
    public function add(User $user, MenuItem $item, int $qty, ?string $notes): void
    {
        try {
            $key = $this->key($user);
             
            $field = (string) $item->id;

            $existing = Redis::hget($key, $field);
//  dd($existing); 
            if ($existing !== null && $existing !== false) {
                $entry = json_decode($existing, true);
                $entry['quantity'] += $qty;
            } else {
                $entry = [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                    'quantity' => $qty,
                    'notes' => $notes,
                ];
            }
// dd($entry);
            Redis::hset($key, $field, json_encode($entry));
            Redis::expire($key, self::TTL);
        } catch (\Throwable $e) {
            // If Redis is unavailable, silently fail
        }
    }

    /**
     * Update the quantity of a cart item. Calls remove() if qty is 0.
     */
    public function update(User $user, MenuItem $item, int $qty): void
    {
        try {
            if ($qty === 0) {
                $this->remove($user, $item);
                return;
            }

            $key = $this->key($user);
            $field = (string) $item->id;

            $existing = Redis::hget($key, $field);

            if ($existing === null || $existing === false) {
                return;
            }

            $entry = json_decode($existing, true);
            $entry['quantity'] = $qty;

            Redis::hset($key, $field, json_encode($entry));
            Redis::expire($key, self::TTL);
        } catch (\Throwable $e) {
            // If Redis is unavailable, silently fail
        }
    }

    /**
     * Remove a specific menu item from the cart.
     */
    public function remove(User $user, MenuItem $item): void
    {
        try {
            $key = $this->key($user);

            Redis::hdel($key, (string) $item->id);

            // Refresh TTL only if the cart still has items.
            if (Redis::hlen($key) > 0) {
                Redis::expire($key, self::TTL);
            }
        } catch (\Throwable $e) {
            // If Redis is unavailable, silently fail
        }
    }

    /**
     * Clear the entire cart for the given user.
     */
    public function clear(User $user): void
    {
        try {
            Redis::del($this->key($user));
        } catch (\Throwable $e) {
            // If Redis is unavailable, silently fail
        }
    }

    /**
     * Return the number of distinct items (lines) in the cart.
     */
    public function count(User $user): int
    {
        try {
            return (int) Redis::hlen($this->key($user));
        } catch (\Throwable $e) {
            // If Redis is unavailable, return 0
            return 0;
        }
    }

    /**
     * Calculate the cart subtotal (sum of price * quantity), accurate to 2 decimal places.
     */
    public function subtotal(User $user): float
    {
        try {
            $values = Redis::hvals($this->key($user));

            if (empty($values)) {
                return 0.0;
            }

            $total = 0.0;

            foreach ($values as $json) {
                $entry = json_decode($json, true);
                $total += (float) $entry['price'] * (int) $entry['quantity'];
            }

            return round($total, 2);
        } catch (\Throwable $e) {
            return 0.0;
        }
    }

    /**
     * Return the Redis hash key for the given user's cart.
     */
    private function key(User $user): string
    {
        return "cart:{$user->id}";
    }
}
