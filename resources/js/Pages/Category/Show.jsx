import { motion } from 'framer-motion';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '../../Layouts/GuestLayout';
import Button from '../../Components/UI/Button';
import MenuItemCard from '../../Components/Menu/MenuItemCard';


export default function CategoryShow({ category = {}, items = [] }) {
    // Use mock items filtered by category if no items provided
    const displayItems = items.length > 0 ? items : [];
    const [viewMode, setViewMode] = useState('grid');

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

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <GuestLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.visit('/menu')}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-4 font-semibold"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Menu</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                                {category.name || 'Category'}
                            </h1>
                            <p className="text-gray-600">
                                {displayItems.length} delicious items available
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-lg transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Items */}
                {displayItems.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                                : 'space-y-4'
                        }
                    >
                        {displayItems.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                layout
                            >
                                <MenuItemCard
                                    item={item}
                                    onAddToCart={() => {}}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            No items found
                        </h3>
                        <p className="text-gray-600 mb-8">
                            This category doesn't have any items yet
                        </p>
                        <Link href="/menu">
                            <Button variant="primary" size="lg">
                                Browse All Menu
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </GuestLayout>
    );
}
