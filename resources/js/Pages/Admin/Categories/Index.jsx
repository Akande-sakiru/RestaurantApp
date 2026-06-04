import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

// Mock data
const mockCategories = [
    { id: 1, name: 'Burgers', slug: 'burgers', items_count: 5, created_at: '2024-05-20' },
    { id: 2, name: 'Pizza', slug: 'pizza', items_count: 4, created_at: '2024-05-21' },
    { id: 3, name: 'Fried Chicken', slug: 'fried-chicken', items_count: 6, created_at: '2024-05-22' },
    { id: 4, name: 'Wraps', slug: 'wraps', items_count: 3, created_at: '2024-05-23' },
    { id: 5, name: 'Desserts', slug: 'desserts', items_count: 8, created_at: '2024-05-24' },
    { id: 6, name: 'Pasta', slug: 'pasta', items_count: 4, created_at: '2024-05-25' },
];

export default function CategoriesIndex({ categories = mockCategories }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Handle both paginated object and array formats
    const categoriesList = Array.isArray(categories) ? categories : (categories?.data || []);

    const filteredCategories = categoriesList.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    const totalItems = categoriesList.reduce((sum, cat) => sum + (cat.menu_items_count || 0), 0);

    return (
        <AdminLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600 mt-1">Manage menu categories</p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Category</span>
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {categoriesList.length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Total Categories</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-600">{totalItems}</div>
                            <p className="text-sm text-gray-600 mt-1">Total Items</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {(totalItems / categoriesList.length).toFixed(1)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Avg Items/Category</p>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Input
                        type="text"
                        placeholder="Search categories..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </motion.div>

                {/* Categories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredCategories.map((category) => (
                        <motion.div key={category.id} variants={itemVariants}>
                            <Card>
                                <CardBody>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                /{category.slug}
                                            </p>
                                        </div>
                                        <div className="text-3xl">📁</div>
                                    </div>

                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 mb-4">
                                        <p className="text-sm font-semibold text-orange-900">
                                            {category.menu_items_count || 0} items
                                        </p>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-4">
                                        Created:{' '}
                                        {new Date(category.created_at).toLocaleDateString()}
                                    </p>

                                    <div className="flex gap-2">
                                        <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center justify-center space-x-2"
                                            >
                                                <Edit2 size={16} />
                                                <span>Edit</span>
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleDelete(category.id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredCategories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No categories found
                        </h3>
                        <p className="text-gray-600">
                            Try adjusting your search or create a new category
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </AdminLayout>
    );
}
