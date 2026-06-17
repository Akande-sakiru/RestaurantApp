<?php

namespace Tests\Feature\Reservations;

use App\Models\Reservation;
use App\Models\User;
use PHPUnit\Framework\Attributes\Group;
use Tests\Support\PropertyTest;
use Tests\TestCase;

class ReservationControllerTest extends TestCase
{
    use PropertyTest;

    #[Group('property')]
    public function testReservationDateValidationRejectsPastDates(): void
    {
        /**
         * Property 17: Reservation date validation rejects past dates
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $user->assignRole('customer');
                $this->actingAs($user);

                // Generate a past date
                $daysInPast = $faker->numberBetween(1, 30);
                $pastDate = now()->subDays($daysInPast)->toDateString();

                return [
                    'user' => $user,
                    'pastDate' => $pastDate,
                ];
            },
            assertion: function ($data) {
                $response = $this->post(route('reservations.store'), [
                    'reserved_date' => $data['pastDate'],
                    'reserved_time' => '18:00',
                    'party_size' => 2,
                ]);

                // Should fail validation
                $response->assertSessionHasErrors('reserved_date');
            },
            iterations: 15
        );
    }

    #[Group('property')]
    public function testReservationPartySizeValidationEnforcesBounds(): void
    {
        /**
         * Property 18: Reservation party size validation enforces bounds
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $user->assignRole('customer');
                $this->actingAs($user);

                // Test invalid party sizes
                $invalidSize = $faker->randomElement([0, -1, 21, 100]);

                return [
                    'user' => $user,
                    'invalidSize' => $invalidSize,
                ];
            },
            assertion: function ($data) {
                $response = $this->post(route('reservations.store'), [
                    'reserved_date' => now()->addDay()->toDateString(),
                    'reserved_time' => '18:00',
                    'party_size' => $data['invalidSize'],
                ]);

                // Should fail validation
                $response->assertSessionHasErrors('party_size');
            },
            iterations: 15
        );
    }

    #[Group('property')]
    public function testValidReservationCreatesPendingReservation(): void
    {
        /**
         * Property 19: Valid reservation submission creates a pending reservation
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $user->assignRole('customer');
                $this->actingAs($user);

                $futureDate = now()->addDays($faker->numberBetween(1, 30))->toDateString();
                $time = $faker->time('H:i');
                $partySize = $faker->numberBetween(1, 20);

                return [
                    'user' => $user,
                    'date' => $futureDate,
                    'time' => $time,
                    'partySize' => $partySize,
                ];
            },
            assertion: function ($data) {
                $reservationCountBefore = Reservation::count();

                $response = $this->post(route('reservations.store'), [
                    'reserved_date' => $data['date'],
                    'reserved_time' => $data['time'],
                    'party_size' => $data['partySize'],
                    'special_requests' => 'No onions please',
                ]);

                $reservationCountAfter = Reservation::count();

                // Verify reservation was created
                $this->assertEqual(1, $reservationCountAfter - $reservationCountBefore);

                // Verify it has pending status
                $reservation = Reservation::latest()->first();
                $this->assertEquals('pending', $reservation->status);
                $this->assertEquals($data['user']->id, $reservation->user_id);
            },
            iterations: 15
        );
    }

    #[Group('property')]
    public function testCustomersOnlySeeTHeOwnReservations(): void
    {
        /**
         * Property 20: Customers only see their own reservations
         */
        $this->forAll(
            generator: function ($faker) {
                $customer1 = User::factory()->create();
                $customer1->assignRole('customer');

                $customer2 = User::factory()->create();
                $customer2->assignRole('customer');

                $res1 = Reservation::factory()->create(['user_id' => $customer1->id]);
                $res2 = Reservation::factory()->create(['user_id' => $customer2->id]);

                return [
                    'customer1' => $customer1,
                    'customer2' => $customer2,
                    'res1' => $res1,
                    'res2' => $res2,
                ];
            },
            assertion: function ($data) {
                $this->actingAs($data['customer1']);
                $response = $this->get(route('reservations.index'));
                $response->assertStatus(200);

                $reservations = $response->viewData('reservations');
                $this->assertCount(1, $reservations);
                $this->assertEquals($data['res1']->id, $reservations[0]->id);
            },
            iterations: 10
        );
    }

    #[Group('property')]
    public function testCancellingPendingOrConfirmedReservationSetsCancelled(): void
    {
        /**
         * Property 21: Cancelling a pending or confirmed reservation sets status to cancelled
         */
        $this->forAll(
            generator: function ($faker) {
                $user = User::factory()->create();
                $user->assignRole('customer');
                $this->actingAs($user);

                $status = $faker->randomElement(['pending', 'confirmed']);
                $reservation = Reservation::factory()->create([
                    'user_id' => $user->id,
                    'status' => $status,
                ]);

                return [
                    'user' => $user,
                    'reservation' => $reservation,
                    'originalStatus' => $status,
                ];
            },
            assertion: function ($data) {
                $response = $this->patch(route('reservations.cancel', $data['reservation']));

                $data['reservation']->refresh();
                $this->assertEquals('cancelled', $data['reservation']->status);
            },
            iterations: 15
        );
    }
}
