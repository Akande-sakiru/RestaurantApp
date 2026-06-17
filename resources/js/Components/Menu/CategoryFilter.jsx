import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function CategoryFilter({
    categories = [],
    selectedCategory = '',
    onCategoryChange,
    menuItemCounts = {},
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="sticky top-8 space-y-2"
        >
            {/* All Items Button */}
            <motion.button
                variants={itemVariants}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryChange('')}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center justify-between group ${
                    !selectedCategory
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                <span>All Items</span>
                <ChevronRight
                    size={18}
                    className={`transition-transform ${
                        !selectedCategory
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                />
            </motion.button>

            {/* Category Items */}
            {categories.map((category) => {
                const count = menuItemCounts[category.id] || 0;
                const isSelected = selectedCategory === String(category.id);

                return (
                    <motion.button
                        key={category.id}
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onCategoryChange(category.id)}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-left flex items-center justify-between group ${
                            isSelected
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className="flex flex-col text-left">
                            <span>{category.name}</span>
                            <span
                                className={`text-xs font-normal ${
                                    isSelected ? 'text-orange-100' : 'text-gray-500'
                                }`}
                            >
                                {count} {count === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                        <ChevronRight
                            size={18}
                            className={`transition-transform ${
                                isSelected
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100'
                            }`}
                        />
                    </motion.button>
                );
            })}
        </motion.div>
    );
}
