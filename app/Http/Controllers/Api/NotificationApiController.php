<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * Get all notifications for the authenticated user (latest first)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Fetch notifications from notification_messages table filtered by user_id, sorted by latest
        $notifications = NotificationMessage::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        // Count unread notifications (status = 'unread')
        $unreadCount = NotificationMessage::where('user_id', $user->id)
            ->where('status', 'unread')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a notification as read (works for both user and admin, but tracks separately for admin)
     */
    public function markAsRead(Request $request, $notificationId): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = NotificationMessage::find($notificationId);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        // Check if this is an admin request (check if user has admin role)
        $isAdmin = $user->hasRole('admin');

        if ($isAdmin) {
            // For admin: track in admin_read_notifications table
            // Check if record already exists
            $exists = \DB::table('admin_read_notifications')
                ->where('admin_id', $user->id)
                ->where('notification_id', $notificationId)
                ->first();
            
            if (!$exists) {
                \DB::table('admin_read_notifications')->insert([
                    'admin_id' => $user->id,
                    'notification_id' => $notificationId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            return response()->json([
                'message' => 'Notification marked as read (admin)',
                'notification' => $notification,
            ]);
        } else {
            // For regular user: update the notification status
            $notification->update(['status' => 'read']);

            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification,
            ]);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $notificationId): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = NotificationMessage::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        NotificationMessage::where('user_id', $user->id)
            ->where('status', 'unread')
            ->update(['status' => 'read']);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Get all notifications (admin view - no user filtering)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $adminId = $request->user()?->id;

            // Fetch all notifications from notification_messages table, sorted by latest
            $paginatedNotifications = NotificationMessage::with('user')
                ->orderByDesc('created_at')
                ->paginate(20);

            // Get list of notifications this admin has read
            $adminReadNotificationIds = \DB::table('admin_read_notifications')
                ->where('admin_id', $adminId)
                ->pluck('notification_id')
                ->toArray();

            // Add admin_read status to each notification and convert to array
            $notifications = [];
            foreach ($paginatedNotifications->items() as $notification) {
                $notificationArray = $notification->toArray();
                $notificationArray['admin_read'] = in_array($notification->id, $adminReadNotificationIds);
                $notifications[] = $notificationArray;
            }

            // Count total unread notifications from admin's perspective
            $unreadCount = NotificationMessage::query()
                ->whereNotIn('id', $adminReadNotificationIds)
                ->count();

            \Log::info('Admin notifications fetched', [
                'total' => count($notifications),
                'unread' => $unreadCount,
                'admin' => $adminId,
                'admin_read_ids' => $adminReadNotificationIds,
            ]);

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
                'pagination' => [
                    'current_page' => $paginatedNotifications->currentPage(),
                    'total' => $paginatedNotifications->total(),
                    'per_page' => $paginatedNotifications->perPage(),
                    'last_page' => $paginatedNotifications->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching admin notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => $request->user()?->id,
            ]);
            return response()->json(['error' => 'Failed to fetch notifications'], 500);
        }
    }

    /**
     * Get notifications filtered by status (admin)
     */
    public function adminGetByStatus(Request $request, $status): JsonResponse
    {
        $validStatuses = ['read', 'unread'];

        if (!in_array($status, $validStatuses)) {
            return response()->json(['error' => 'Invalid status'], 400);
        }

        $paginatedNotifications = NotificationMessage::with('user')
            ->where('status', $status)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'notifications' => $paginatedNotifications->items(),
            'pagination' => [
                'current_page' => $paginatedNotifications->currentPage(),
                'total' => $paginatedNotifications->total(),
                'per_page' => $paginatedNotifications->perPage(),
                'last_page' => $paginatedNotifications->lastPage(),
            ]
        ]);
    }

    /**
     * Mark all notifications as read (admin)
     */
    public function adminMarkAllAsRead(Request $request): JsonResponse
    {
        $adminId = $request->user()?->id;

        if (!$adminId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get all notification IDs
        $allNotificationIds = NotificationMessage::pluck('id')->toArray();

        // Insert records for all notifications this admin hasn't marked as read yet
        foreach ($allNotificationIds as $notificationId) {
            $exists = \DB::table('admin_read_notifications')
                ->where('admin_id', $adminId)
                ->where('notification_id', $notificationId)
                ->first();
            
            if (!$exists) {
                \DB::table('admin_read_notifications')->insert([
                    'admin_id' => $adminId,
                    'notification_id' => $notificationId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'All notifications marked as read (admin)',
        ]);
    }
}
