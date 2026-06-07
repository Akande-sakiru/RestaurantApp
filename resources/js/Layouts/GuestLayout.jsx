import { Link, usePage, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, LogOut, User, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Button from "../Components/UI/Button";
import Badge from "../Components/UI/Badge";
import NotificationBell from "../Components/Notifications/NotificationBell";

export default function GuestLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { auth, cart } = usePage().props;

    const getNavItems = () => {
        const baseItems = [
            { label: "Home", href: "/" },
            { label: "Menu", href: "/menu" },
            { label: "Reservation", href: "/reservations/create" },
        ];
        
        // Add Orders link only when user is logged in
        if (auth.user) {
            baseItems.push({ label: "Orders", href: "/orders" });
        }
        
        return baseItems;
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <div className="bg-gray-900 text-white text-sm py-2 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <span>📞 +1 (800) 123-4567</span>
                        <span>✉️ hello@sarahfood.com</span>
                        <span>📍 42 Flower Street, NY</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a
                            href="#"
                            className="hover:text-orange-500 transition-colors"
                        >
                            f
                        </a>
                        <a
                            href="#"
                            className="hover:text-orange-500 transition-colors"
                        >
                            t
                        </a>
                        <a
                            href="#"
                            className="hover:text-orange-500 transition-colors"
                        >
                            in
                        </a>
                        <a
                            href="#"
                            className="hover:text-orange-500 transition-colors"
                        >
                            ig
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 flex-shrink-0"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                            >
                                S
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Sarah
                                </h1>
                                <p className="text-xs text-gray-500">
                                    Fast Food & Restaurant
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {/* Search */}
                            <button className="p-2 text-gray-700 hover:text-orange-500 transition-colors">
                                <Search size={20} />
                            </button>

                            {/* Notifications - Show if logged in */}
                            {auth.user && <NotificationBell />}

                            {/* Cart Icon */}
                            {auth.user && (
                                <Link
                                    href="/cart"
                                    className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors"
                                >
                                    <ShoppingCart size={20} />
                                    {cart && cart.count > 0 && (
                                        <Badge
                                            variant="danger"
                                            size="sm"
                                            className="absolute -top-2 -right-2"
                                        >
                                            {cart.count}
                                        </Badge>
                                    )}
                                </Link>
                            )}

                            {/* Auth Section */}
                            {!auth.user ? (
                                <>
                                    <Link href="/login" className="no-underline">
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            className="text-gray-700 hover:text-orange-500 cursor-pointer"
                                            type="button"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/menu" className="no-underline">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            className="bg-orange-500 text-white hover:bg-orange-600 flex items-center space-x-1 cursor-pointer"
                                            type="button"
                                        >
                                            <span>🛒</span>
                                            <span>Order Now</span>
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    {/* Profile Menu */}
                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() =>
                                                setProfileMenuOpen(!profileMenuOpen)
                                            }
                                            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                                {auth.user.name
                                                    .split(' ')
                                                    .map(n => n.charAt(0))
                                                    .join('')
                                                    .toUpperCase()}
                                            </div>
                                            <span className="text-gray-700 font-medium text-sm">
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
                                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
                                                >
                                                    <Link href="/profile">
                                                        <motion.button
                                                            whileHover={{ x: 2 }}
                                                            className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                                                            onClick={() =>
                                                                setProfileMenuOpen(false)
                                                            }
                                                        >
                                                            <User size={16} />
                                                            <span>Profile</span>
                                                        </motion.button>
                                                    </Link>
                                                    <motion.button
                                                        whileHover={{ x: 2 }}
                                                        onClick={() => {
                                                            setProfileMenuOpen(false);
                                                            handleLogout();
                                                        }}
                                                        className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                                    >
                                                        <LogOut size={16} />
                                                        <span>Logout</span>
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-700 hover:text-orange-500"
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
                            className="lg:hidden pb-4 space-y-2 border-t border-gray-100"
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            {/* Mobile Cart Icon */}
                            {auth.user && (
                                <>
                                    <div className="px-4 py-2">
                                        <NotificationBell />
                                    </div>
                                    <Link
                                        href="/cart"
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ShoppingCart size={20} />
                                        <span>Cart</span>
                                        {cart && cart.count > 0 && (
                                            <Badge variant="danger" size="sm">
                                                {cart.count}
                                            </Badge>
                                        )}
                                    </Link>
                                </>
                            )}

                            <div className="px-4 py-2 space-y-2 border-t border-gray-100 mt-2 pt-2">
                                {!auth.user ? (
                                    <>
                                        <Link href="/login" className="w-full block no-underline">
                                            <Button
                                                variant="secondary"
                                                size="md"
                                                className="w-full text-gray-700 cursor-pointer"
                                                type="button"
                                            >
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/menu" className="w-full block no-underline">
                                            <Button
                                                variant="primary"
                                                size="md"
                                                className="w-full bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                                                type="button"
                                            >
                                                Order Now
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/profile" className="w-full block no-underline">
                                            <Button
                                                variant="secondary"
                                                size="md"
                                                className="w-full text-gray-700 flex items-center justify-center space-x-2 cursor-pointer"
                                                type="button"
                                            >
                                                <User size={16} />
                                                <span>Profile</span>
                                            </Button>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2 font-medium"
                                        >
                                            <LogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">Sarah</h3>
                            <p className="text-gray-400">
                                Experience fine dining at its best.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <Link
                                        href="/menu"
                                        className="hover:text-white transition-colors"
                                    >
                                        Menu
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/reservations/create"
                                        className="hover:text-white transition-colors"
                                    >
                                        Reserve
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>📞 (555) 123-4567</li>
                                <li>📧 info@sarah.com</li>
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
                            &copy; 2024 Sarah Restaurant. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
