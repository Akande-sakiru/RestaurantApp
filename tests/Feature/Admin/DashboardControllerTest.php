<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\Reservation;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testDashboardRecentOrdersNeverExceedsFiveItems(): void
    {
        /**
         * Property 36: Dashboard recent orders list never exceeds 5 items
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                // Create many orders (some old, some recent)
                $orderCount = $faker->numberBetween(6, 20);
                Order::factory($orderCount)->create();

                return [
                    'admin' => $admin,
                    'orderCount' => $orderCount,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.dashboard'));
                $response->assertStatus(200);

                $recentOrders = $response->viewData('recentOrders');
                $this->assertLessThanOrEqual(5, count($recentOrders));
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testDashboardTodayReservationsContainsOnlyTodaysReservations(): void
    {
        /**
         * Property 37: Dashboard today's reservations contains only today's reservations
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                // Create today's reservations
                $todayCount = $faker->numberBetween(1, 5);
                Reservation::factory($todayCount)->create([
                    'reserved_date' => now()->toDateString(),
                ]);

                // Create future/past reservations
                Reservation::factory(3)->create([
                    'reserved_date' => now()->addDays(5)->toDateString(),
                ]);
                Reservation::factory(2)->create([
                    'reserved_date' => now()->subDays(5)->toDateString(),
                ]);

                return [
                    'admin' => $admin,
                    'expectedTodayCount' => $todayCount,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.dashboard'));
                $response->assertStatus(200);

                $todayReservations = $response->viewData('todayReservations');

                // Verify all are from today
                foreach ($todayReservations as $reservation) {
                    $this->assertEquals(
                        now()->toDateString(),
                        $reservation->reserved_date->toDateString()
                    );
                }

                // Verify count matches what we created today
                $this->assertEqual($data['expectedTodayCount'], count($todayReservations));
            },
            iterations: 10
        );
    }
}
