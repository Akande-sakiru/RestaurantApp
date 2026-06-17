<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public readonly Order $order)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusMessages = [
            'pending' => 'Your order is pending',
            'confirmed' => 'Your order has been confirmed',
            'preparing' => 'We are preparing your order',
            'ready' => 'Your order is ready for pickup',
            'completed' => 'Your order has been completed',
            'cancelled' => 'Your order has been cancelled',
        ];

        $message = $statusMessages[$this->order->status] ?? 'Your order status has been updated';

        return (new MailMessage)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($message)
            ->line('Order Number: ' . $this->order->order_number)
            ->line('New Status: ' . ucfirst($this->order->status))
            ->action('View Order', url(route('orders.show', $this->order, absolute: false)))
            ->line('Thank you for your order!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $statusMessages = [
            'pending' => 'Your order is pending',
            'confirmed' => 'Your order has been confirmed',
            'preparing' => 'We are preparing your order',
            'ready' => 'Your order is ready for pickup',
            'completed' => 'Your order has been completed',
            'cancelled' => 'Your order has been cancelled',
        ];

        $message = $statusMessages[$this->order->status] ?? 'Your order status has been updated';

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => $message,
        ];
    }
}
