<?php

namespace App\Events;

use App\Models\NotificationMessage;
use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public readonly Order $order)
    {
        NotificationMessage::create(
            [
                'user_id' => $this->order->user_id,
                'title' => "Order Created",
                'message' => "Your order {$this->order->order_number} ({$this->order->type}) has been received which is {$this->order->status}. Total Amount {$this->order->amount_paid} ",
            ]
        );
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("orders.{$this->order->user_id}"),
            new PrivateChannel('admin.orders'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'order' => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'type' => $this->order->type,
                'status' => $this->order->status,
                'total' => $this->order->total,
            ],
        ];
    }
}
