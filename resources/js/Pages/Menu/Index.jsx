import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import GuestLayout from '../../Layouts/GuestLayout';
import Input from '../../Components/UI/Input';
import Button from '../../Components/UI/Button';
import MenuItemCard from '../../Components/Menu/MenuItemCard';
import { router } from '@inertiajs/react';
import { mockMenuItems, mockCategories } from '../../mockData';

export default function MenuIndex({
    menuItems = mockMenuItems,
    categories = mockCategories,
    filters = {},
}) {
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || ''
    );
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        updateFilters({ category: categoryId, search: searchTerm });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        updateFilters({ category: selectedCategory, search: value });
    };

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams();
        if (newFilters.category) params.append('category', newFilters.category);
        if (newFilters.search) params.append('search', newFilters.search);

        router.get('/menu', Object.fromEntries(params), {
            preserveScroll: true,
        });
    };

    const handleAddToCart = (itemId) => {
        setIsLoading(true);
        router.post(
            '/cart',
            { menu_item_id: itemId, quantity: 1 },
            {
                onFinish: () => setIsLoading(false),
            }
        );
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

    return (
        <GuestLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <p className="text-orange-500 font-semibold mb-2">
                        What's Cooking
                    </p>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                        Our Delicious{' '}
                        <span className="text-orange-500">Menu</span>
                    </h1>
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-1 bg-orange-500 rounded-full"></div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12 space-y-6"
                >
                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-3 text-gray-400"
                            size={20}
                        />
                        <Input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-12"
                        />
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Categories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={
                                        selectedCategory === ''
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => handleCategoryChange('')}
                                >
                                    All
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={
                                            selectedCategory ===
                                            category.id.toString()
                                                ? 'primary'
                                                : 'secondary'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleCategoryChange(category.id)
                                        }
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Menu Items */}
                {menuItems.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {menuItems.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                            >
                                <MenuItemCard
                                    item={item}
                                    onAddToCart={handleAddToCart}
                                    isLoading={isLoading}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            No items found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search or filters
                        </p>
                    </motion.div>
                )}
            </div>
        </GuestLayout>
    );
}
