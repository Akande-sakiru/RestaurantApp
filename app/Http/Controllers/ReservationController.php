<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservationRequest;
use App\Jobs\SendReservationConfirmationEmail;
use App\Jobs\SendReservationStatusUpdateEmail;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display the user's reservations.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $reservations = $user->reservations()->latest()->get();

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Show the form for creating a new reservation.
     */
    public function create()
    {
        return Inertia::render('Reservations/Create');
    }

    /**
     * Store a new reservation.
     */
    public function store(StoreReservationRequest $request)
    {
        $user = $request->user();

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'reservation_number' => $this->generateReservationNumber(),
            'reserved_date' => $request->validated('reserved_date'),
            'reserved_time' => $request->validated('reserved_time'),
            'party_size' => $request->validated('party_size'),
            'status' => 'pending',
            'special_requests' => $request->validated('special_requests'),
        ]);

        dispatch(new SendReservationConfirmationEmail($reservation))->onQueue('notifications');

        return redirect()->route('reservations.index')->with('success', 'Reservation created successfully');
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        // Authorize ownership
        if ($reservation->user_id !== $user->id) {
            abort(403);
        }

        // Validate status is pending or confirmed
        if (!in_array($reservation->status, ['pending', 'confirmed'])) {
            return back()->withErrors(['status' => 'Only pending or confirmed reservations can be cancelled.']);
        }

        $reservation->update(['status' => 'cancelled']);

        dispatch(new SendReservationStatusUpdateEmail($reservation))->onQueue('notifications');

        return back()->with('success', 'Reservation cancelled successfully');
    }

    /**
     * Generate a unique reservation number.
     */
    private function generateReservationNumber(): string
    {
        do {
            $reservationNumber = 'RES-' . time() . '-' . random_int(1000, 9999);
        } while (Reservation::where('reservation_number', $reservationNumber)->exists());

        return $reservationNumber;
    }
}
