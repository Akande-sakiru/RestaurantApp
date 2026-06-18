import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import Badge from '../Components/UI/Badge';
import NotificationBell from '../Components/Notifications/NotificationBell';

export default function CustomerLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { auth, cart } = usePage().props;

    const navItems = [
        { label: 'Menu', href: '/menu', icon: '🍽️' },
        { label: 'My Orders', href: '/orders', icon: '📦' },
        { label: 'Reservations', href: '/reservations', icon: '📅' },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-2xl font-bold text-orange-500"
                            >
                                🍽️
                            </motion.div>
                            <span className="text-xl font-bold text-gray-900">
                                Restaurant
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-gray-700 hover:text-orange-500 transition-colors font-medium flex items-center space-x-1"
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Notifications */}
                            <NotificationBell />

                            {/* Cart */}
                            <Link
                                href="/cart"
                                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
                            >
                                <ShoppingCart size={24} />
                                {cart.count > 0 && (
                                    <Badge
                                        variant="danger"
                                        size="sm"
                                        className="absolute -top-2 -right-2"
                                    >
                                        {cart.count}
                                    </Badge>
                                )}
                            </Link>

                            {/* Profile Menu */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setProfileMenuOpen(!profileMenuOpen)
                                    }
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-700 font-medium">
                                        {auth.user.name}
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
                                        >
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() =>
                                                    setProfileMenuOpen(false)
                                                }
                                            >
                                                <User size={18} />
                                                <span>Profile</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setProfileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                            >
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Mobile Cart Icon Only */}
                        <Link
                            href="/cart"
                            className="md:hidden relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
                        >
                            <ShoppingCart size={24} />
                            {cart.count > 0 && (
                                <Badge
                                    variant="danger"
                                    size="sm"
                                    className="absolute -top-2 -right-2"
                                >
                                    {cart.count}
                                </Badge>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:text-orange-500"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="md:hidden pb-4 space-y-2 border-t border-gray-100"
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            {/* Mobile Actions */}
                            <div className="px-4 py-3 space-y-3 border-t border-gray-100 mt-2">
                                {/* Notifications */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                                    <NotificationBell />
                                </div>
                                
                                {/* Cart */}
                                <Link
                                    href="/cart"
                                    className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="text-sm font-medium">Cart</span>
                                    {cart.count > 0 && (
                                        <Badge variant="danger" size="sm">
                                            {cart.count}
                                        </Badge>
                                    )}
                                </Link>
                            </div>

                            {/* Profile Section */}
                            <div className="px-4 py-3 space-y-2 border-t border-gray-100 mt-2">
                                <Link
                                    href="/profile"
                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    👤 Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">Restaurant</h3>
                            <p className="text-gray-400">
                                Experience fine dining at its best.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <Link href="/menu" className="hover:text-white">
                                        Menu
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/orders"
                                        className="hover:text-white"
                                    >
                                        My Orders
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>📞 (+234)8057-938-850</li>
                                <li>📧 info@restaurant.com</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Hours</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Mon-Thu: 11am - 10pm</li>
                                <li>Fri-Sat: 11am - 11pm</li>
                                <li>Sun: 12pm - 9pm</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>
                            &copy; 2024 Restaurant App. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
