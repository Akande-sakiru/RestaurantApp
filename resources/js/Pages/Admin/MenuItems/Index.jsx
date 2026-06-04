import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Button from '../../../Components/UI/Button';
import Input from '../../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';

// Mock data
const mockMenuItems = [
    {
        id: 1,
        name: 'Classic Smash Burger',
        category: 'Burgers',
        price: 14.99,
        is_available: true,
        image_path: null,
        created_at: '2024-05-20',
    },
    {
        id: 2,
        name: 'Margherita Royale',
        category: 'Pizza',
        price: 19.99,
        is_available: true,
        image_path: null,
        created_at: '2024-05-21',
    },
    {
        id: 3,
        name: 'Nashville Hot Chicken',
        category: 'Fried Chicken',
        price: 12.99,
        is_available: false,
        image_path: null,
        created_at: '2024-05-22',
    },
    {
        id: 4,
        name: 'Mediterranean Wrap',
        category: 'Wraps',
        price: 11.99,
        is_available: true,
        image_path: null,
        created_at: '2024-05-23',
    },
    {
        id: 5,
        name: 'Chocolate Lava Cake',
        category: 'Desserts',
        price: 8.99,
        is_available: true,
        image_path: null,
        created_at: '2024-05-24',
    },
    {
        id: 6,
        name: 'Carbonara Pasta',
        category: 'Pasta',
        price: 15.99,
        is_available: true,
        image_path: null,
        created_at: '2024-05-25',
    },
];

export default function MenuItemsIndex({ menuItems = mockMenuItems }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Handle both paginated object and array formats
    const items = Array.isArray(menuItems) ? menuItems : (menuItems?.data || []);

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(items.map((item) => item.category))];

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
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(`/admin/menu-items/${id}`);
        }
    };

    const handleToggleAvailability = (id, currentStatus) => {
        router.patch(`/admin/menu-items/${id}/toggle-availability`, {
            is_available: !currentStatus,
        });
    };

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
                        <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your restaurant menu and items
                        </p>
                    </div>
                    <Link href="/admin/menu-items/create">
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Item</span>
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {items.length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Total Items</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {items.filter((i) => i.is_available).length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Available</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {items.filter((i) => !i.is_available).length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Unavailable</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {new Set(items.map((i) => i.category)).size}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Categories</p>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <Input
                        type="text"
                        placeholder="Search items..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Items Table */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card>
                        <CardHeader className="border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Menu Items ({filteredItems.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {filteredItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Name
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Category
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Price
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map((item, index) => (
                                                <motion.tr
                                                    key={item.id}
                                                    variants={itemVariants}
                                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                                    className="border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center text-xl">
                                                                🍽️
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(
                                                                        item.created_at
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge variant="default">
                                                            {item.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-semibold text-orange-500">
                                                            ₦{item.price.toFixed(2)}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge
                                                            variant={
                                                                item.is_available
                                                                    ? 'success'
                                                                    : 'danger'
                                                            }
                                                        >
                                                            {item.is_available
                                                                ? 'Available'
                                                                : 'Unavailable'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() =>
                                                                    handleToggleAvailability(
                                                                        item.id,
                                                                        item.is_available
                                                                    )
                                                                }
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title={
                                                                    item.is_available
                                                                        ? 'Mark unavailable'
                                                                        : 'Mark available'
                                                                }
                                                            >
                                                                {item.is_available ? (
                                                                    <Eye size={18} />
                                                                ) : (
                                                                    <EyeOff size={18} />
                                                                )}
                                                            </motion.button>
                                                            <Link href={`/admin/menu-items/${item.id}/edit`}>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </motion.button>
                                                            </Link>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() =>
                                                                    handleDelete(item.id)
                                                                }
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="text-5xl mb-4">🔍</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No items found
                                    </h3>
                                    <p className="text-gray-600">
                                        Try adjusting your search or filter criteria
                                    </p>
                                </motion.div>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
