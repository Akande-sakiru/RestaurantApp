<?php

namespace App\Http\Controllers\Admin;

use App\Events\ReservationStatusUpdated;
use App\Jobs\SendReservationStatusUpdateEmail;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display all reservations with optional filters.
     */
    public function index(Request $request)
    {
        $query = Reservation::with('user');

        if ($request->has('date') && $request->date) {
            $query->whereDate('reserved_date', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $reservations = $query->paginate(15);
        $pendingReservationCount = Reservation::where('status', 'pending')->count();

        return Inertia::render('Admin/Reservations/Index', [
            'reservations' => $reservations,
            'filters' => [
                'date' => $request->date,
                'status' => $request->status,
            ],
            'pendingReservationCount' => $pendingReservationCount,
        ]);
    }

    /**
     * Update the status of a reservation.
     */
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:confirmed,cancelled,completed',
        ]);

        $reservation->update(['status' => $validated['status']]);

        // Dispatch email job if status is confirmed or cancelled
        if (in_array($validated['status'], ['confirmed', 'cancelled'])) {
            dispatch(new SendReservationStatusUpdateEmail($reservation))->onQueue('notifications');
        }

        // Dispatch broadcast event
        ReservationStatusUpdated::dispatch($reservation);

        return back()->with('success', 'Reservation status updated successfully');
    }
}
