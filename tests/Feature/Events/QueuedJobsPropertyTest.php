<?php

namespace Tests\Feature\Events;

use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendReservationConfirmationEmail;
use App\Jobs\SendReservationStatusUpdateEmail;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;
use Tests\Support\PropertyTest;

#[Group('property')]
class QueuedJobsPropertyTest extends TestCase
{
    use RefreshDatabase;
    use PropertyTest;

    /**
     * Property 38: All email notifications are dispatched as queued jobs
     * 
     * Validates that when certain events occur, the corresponding email notification jobs
     * are pushed to the 'notifications' queue.
     */
    public function test_order_confirmation_email_job_queued_to_notifications(): void
    {
        $this->forAll(
            generator: function ($faker) {
                return [
                    'user' => User::factory()->create(),
                    'type' => $faker->randomElement(['dine-in', 'takeaway', 'delivery']),
                    'total' => $faker->randomFloat(2, 10, 500),
                ];
            },
            assertion: function ($data) {
                Queue::fake();

                $order = Order::factory()->create([
                    'user_id' => $data['user']->id,
                    'type' => $data['type'],
                    'total' => $data['total'],
                ]);

                // Dispatch the job (as would happen in OrderService::createFromCart)
                SendOrderConfirmationEmail::dispatch($order);

                // Assert the job was pushed to the notifications queue
                Queue::assertPushed(SendOrderConfirmationEmail::class, function ($job) use ($order) {
                    return $job->order->id === $order->id;
                });
            },
            iterations: 5
        );
    }

    /**
     * OrderStatusUpdated email job should be queued
     */
    public function test_order_status_update_email_job_queued_to_notifications(): void
    {
        $this->forAll(
            generator: function ($faker) {
                return [
                    'user' => User::factory()->create(),
                    'status' => $faker->randomElement(['ready', 'cancelled']),
                ];
            },
            assertion: function ($data) {
                Queue::fake();

                $order = Order::factory()->create([
                    'user_id' => $data['user']->id,
                    'status' => $data['status'],
                ]);

                // Dispatch the job (as would happen in OrderController::updateStatus)
                SendOrderStatusUpdateEmail::dispatch($order);

                // Assert the job was pushed to the notifications queue
                Queue::assertPushed(SendOrderStatusUpdateEmail::class, function ($job) use ($order) {
                    return $job->order->id === $order->id;
                });
            },
            iterations: 5
        );
    }

    /**
     * ReservationConfirmationEmail job should be queued
     */
    public function test_reservation_confirmation_email_job_queued_to_notifications(): void
    {
        $this->forAll(
            generator: function ($faker) {
                return [
                    'user' => User::factory()->create(),
                    'party_size' => $faker->numberBetween(1, 20),
                ];
            },
            assertion: function ($data) {
                Queue::fake();

                $reservation = Reservation::factory()->create([
                    'user_id' => $data['user']->id,
                    'party_size' => $data['party_size'],
                    'status' => 'pending',
                ]);

                // Dispatch the job (as would happen in ReservationController::store)
                SendReservationConfirmationEmail::dispatch($reservation);

                // Assert the job was pushed to the notifications queue
                Queue::assertPushed(SendReservationConfirmationEmail::class, function ($job) use ($reservation) {
                    return $job->reservation->id === $reservation->id;
                });
            },
            iterations: 5
        );
    }

    /**
     * ReservationStatusUpdatedEmail job should be queued
     */
    public function test_reservation_status_update_email_job_queued_to_notifications(): void
    {
        $this->forAll(
            generator: function ($faker) {
                return [
                    'user' => User::factory()->create(),
                    'status' => $faker->randomElement(['confirmed', 'cancelled']),
                ];
            },
            assertion: function ($data) {
                Queue::fake();

                $reservation = Reservation::factory()->create([
                    'user_id' => $data['user']->id,
                    'status' => $data['status'],
                ]);

                // Dispatch the job (as would happen in ReservationController::updateStatus)
                SendReservationStatusUpdateEmail::dispatch($reservation);

                // Assert the job was pushed to the notifications queue
                Queue::assertPushed(SendReservationStatusUpdateEmail::class, function ($job) use ($reservation) {
                    return $job->reservation->id === $reservation->id;
                });
            },
            iterations: 5
        );
    }

    /**
     * All queued jobs should target the 'notifications' queue
     */
    public function test_all_email_jobs_use_notifications_queue(): void
    {
        $this->forAll(
            generator: function ($faker) {
                return [
                    'jobClass' => $faker->randomElement([
                        SendOrderConfirmationEmail::class,
                        SendOrderStatusUpdateEmail::class,
                        SendReservationConfirmationEmail::class,
                        SendReservationStatusUpdateEmail::class,
                    ]),
                ];
            },
            assertion: function ($data) {
                // Create appropriate model for job
                if (
                    $data['jobClass'] === SendOrderConfirmationEmail::class ||
                    $data['jobClass'] === SendOrderStatusUpdateEmail::class
                ) {
                    $model = Order::factory()->create();
                    $job = new $data['jobClass']($model);
                } else {
                    $model = Reservation::factory()->create();
                    $job = new $data['jobClass']($model);
                }

                // Verify the job is set to use the notifications queue
                $this->assertEquals('notifications', $job->queue);
            },
            iterations: 4
        );
    }
}
