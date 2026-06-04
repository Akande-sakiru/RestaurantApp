<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display all users with optional search.
     */
    public function index(Request $request)
    {
        $query = User::withoutTrashed();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query
            ->with('roles')
            ->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Update a user's role.
     */
    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:customer,admin',
        ]);

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User role updated successfully');
    }

    /**
     * Toggle a user's active status.
     */
    public function toggleActive(Request $request, User $user)
    {
        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'user' => 'You cannot deactivate your own account.',
            ])->setStatusCode(422);
        }

        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', 'User status updated successfully');
    }
}
