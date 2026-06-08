import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, RotateCcw, Check } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Badge from '../UI/Badge';

export default function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pollingIntervalRef = useRef(null);

    // Polling-based notification fetching (no WebSocket required)
    useEffect(() => {
        if (auth?.user) {
            // Initial fetch
            fetchNotifications();

            // Set up polling every 3 seconds
            pollingIntervalRef.current = setInterval(fetchNotifications, 3000);

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [auth?.user]);

    const fetchNotifications = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            // Use admin endpoint if user is admin, otherwise use user endpoint
            const isAdmin = auth?.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.includes('admin');
            const endpoint = isAdmin ? '/admin/api/notifications' : '/api/notifications';
            
            console.log('Fetching notifications from:', endpoint, 'User roles:', auth?.user?.roles);
            
            const response = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include', // Include cookies/session
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            if (!response.ok) {
                console.error('Failed to fetch notifications:', response.status, response.statusText);
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
            const isAdmin = auth?.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.includes('admin');
            
            console.log('Marking notification as read:', {
                notificationId,
                isAdmin,
                userRoles: auth?.user?.roles
            });
            
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                credentials: 'include', // Include cookies/session
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Mark as read response:', data);
                
                // Update local state immediately
                if (isAdmin) {
                    // For admin: update admin_read flag
                    setNotifications(prev => {
                        const updated = prev.map(n => 
                            n.id === notificationId ? { ...n, admin_read: true } : n
                        );
                        console.log('Updated notifications (admin):', updated);
                        return updated;
                    });
                } else {
                    // For user: update status flag
                    setNotifications(prev => {
                        const updated = prev.map(n => 
                            n.id === notificationId ? { ...n, status: 'read' } : n
                        );
                        console.log('Updated notifications (user):', updated);
                        return updated;
                    });
                }
                // Recalculate unread count
                setUnreadCount(prev => {
                    const newCount = Math.max(0, prev - 1);
                    console.log('New unread count:', newCount);
                    return newCount;
                });
            } else {
                console.error('Failed to mark as read:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('Error response:', errorData);
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
                credentials: 'include', // Include cookies/session
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
        const isAdmin = auth?.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.includes('admin');
        
        // For admin: check admin_read status
        if (isAdmin) {
            if (notification.admin_read) {
                return <Check size={18} className="text-green-500" />;
            }
        } else {
            // For user: check status field
            if (notification.status === 'read') {
                return <Check size={18} className="text-green-500" />;
            }
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
        const isAdmin = auth?.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.includes('admin');
        
        if (isAdmin && notification.user) {
            // For admin: show user name + action
            return `${notification.user.name} - ${notification.title || 'Notification'}`;
        }
        
        // For user: just show the title
        if (notification.title) {
            return notification.title;
        }
        return 'Notification';
    };

    const getNotificationMessage = (notification) => {
        // Both admin and user see the same message
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
                                    {notifications.map((notification) => {
                                        const isAdmin = auth?.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.includes('admin');
                                        // For admin: check admin_read property, for user: check status
                                        const isRead = isAdmin 
                                            ? notification.admin_read === true 
                                            : notification.status === 'read';
                                        
                                        return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                                                isRead ? 'bg-white' : 'bg-red-50'
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
                                        );
                                    })}
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
