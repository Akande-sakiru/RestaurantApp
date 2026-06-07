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
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $notificationId): JsonResponse
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

        // Update status to 'read'
        $notification->update(['status' => 'read']);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
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
}
