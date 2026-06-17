<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testAdminOrderStatusFilterReturnsOnlyMatchingOrders(): void
    {
        /**
         * Property 28: Admin order status filter returns only matching orders
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $filterStatus = $faker->randomElement(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

                // Create orders with different statuses
                Order::factory(2)->create(['status' => 'pending']);
                Order::factory(2)->create(['status' => 'confirmed']);
                Order::factory(2)->create(['status' => $filterStatus]);

                return [
                    'admin' => $admin,
                    'filterStatus' => $filterStatus,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.orders.index', ['status' => $data['filterStatus']]));
                $response->assertStatus(200);

                $orders = $response->viewData('orders');

                // All returned orders should have the filter status
                foreach ($orders as $order) {
                    $this->assertEquals($data['filterStatus'], $order->status);
                }
            },
            iterations: 15
        );
    }

    #[Group('property')]
    public function testAdminOrderStatusUpdatePersistsNewStatus(): void
    {
        /**
         * Property 29: Admin order status update persists the new status
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $order = Order::factory()->create(['status' => 'pending']);
                $newStatus = $faker->randomElement(['confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

                return [
                    'admin' => $admin,
                    'order' => $order,
                    'newStatus' => $newStatus,
                ];
            },
            assertion: function ($data) {
                $response = $this->patch(route('admin.orders.status', $data['order']), [
                    'status' => $data['newStatus'],
                ]);

                // Refresh from database
                $data['order']->refresh();

                // Verify status was updated
                $this->assertEquals($data['newStatus'], $data['order']->status);
            },
            iterations: 15
        );
    }
}
