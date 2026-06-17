<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public readonly Reservation $reservation)
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
            'pending' => 'Your reservation is pending',
            'confirmed' => 'Your reservation has been confirmed',
            'cancelled' => 'Your reservation has been cancelled',
            'completed' => 'Thank you for dining with us!',
        ];

        $message = $statusMessages[$this->reservation->status] ?? 'Your reservation status has been updated';

        return (new MailMessage)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($message)
            ->line('Reservation Number: ' . $this->reservation->reservation_number)
            ->line('Date: ' . $this->reservation->reserved_date->format('F j, Y'))
            ->line('Time: ' . $this->reservation->reserved_time)
            ->line('New Status: ' . ucfirst($this->reservation->status))
            ->action('View Reservation', url(route('reservations.index', absolute: false)))
            ->line('Thank you for your reservation!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $statusMessages = [
            'pending' => 'Your reservation is pending',
            'confirmed' => 'Your reservation has been confirmed',
            'cancelled' => 'Your reservation has been cancelled',
            'completed' => 'Thank you for dining with us!',
        ];

        $message = $statusMessages[$this->reservation->status] ?? 'Your reservation status has been updated';

        return [
            'reservation_id' => $this->reservation->id,
            'reservation_number' => $this->reservation->reservation_number,
            'status' => $this->reservation->status,
            'message' => $message,
        ];
    }
}
