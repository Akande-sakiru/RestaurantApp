import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, RotateCcw, Check } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Badge from '../UI/Badge';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const echoRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Initialize Reverb/Echo connection
    useEffect(() => {
        if (auth?.user) {
            try {
                window.Pusher = Pusher;
                
                window.Echo = new Echo({
                    broadcaster: 'reverb',
                    key: import.meta.env.VITE_REVERB_APP_KEY,
                    wsHost: import.meta.env.VITE_REVERB_HOST,
                    wsPort: import.meta.env.VITE_REVERB_PORT,
                    wssPort: import.meta.env.VITE_REVERB_PORT,
                    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
                    enabledTransports: ['ws', 'wss'],
                });

                echoRef.current = window.Echo;

                // Subscribe to user's notification channel
                window.Echo.private(`users.${auth.user.id}`).listen('UserNotification', (data) => {
                    console.log('Real-time notification received:', data);
                    // Refresh notifications when real-time event arrives
                    fetchNotifications();
                }).error((error) => {
                    console.error('Reverb connection error:', error);
                });

            } catch (error) {
                console.error('Error initializing Echo:', error);
            }

            // Initial fetch
            fetchNotifications();

            // Set up polling as fallback (every 3 seconds)
            pollingIntervalRef.current = setInterval(fetchNotifications, 3000);

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
                if (echoRef.current) {
                    try {
                        echoRef.current.leaveChannel(`users.${auth.user.id}`);
                    } catch (e) {
                        console.error('Error leaving channel:', e);
                    }
                }
            };
        }
    }, [auth?.user]);

    const fetchNotifications = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            const response = await fetch('/api/notifications', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            if (!response.ok) {
                console.error('Failed to fetch notifications:', response.status);
                return;
            }
            
            const data = await response.json();
            console.log('Notifications fetched:', data);
            
            if (Array.isArray(data.notifications)) {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchNotifications();
    };

    const markAsRead = async (notificationId) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            if (response.ok) {
                console.log('Notification marked as read');
                // Update local state immediately
                setNotifications(prev => 
                    prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
                );
                // Recalculate unread count
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            if (response.ok) {
                console.log('Notification deleted');
                // Update local state immediately - remove the notification
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                // Recalculate unread count
                setUnreadCount(prev => {
                    const deleted = notifications.find(n => n.id === notificationId);
                    if (deleted && deleted.status === 'unread') {
                        return Math.max(0, prev - 1);
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (notification) => {
        // If notification has been read, show check mark
        if (notification.status === 'read') {
            return <Check size={18} className="text-green-500" />;
        }
        
        // Handle notification_messages table structure
        const title = notification.title || '';
        const message = notification.message || '';
        
        if (title.includes('confirmed') || message.includes('confirmed')) {
            return <CheckCircle size={18} className="text-green-500" />;
        }
        if (title.includes('updated') || title.includes('Updated') || message.includes('updated')) {
            return <AlertCircle size={18} className="text-blue-500" />;
        }
        return <Bell size={18} className="text-gray-500" />;
    };

    const getNotificationTitle = (notification) => {
        // Handle notification_messages table structure
        if (notification.title) {
            return notification.title;
        }
        return 'Notification';
    };

    const getNotificationMessage = (notification) => {
        // Handle notification_messages table structure
        if (notification.message) {
            return notification.message;
        }
        if (notification.title) {
            return notification.title;
        }
        return 'New Notification';
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
                title="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <Badge
                        variant="danger"
                        size="sm"
                        className="absolute -top-2 -right-2"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                        style={{ maxHeight: '600px' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex justify-between items-center">
                            <h3 className="text-white font-semibold">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-orange-700 p-1 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <div className="inline-block animate-spin">
                                        <Bell size={24} className="text-orange-500" />
                                    </div>
                                    <p className="mt-2">Loading...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                                                notification.status === 'unread' ? 'bg-red-50' : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div 
                                                    className="flex items-start space-x-3 flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <div className="mt-1 flex-shrink-0">
                                                        {getNotificationIcon(notification)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900">
                                                            {getNotificationTitle(notification)}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1 break-words">
                                                            {getNotificationMessage(notification)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                                <motion.button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    whileHover={{ scale: isRefreshing ? 1 : 1.05 }}
                                    whileTap={{ scale: isRefreshing ? 1 : 0.95 }}
                                    className="text-sm text-orange-500 hover:text-orange-600 font-medium w-full py-2 px-3 rounded hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <motion.div
                                        animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                                        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
                                    >
                                        <RotateCcw size={16} />
                                    </motion.div>
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
