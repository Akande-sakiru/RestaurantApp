import { Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { useState, useEffect } from "react";
import GuestLayout from "../Layouts/GuestLayout";
import Button from "../Components/UI/Button";
import MenuItemCard from "../Components/Menu/MenuItemCard";

export default function Welcome({
    featuredItems = [],
    restaurantInfo = {},
    categories = [],
}) {
    const [carouselPosition, setCarouselPosition] = useState(0);

    // Use featured items for carousel, with fallback if empty
    const carouselItems =
        featuredItems && featuredItems.length > 0 ? featuredItems : [];

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselPosition((prev) => (prev + 1) % carouselItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const handleAddToCart = (itemId) => {
        router.post("/cart", { menu_item_id: itemId, quantity: 1 });
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
        if (typeof hours === "string") {
            return hours;
        }
        if (typeof hours === "object" && hours !== null) {
            return Object.entries(hours)
                .map(
                    ([day, time]) =>
                        `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`,
                )
                .join(" | ");
        }
        return "Hours not available";
    };

    const defaultInfo = {
        name: "Restaurant",
        tagline: "Experience culinary excellence",
        address: "02 GRA conference road, Ijebu-Ode, Ogun state",
        hours: "Mon-Thu: 11am - 10pm | Fri-Sat: 11am - 11pm | Sun: 12pm - 9pm",
        phone: "+234 805-793-8850",
        ...restaurantInfo,
    };

    // Format hours if it's an object
    if (defaultInfo.hours && typeof defaultInfo.hours === "object") {
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
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-20 left-10 w-72 h-72 bg-orange-100 opacity-20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                    }}
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
                                    #1 Rated Fast Food Restaurant in Ijebu-Ode
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
                                    <span className="text-orange-500">
                                        Fast Food
                                    </span>
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
                                Experience bold flavors crafted from premium
                                ingredients. From crispy burgers to gourmet
                                pizzas – every bite is an adventure worth
                                savoring.
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
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
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
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 w-48"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm font-bold text-orange-500">
                                            Hot Deal
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm font-semibold">
                                        50% off on all burgers
                                    </p>
                                </motion.div>

                                {/* Delivery Time Card */}
                                <motion.div
                                    animate={{ rotate: [0, -5, 0] }}
                                    transition={{
                                        duration: 3.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5,
                                    }}
                                    className="absolute -bottom-8 -right-12 bg-white rounded-2xl shadow-xl p-4 w-40"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-bold text-green-600">
                                            20 min
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm font-semibold">
                                        Fast delivery
                                    </p>
                                </motion.div>

                                {/* Rating Card */}
                                <motion.div
                                    animate={{ rotate: [0, 5, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1,
                                    }}
                                    className="absolute -bottom-4 -left-12 bg-white rounded-2xl shadow-xl p-4 w-40"
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <span className="text-sm font-bold text-yellow-600">
                                            4.8/5
                                        </span>
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
                                type: "spring",
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
                            Browse by{" "}
                            <span className="text-orange-500">Category</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            From sizzling burgers to exotic world cuisines –
                            find your favourite in our menu
                        </p>
                    </motion.div>

                    {/* Category Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                    >
                        {/* All Items - Featured */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit("/menu")}
                            className="cursor-pointer group"
                        >
                            <div className="relative mb-2">
                                <motion.div
                                    className="w-full aspect-square rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden border-3 border-orange-500 shadow-md"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <span className="text-4xl">🍽️</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center"
                                >
                                    <span className="text-white font-bold text-xs">
                                        View All
                                    </span>
                                </motion.div>
                            </div>
                            <h3 className="text-center font-bold text-gray-900 group-hover:text-orange-500 transition-colors text-sm">
                                All Items
                            </h3>
                            <p className="text-center text-xs text-gray-500">
                                {featuredItems.length} items
                            </p>
                        </motion.div>

                        {/* Other Categories - Display real categories from database */}
                        {categories &&
                            categories.length > 0 &&
                            categories.map((category) => (
                                <motion.div
                                    key={category.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        router.visit(
                                            `/menu?category=${category.id}`,
                                        )
                                    }
                                    className="cursor-pointer group"
                                >
                                    <div className="relative mb-2">
                                        <motion.div
                                            className="w-full aspect-square rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow border-2 border-gray-200"
                                            whileHover={{ rotate: -5 }}
                                        >
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl">
                                                    🍽️
                                                </span>
                                            )}
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center"
                                        >
                                            <span className="text-white font-bold text-xs">
                                                View
                                            </span>
                                        </motion.div>
                                    </div>
                                    <h3 className="text-center font-bold text-gray-900 group-hover:text-orange-500 transition-colors text-sm">
                                        {category.name}
                                    </h3>
                                    <p className="text-center text-xs text-gray-500">
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
                            Our Delicious{" "}
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
                            onClick={() => router.visit("/menu")}
                            className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        >
                            All
                        </motion.button>
                        {categories && categories.length > 0
                            ? categories.map((category) => (
                                  <motion.button
                                      key={category.id}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                          router.visit(
                                              `/menu?category=${category.id}`,
                                          )
                                      }
                                      className="px-6 py-2 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer"
                                  >
                                      {category.name}
                                  </motion.button>
                              ))
                            : [
                                  "Burgers",
                                  "Pizza",
                                  "Fried Chicken",
                                  "Wraps",
                                  "Desserts",
                                  "Pasta",
                              ].map((category) => (
                                  <motion.button
                                      key={category}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="px-6 py-2 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer"
                                  >
                                      {category}
                                  </motion.button>
                              ))}
                    </motion.div>

                    {/* Featured Items Grid */}
                    {featuredItems.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            {featuredItems.slice(0, 8).map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="group"
                                >
                                    {/* Card */}
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-40 bg-gray-200 overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-3xl">
                                                    🍽️
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                {index === 0 && (
                                                    <motion.div
                                                        animate={{
                                                            rotate: [0, 5, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                                                    >
                                                        🔥 Hot
                                                    </motion.div>
                                                )}
                                                {index === 2 && (
                                                    <motion.div
                                                        animate={{
                                                            rotate: [0, -5, 0],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                                                    >
                                                        ⭐ Best Seller
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Heart Icon */}
                                            <motion.button
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-all text-sm"
                                            >
                                                ♡
                                            </motion.button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                                            {/* Category */}
                                            <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-0.5">
                                                {item.category?.name || "Menu"}
                                            </p>

                                            {/* Title */}
                                            <h3 className="text-xs font-semibold text-gray-900 mb-0.5 group-hover:text-orange-500 transition-colors truncate">
                                                {item.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-xs mb-1.5 line-clamp-1">
                                                {item.description}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-auto">
                                                <div>
                                                    <p className="text-lg font-bold text-orange-500">
                                                        ₦
                                                        {parseFloat(
                                                            item.price,
                                                        ).toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center space-x-1 mt-0.5">
                                                        <span className="text-yellow-400 text-xs">
                                                            ★
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            (50)
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Add Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() =>
                                                        handleAddToCart(item.id)
                                                    }
                                                    className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-all text-sm"
                                                >
                                                    <span>+</span>
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
                            <p className="text-gray-600">{defaultInfo.phone}</p>
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
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-orange-500"
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
                            Let's See Our{" "}
                            <span className="text-orange-500">Fast Food</span>
                        </h2>
                        <div className="flex justify-center">
                            <div className="w-24 h-1 bg-orange-500 rounded-full"></div>
                        </div>
                    </motion.div>

                    {/* Food Grid */}
                    {categories && categories.length > 0 ? (
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                            {categories.slice(0, 6).map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -10,
                                        boxShadow:
                                            "0 20px 40px rgba(0,0,0,0.2)",
                                    }}
                                    className={`cursor-pointer group rounded-3xl overflow-hidden shadow-xl bg-gray-900 ${
                                        index === 0
                                            ? "md:col-span-1 lg:col-span-1 lg:row-span-2 auto-rows-[600px]"
                                            : ""
                                    }`}
                                >
                                    <div className="relative w-full h-full">
                                        {category.image_url ? (
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                                {/* Empty state - no fallback emoji */}
                                            </div>
                                        )}
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
                                                    className="text-2xl font-bold mb-1"
                                                >
                                                    {category.name}
                                                </motion.h3>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    whileHover={{ opacity: 1 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="text-sm text-gray-200"
                                                >
                                                    {category.menu_items_count ||
                                                        0}{" "}
                                                    items
                                                </motion.p>
                                            </div>
                                        </motion.div>
                                    </div>
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
                                Food showcase coming soon
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.section>
        </GuestLayout>
    );
}
