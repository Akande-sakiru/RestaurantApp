<?php

namespace Tests\Feature\Admin;

use App\Models\Reservation;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class ReservationControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testAdminReservationListIncludesAllRequiredFields(): void
    {
        /**
         * Property 30: Admin reservation list includes all required fields
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                Reservation::factory(5)->create();

                return [
                    'admin' => $admin,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.reservations.index'));
                $response->assertStatus(200);

                $reservations = $response->viewData('reservations');

                // Check that each reservation has required fields
                foreach ($reservations as $reservation) {
                    $this->assertNotNull($reservation->id);
                    $this->assertNotNull($reservation->user_id);
                    $this->assertNotNull($reservation->reserved_date);
                    $this->assertNotNull($reservation->reserved_time);
                    $this->assertNotNull($reservation->party_size);
                    $this->assertNotNull($reservation->status);
                }
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testAdminReservationFilterReturnsOnlyMatchingReservations(): void
    {
        /**
         * Property 31: Admin reservation filter returns only matching reservations
         */
        $this->forAll(
            generator: function ($faker) {
                $admin = User::factory()->create();
                $admin->assignRole('admin');
                $this->actingAs($admin);

                $filterStatus = $faker->randomElement(['pending', 'confirmed', 'cancelled', 'completed']);
                $filterDate = now()->addDays(3)->toDateString();

                // Create reservations with different statuses and dates
                Reservation::factory(2)->create(['status' => 'pending']);
                Reservation::factory(2)->create(['status' => 'confirmed']);
                Reservation::factory(2)->create([
                    'status' => $filterStatus,
                    'reserved_date' => $filterDate,
                ]);
                Reservation::factory(2)->create([
                    'reserved_date' => now()->addDays(10)->toDateString(),
                ]);

                return [
                    'admin' => $admin,
                    'filterStatus' => $filterStatus,
                    'filterDate' => $filterDate,
                ];
            },
            assertion: function ($data) {
                $response = $this->get(route('admin.reservations.index', [
                    'status' => $data['filterStatus'],
                    'date' => $data['filterDate'],
                ]));
                $response->assertStatus(200);

                $reservations = $response->viewData('reservations');

                // All returned reservations should match the filters
                foreach ($reservations as $reservation) {
                    $this->assertEquals($data['filterStatus'], $reservation->status);
                    $this->assertEquals(
                        $data['filterDate'],
                        $reservation->reserved_date->toDateString()
                    );
                }
            },
            iterations: 10
        );
    }
}
