<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['dine-in', 'takeaway', 'delivery']);
        $subtotal = fake()->randomFloat(2, 10, 100);
        $total = $subtotal + fake()->randomFloat(2, 0, 10);

        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . fake()->unique()->numerify('######'),
            'type' => $type,
            'status' => fake()->randomElement(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
            'delivery_address' => $type === 'delivery' ? fake()->address() : null,
            'table_number' => $type === 'dine-in' ? fake()->numerify('##') : null,
            'subtotal' => $subtotal,
            'total' => $total,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the order is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    /**
     * Indicate that the order is for dine-in.
     */
    public function dineIn(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'dine-in',
            'table_number' => fake()->numerify('##'),
            'delivery_address' => null,
        ]);
    }

    /**
     * Indicate that the order is for takeaway.
     */
    public function takeaway(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'takeaway',
            'table_number' => null,
            'delivery_address' => null,
        ]);
    }

    /**
     * Indicate that the order is for delivery.
     */
    public function delivery(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'delivery',
            'delivery_address' => fake()->address(),
            'table_number' => null,
        ]);
    }
}
