import { Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Filter, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import MenuItemCard from '../../Components/Menu/MenuItemCard';
import Button from '../../Components/UI/Button';

export default function MenuIndex({ menuItems = [], categories = [], filters = {} }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loadingItems, setLoadingItems] = useState(new Set());

    // Filter menu items
    const filteredItems = useMemo(() => {
        let filtered = menuItems;

        if (selectedCategory) {
            filtered = filtered.filter((item) => item.category.id === parseInt(selectedCategory));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [menuItems, selectedCategory, searchQuery]);

    // Handle search change
    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    // Handle category filter
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    };

    // Handle add to cart
    const handleAddToCart = (itemId, quantity = 1) => {
        setLoadingItems((prev) => new Set(prev).add(itemId));

        router.post(
            '/cart',
            { menu_item_id: itemId, quantity },
            {
                onSuccess: () => {
                    setLoadingItems((prev) => {
                        const next = new Set(prev);
                        next.delete(itemId);
                        return next;
                    });
                    // Show success - the page stays on the menu
                },
                onError: (errors) => {
                    setLoadingItems((prev) => {
                        const next = new Set(prev);
                        next.delete(itemId);
                        return next;
                    });
                    console.error('Error adding to cart:', errors);
                },
            }
        );
    };

    // Animation variants
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

    return (
        <GuestLayout>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative min-h-64 bg-gradient-to-r from-orange-500 to-orange-600 pt-24 pb-16 overflow-hidden"
            >
                {/* Decorative Background Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-10 right-10 w-48 h-48 bg-orange-400 opacity-10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-0 left-0 w-64 h-64 bg-orange-700 opacity-10 rounded-full blur-3xl"
                />

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Our Menu
                        </h1>
                        <p className="text-lg md:text-xl text-orange-50 mb-6">
                            Discover our delicious selection of freshly prepared dishes crafted with premium ingredients
                        </p>
                        <p className="text-orange-100">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar - Category Filter and Search */}
                        <motion.aside
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`lg:col-span-1 ${
                                isFilterOpen ? 'block' : 'hidden lg:block'
                            }`}
                        >
                            {/* Close Button (Mobile) */}
                            <div className="lg:hidden mb-4 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Search Menu
                                </label>
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search dishes..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    />
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="sticky top-8">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                                    Categories
                                </h3>

                                {/* All Items Button */}
                                <motion.button
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCategoryChange('')}
                                    className={`w-full px-4 py-3 mb-2 rounded-lg font-medium transition-all text-left flex items-center justify-between group ${
                                        !selectedCategory
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <span>All Items</span>
                                    <ChevronRight
                                        size={18}
                                        className={`transition-transform ${
                                            !selectedCategory ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
                                        }`}
                                    />
                                </motion.button>

                                {/* Category Items */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-2"
                                >
                                    {categories.map((category) => {
                                        const categoryItemCount = menuItems.filter(
                                            (item) => item.category.id === category.id
                                        ).length;

                                        return (
                                            <motion.button
                                                key={category.id}
                                                variants={itemVariants}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleCategoryChange(category.id)}
                                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center justify-between group ${
                                                    selectedCategory === String(category.id)
                                                        ? 'bg-orange-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{category.name}</span>
                                                    <span
                                                        className={`text-xs font-normal ${
                                                            selectedCategory === String(category.id)
                                                                ? 'text-orange-100'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {categoryItemCount} {categoryItemCount === 1 ? 'item' : 'items'}
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    size={18}
                                                    className={`transition-transform ${
                                                        selectedCategory === String(category.id)
                                                            ? 'opacity-100 translate-x-0'
                                                            : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
                                                    }`}
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </motion.aside>

                        {/* Main Content - Menu Grid */}
                        <motion.main
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-3"
                        >
                            {/* Mobile Filter Button */}
                            <div className="lg:hidden mb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                >
                                    <Filter size={18} />
                                    <span>Filters & Search</span>
                                </motion.button>
                            </div>

                            {/* Results Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="mb-8 flex items-center justify-between"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {selectedCategory
                                            ? categories.find((c) => c.id === parseInt(selectedCategory))?.name ||
                                              'Menu Items'
                                            : 'All Menu Items'}
                                    </h2>
                                    <p className="text-gray-600">
                                        Showing {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
                                        {searchQuery && ` matching "${searchQuery}"`}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Menu Grid */}
                            {filteredItems.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {filteredItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                        >
                                            <MenuItemCard
                                                item={item}
                                                onAddToCart={handleAddToCart}
                                                isLoading={loadingItems.has(item.id)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="py-16 px-8 text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                        <span className="text-3xl">🔍</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        No items found
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchQuery
                                            ? `We couldn't find any dishes matching "${searchQuery}". Try a different search term.`
                                            : 'No dishes available in this category at the moment.'}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('');
                                        }}
                                        className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        <span>View All Items</span>
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.main>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 py-12 md:py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Order?
                        </h2>
                        <p className="text-lg text-orange-50 mb-8">
                            {auth?.user
                                ? 'Your cart is ready! Add items and proceed to checkout whenever you are ready.'
                                : 'Sign in to add items to your cart and place your order.'}
                        </p>
                        {!auth?.user && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </motion.button>
                                </Link>
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
                                    >
                                        Create Account
                                    </motion.button>
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.section>
        </GuestLayout>
    );
}
