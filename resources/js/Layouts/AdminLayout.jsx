import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    LogOut,
    User,
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingBag,
    Calendar,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../Components/UI/Badge';
import NotificationBell from '../Components/Notifications/NotificationBell';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { auth } = usePage().props;

    const navItems = [
        {
            label: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Categories',
            href: '/admin/categories',
            icon: Menu,
        },
        {
            label: 'Menu Items',
            href: '/admin/menu-items',
            icon: UtensilsCrossed,
        },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        {
            label: 'Reservations',
            href: '/admin/reservations',
            icon: Calendar,
        },
        { label: 'Users', href: '/admin/users', icon: Users },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } bg-gradient-to-b from-orange-600 to-red-600 text-white transition-all duration-300 fixed h-screen left-0 top-0 z-30 overflow-y-auto shadow-lg`}
            >
                <div className="p-6 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="text-2xl"
                            >
                                🍽️
                            </motion.div>
                            <span className="font-bold text-lg">Admin</span>
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? (
                            <X size={20} />
                        ) : (
                            <Menu size={20} />
                        )}
                    </motion.button>
                </div>

                <nav className="mt-8 space-y-2 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.href}
                                whileHover={{ x: 5 }}
                            >
                                <Link
                                    href={item.href}
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all group"
                                >
                                    <Icon size={20} />
                                    {sidebarOpen && (
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>
            </motion.aside>

            {/* Main Content */}
            <div
                className={`flex-1 ${
                    sidebarOpen ? 'ml-64' : 'ml-20'
                } transition-all duration-300`}
            >
                {/* Top Navigation */}
                <nav className="sticky top-0 z-20 bg-white border-b-2 border-orange-200 shadow-md">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>

                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <NotificationBell />

                            {/* Profile Menu */}
                            <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() =>
                                    setProfileMenuOpen(!profileMenuOpen)
                                }
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {auth.user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {auth.user.name}
                                </span>
                            </motion.button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {profileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border-2 border-orange-200 overflow-hidden"
                                    >
                                        <Link
                                            href="/profile"
                                            className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                            onClick={() =>
                                                setProfileMenuOpen(false)
                                            }
                                        >
                                            <User size={18} />
                                            <span>Profile</span>
                                        </Link>
                                        <motion.button
                                            whileHover={{ x: 2 }}
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t-2 border-orange-200"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
