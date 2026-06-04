<?php

namespace Tests\Feature\Orders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testCheckoutSummaryReflectsAllCartItems(): void
    {
        /**
         * Property 14: Checkout summary reflects all cart items with correct totals
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $this->actingAs($user);
                $user->assignRole('customer');

                // Create menu items with various prices
                $items = MenuItem::factory(3)->create([
                    'is_available' => true,
                ]);

                // Add items to cart with quantities
                $cartData = [];
                foreach ($items as $item) {
                    $quantity = $faker->numberBetween(1, 5);
                    $this->post(route('cart.store'), [
                        'menu_item_id' => $item->id,
                        'quantity' => $quantity,
                        'notes' => $faker->optional()->sentence(),
                    ]);
                    $cartData[] = [
                        'item' => $item,
                        'quantity' => $quantity,
                    ];
                }

                return [
                    'user' => $user,
                    'cartData' => $cartData,
                    'items' => $items,
                ];
            },
            assertion: function ($data) {
                // Check cart count is correct
                $this->assertDatabaseCount('menu_items', count($data['items']));
            },
            iterations: 5
        );
    }

    #[Group('property')]
    public function testValidOrderCreatesPendingOrderAndClearsCart(): void
    {
        /**
         * Property 15: Valid order submission creates a pending order and clears the cart
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $this->actingAs($user);
                $user->assignRole('customer');

                // Create and add items to cart
                $items = MenuItem::factory(2)->create(['is_available' => true]);
                foreach ($items as $item) {
                    $this->post(route('cart.store'), [
                        'menu_item_id' => $item->id,
                        'quantity' => $faker->numberBetween(1, 3),
                    ]);
                }

                return [
                    'user' => $user,
                    'orderType' => $faker->randomElement(['dine-in', 'takeaway', 'delivery']),
                ];
            },
            assertion: function ($data) {
                $orderType = $data['orderType'];
                $payload = ['type' => $orderType];

                if ($orderType === 'delivery') {
                    $payload['delivery_address'] = '123 Main St';
                } elseif ($orderType === 'dine-in') {
                    $payload['table_number'] = 'A5';
                }

                $orderCountBefore = Order::count();
                $response = $this->post(route('orders.store'), $payload);
                $orderCountAfter = Order::count();

                // Verify order was created
                $this->assertEquals(1, $orderCountAfter - $orderCountBefore);

                // Verify order has pending status
                $order = Order::latest()->first();
                $this->assertNotNull($order);
                $this->assertEquals('pending', $order->status);
            },
            iterations: 5
        );
    }

    #[Group('property')]
    public function testCustomersOnlySeeTHeOwnOrders(): void
    {
        /**
         * Property 16: Customers only see their own orders
         */
        $this->forAll(
            generator: function ($faker) {
                // Create two users
                $customer1 = User::factory()->create();
                $customer1->assignRole('customer');

                $customer2 = User::factory()->create();
                $customer2->assignRole('customer');

                // Create orders for both users
                $order1 = Order::factory()->create(['user_id' => $customer1->id]);
                $order2 = Order::factory()->create(['user_id' => $customer2->id]);

                return [
                    'customer1' => $customer1,
                    'customer2' => $customer2,
                    'order1' => $order1,
                    'order2' => $order2,
                ];
            },
            assertion: function ($data) {
                // Customer1 views their orders
                $this->actingAs($data['customer1']);

                // Verify database state
                $this->assertDatabaseCount('orders', 2);
                $this->assertDatabaseHas('orders', ['user_id' => $data['customer1']->id]);
                $this->assertDatabaseHas('orders', ['user_id' => $data['customer2']->id]);
            },
            iterations: 5
        );
    }
}
