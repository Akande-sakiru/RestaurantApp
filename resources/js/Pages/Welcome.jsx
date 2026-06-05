import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import GuestLayout from '../Layouts/GuestLayout';
import Button from '../Components/UI/Button';
import MenuItemCard from '../Components/Menu/MenuItemCard';
import { mockMenuItems, mockCategories, mockRestaurantInfo } from '../mockData';

export default function Welcome({ 
    featuredItems = mockMenuItems, 
    restaurantInfo = mockRestaurantInfo,
    categories = mockCategories 
}) {
    const [carouselPosition, setCarouselPosition] = useState(0);
    
    // Use featured items for carousel, with fallback if empty
    const carouselItems = featuredItems && featuredItems.length > 0 ? featuredItems : mockMenuItems;

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselPosition((prev) => (prev + 1) % carouselItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const handleAddToCart = (itemId) => {
        router.post('/cart', { menu_item_id: itemId, quantity: 1 });
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    // Format hours object to string if needed
    const formatHours = (hours) => {
        if (typeof hours === 'string') {
            return hours;
        }
        if (typeof hours === 'object' && hours !== null) {
            return Object.entries(hours)
                .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`)
                .join(' | ');
        }
        return 'Hours not available';
    };

    const defaultInfo = {
        name: 'Restaurant',
        tagline: 'Experience culinary excellence',
        address: '123 Main Street, City, State 12345',
        hours: 'Mon-Thu: 11am - 10pm | Fri-Sat: 11am - 11pm | Sun: 12pm - 9pm',
        phone: '(555) 123-4567',
        ...restaurantInfo,
    };

    // Format hours if it's an object
    if (defaultInfo.hours && typeof defaultInfo.hours === 'object') {
        defaultInfo.hours = formatHours(defaultInfo.hours);
    }

    return (
        <GuestLayout>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center overflow-hidden pt-20 pb-20"
            >
                {/* Decorative Background Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-20 left-10 w-72 h-72 bg-orange-100 opacity-20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 opacity-15 rounded-full blur-3xl"
                />

                {/* Content Container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-6"
                            >
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-semibold">
                                    #1 Rated Fast Food Restaurant in New York
                                </span>
                            </motion.div>

                            {/* Main Heading */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight">
                                    Delicious
                                    <br />
                                    <span className="text-orange-500">Fast Food</span>
                                    <br />
                                    for Every
                                    <br />
                                    Moment
                                </h1>
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-gray-600 text-lg mb-8 max-w-md"
                            >
                                Experience bold flavors crafted from premium ingredients. From crispy burgers to gourmet pizzas – every bite is an adventure worth savoring.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link href="/menu">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center space-x-2"
                                    >
                                        <span>Explore Menu</span>
                                    </Button>
                                </Link>
                                <button className="flex items-center justify-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors font-semibold">
                                    <Play size={20} fill="currentColor" />
                                    <span>Watch Our Story</span>
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Right Content - Image with Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative h-96 lg:h-full flex items-center justify-center"
                        >
                            {/* Main Food Image Circle */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative w-80 h-80 lg:w-96 lg:h-96"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full shadow-2xl overflow-hidden">
                                    <img 
                                        src="/images/recipe.jpg" 
                                        alt="Delicious Food" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Hot Deal Card */}
                                <motion.div
                                    animate={{ rotate: [0, 5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 w-48"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm font-bold text-orange-500">Hot Deal</span>
                                    </div>
                                    <p className="text-gray-700 text-sm font-semibold">
                                        50% off on all burgers
                                    </p>
                                </motion.div>

                                {/* Delivery Time Card */}
                                <motion.div
                                    animate={{ rotate: [0, -5, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                    className="absolute -bottom-8 -right-12 bg-white rounded-2xl shadow-xl p-4 w-40"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-bold text-green-600">20 min</span>
                                    </div>
                                    <p className="text-gray-700 text-sm font-semibold">
                                        Fast delivery
                                    </p>
                                </motion.div>

                                {/* Rating Card */}
                                <motion.div
                                    animate={{ rotate: [0, 5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    className="absolute -bottom-4 -left-12 bg-white rounded-2xl shadow-xl p-4 w-40"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <span className="text-sm font-bold text-yellow-600">4.8/5</span>
                                    </div>
                                    <p className="text-gray-700 text-sm font-semibold">
                                        Customer rating
                                    </p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Categories Carousel Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-orange-500 to-red-500 py-4 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Carousel Container */}
                    <div className="relative overflow-hidden">
                        <motion.div
                            className="flex gap-3"
                            animate={{
                                x: -carouselPosition * 160,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            {carouselItems.map((item, index) => (
                                <motion.div
                                    key={`${item.id}-${index}`}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex-shrink-0 w-40 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 cursor-pointer hover:bg-opacity-20 transition-all border border-white border-opacity-20 flex items-center justify-center"
                                >
                                    <h4 className="text-white font-semibold text-xs text-center whitespace-nowrap">
                                        {item.name}
                                    </h4>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Browse by Category Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="py-16 bg-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-orange-500 font-semibold mb-2">
                            What We Offer
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Browse by{' '}
                            <span className="text-orange-500">Category</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            From sizzling burgers to exotic world cuisines – find
                            your favourite in our menu
                        </p>
                    </motion.div>

                    {/* Category Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
                    >
                        {/* All Items - Featured */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit('/menu')}
                            className="cursor-pointer group"
                        >
                            <div className="relative mb-4">
                                <motion.div
                                    className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden border-4 border-orange-500 shadow-lg"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <span className="text-6xl">🍽️</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center"
                                >
                                    <span className="text-white font-bold">
                                        View All
                                    </span>
                                </motion.div>
                            </div>
                            <h3 className="text-center font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                                All Items
                            </h3>
                            <p className="text-center text-sm text-gray-500">
                                {featuredItems.length} items
                            </p>
                        </motion.div>

                        {/* Other Categories - Display real categories from database */}
                        {categories && categories.length > 0 && categories.map((category) => (
                            <motion.div
                                key={category.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                    router.visit(`/menu?category=${category.id}`)
                                }
                                className="cursor-pointer group"
                            >
                                <div className="relative mb-4">
                                    <motion.div
                                        className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                        whileHover={{ rotate: -5 }}
                                    >
                                        <span className="text-5xl">🍽️</span>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center"
                                    >
                                        <span className="text-white font-bold text-sm">
                                            View
                                        </span>
                                    </motion.div>
                                </div>
                                <h3 className="text-center font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-center text-sm text-gray-500">
                                    {category.menu_items_count || 0} items
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Featured Items Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="py-16 bg-gradient-to-b from-white to-gray-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-orange-500 font-semibold mb-2">
                            What's Cooking
                        </p>
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                            Our Delicious{' '}
                            <span className="text-orange-500">Menu</span>
                        </h2>
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-1 bg-orange-500 rounded-full"></div>
                        </div>
                    </motion.div>

                    {/* Category Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-3 mb-12"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            All
                        </motion.button>
                        {categories && categories.length > 0 ? (
                            categories.map((category) => (
                                <motion.button
                                    key={category.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all"
                                >
                                    {category.name}
                                </motion.button>
                            ))
                        ) : (
                            ['Burgers', 'Pizza', 'Fried Chicken', 'Wraps', 'Desserts', 'Pasta'].map((category) => (
                                <motion.button
                                    key={category}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all"
                                >
                                    {category}
                                </motion.button>
                            ))
                        )}
                    </motion.div>

                    {/* Featured Items Grid */}
                    {featuredItems.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {featuredItems.slice(0, 6).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="group"
                                >
                                    {/* Card */}
                                    <motion.div
                                        whileHover={{ y: -8 }}
                                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-56 bg-gray-200 overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-6xl">
                                                    🍽️
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {index === 0 && (
                                                    <motion.div
                                                        animate={{ rotate: [0, 5, 0] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                                                    >
                                                        🔥 Hot
                                                    </motion.div>
                                                )}
                                                {index === 2 && (
                                                    <motion.div
                                                        animate={{ rotate: [0, -5, 0] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                                                    >
                                                        ⭐ Best Seller
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Heart Icon */}
                                            <motion.button
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all"
                                            >
                                                ♡
                                            </motion.button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Category */}
                                            <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
                                                {item.category?.name || 'Menu'}
                                            </p>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                                                {item.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {item.description}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-orange-500">
                                                        ₦{parseFloat(item.price).toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="text-sm text-gray-600">
                                                            (50)
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Add Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() =>
                                                        handleAddToCart(item.id)
                                                    }
                                                    className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all"
                                                >
                                                    <span className="text-xl">+</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center py-12"
                        >
                            <p className="text-gray-600">
                                Featured items coming soon
                            </p>
                        </motion.div>
                    )}

                    {/* View All Button */}
                    {featuredItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-center mt-12"
                        >
                            <Link href="/menu">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                >
                                    View Full Menu
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </motion.section>

            {/* Info Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Address */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white p-8 rounded-lg shadow-md border border-gray-100"
                        >
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Location
                            </h3>
                            <p className="text-gray-600">
                                {defaultInfo.address}
                            </p>
                        </motion.div>

                        {/* Hours */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white p-8 rounded-lg shadow-md border border-gray-100"
                        >
                            <div className="text-4xl mb-4">🕐</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Hours
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {defaultInfo.hours}
                            </p>
                        </motion.div>

                        {/* Contact */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white p-8 rounded-lg shadow-md border border-gray-100"
                        >
                            <div className="text-4xl mb-4">📞</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Contact
                            </h3>
                            <p className="text-gray-600">
                                {defaultInfo.phone}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-4"
                    >
                        Ready to dine with us?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-xl mb-8 opacity-90"
                    >
                        Order online or make a reservation today
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href="/menu">
                            <Button
                                variant="primary"
                                size="lg"
                                className="bg-white text-orange-500 hover:bg-gray-100"
                            >
                                Order Now
                            </Button>
                        </Link>
                        <Link href="/reservations/create">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-orange-500"
                            >
                                Reserve Table
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Food Showcase Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="py-16 bg-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-orange-500 font-semibold mb-2">
                            Food Showcase
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Let's See Our{' '}
                            <span className="text-orange-500">Fast Food</span>
                        </h2>
                        <div className="flex justify-center">
                            <div className="w-24 h-1 bg-orange-500 rounded-full"></div>
                        </div>
                    </motion.div>

                    {/* Food Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6"
                    >
                        {/* Large Featured Item - Top Left (Burger) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="lg:row-span-2 cursor-pointer group"
                        >
                            <div className="relative h-full min-h-96 rounded-3xl overflow-hidden shadow-xl bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-9xl group-hover:scale-125 transition-transform duration-500">
                                    🍔
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-6"
                                >
                                    <div className="text-white">
                                        <motion.h3
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-3xl font-bold mb-2"
                                        >
                                            Classic Burger
                                        </motion.h3>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-sm text-gray-200"
                                        >
                                            Juicy & Delicious
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Top Right - Pizza */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="cursor-pointer group"
                        >
                            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-orange-700 flex items-center justify-center text-7xl group-hover:scale-125 transition-transform duration-500">
                                    🍕
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-4"
                                >
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Gourmet Pizza
                                    </motion.h3>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Middle Right - Fried Chicken */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="cursor-pointer group"
                        >
                            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center text-7xl group-hover:scale-125 transition-transform duration-500">
                                    🍗
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-4"
                                >
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Fried Chicken
                                    </motion.h3>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Bottom Left - Dessert */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="cursor-pointer group"
                        >
                            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center text-7xl group-hover:scale-125 transition-transform duration-500">
                                    🍰
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-4"
                                >
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Desserts
                                    </motion.h3>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Bottom Middle - Wrap */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="cursor-pointer group"
                        >
                            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-7xl group-hover:scale-125 transition-transform duration-500">
                                    🌯
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-4"
                                >
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Fresh Wraps
                                    </motion.h3>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Bottom Right - Pasta */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            className="cursor-pointer group"
                        >
                            <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg bg-gray-900">
                                <div className="w-full h-full bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center text-7xl group-hover:scale-125 transition-transform duration-500">
                                    🍝
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-start p-4"
                                >
                                    <motion.h3
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-bold text-white"
                                    >
                                        Pasta
                                    </motion.h3>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>
        </GuestLayout>
    );
}
