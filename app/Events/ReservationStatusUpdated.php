<?php

namespace App\Events;

use App\Models\Reservation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReservationStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public readonly Reservation $reservation)
    {
        //     NotificationMessage::create(
        //     [
        //         'user_id' => $this->order->user_id,
        //         'title' => "Order Created",
        //         'message' => "Your order {$this->order->order_number} ({$this->order->type}) has been updated to {$this->order->status}.Total Amount {$this->order->amount_paid}",
        //     ]
        // );
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("reservations.{$this->reservation->user_id}"),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'reservation_id' => $this->reservation->id,
            'status' => $this->reservation->status,
        ];
    }
}
