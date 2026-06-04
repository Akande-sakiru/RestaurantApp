import { motion } from 'framer-motion';
import { Search, Filter, Edit2, Power, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Input from '../../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';

// Mock data
const mockUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@restaurant.com',
        phone: '+1 (555) 111-1111',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-15',
        orders: 0,
    },
    {
        id: 2,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        role: 'customer',
        is_active: true,
        created_at: '2024-05-20',
        orders: 5,
    },
    {
        id: 3,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 234-5678',
        role: 'customer',
        is_active: true,
        created_at: '2024-05-21',
        orders: 3,
    },
    {
        id: 4,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 (555) 345-6789',
        role: 'customer',
        is_active: false,
        created_at: '2024-05-18',
        orders: 2,
    },
    {
        id: 5,
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        phone: '+1 (555) 456-7890',
        role: 'customer',
        is_active: true,
        created_at: '2024-05-22',
        orders: 7,
    },
];

export default function UsersIndex({ users = mockUsers }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus =
            filterStatus === 'all' || (filterStatus === 'active' ? user.is_active : !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

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

    const handleToggleActive = (userId, currentStatus) => {
        router.patch(`/admin/users/${userId}/toggle-active`, {
            is_active: !currentStatus,
        });
    };

    const handleChangeRole = (userId, newRole) => {
        router.patch(`/admin/users/${userId}/role`, { role: newRole });
    };

    const activeCount = users.filter((u) => u.is_active).length;
    const customerCount = users.filter((u) => u.role === 'customer').length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const totalOrders = users.reduce((sum, u) => sum + u.orders, 0);

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
                >
                    <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">{users.length}</div>
                            <p className="text-sm text-gray-600 mt-1">Total Users</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-green-500">{activeCount}</div>
                            <p className="text-sm text-gray-600 mt-1">Active</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-blue-500">{customerCount}</div>
                            <p className="text-sm text-gray-600 mt-1">Customers</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-purple-500">{totalOrders}</div>
                            <p className="text-sm text-gray-600 mt-1">Total Orders</p>
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
                        placeholder="Search users..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card>
                        <CardHeader className="border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Users ({filteredUsers.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {filteredUsers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    User
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Contact
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Role
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Orders
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Joined
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    variants={itemVariants}
                                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                                    className="border-b border-gray-100 last:border-b-0 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <p className="font-semibold text-gray-900">
                                                                {user.name}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center space-x-1 text-sm">
                                                                <Mail size={14} className="text-gray-400" />
                                                                <span className="text-gray-600">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1 text-sm">
                                                                <Phone size={14} className="text-gray-400" />
                                                                <span className="text-gray-600">
                                                                    {user.phone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) =>
                                                                handleChangeRole(user.id, e.target.value)
                                                            }
                                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge
                                                            variant={user.is_active ? 'success' : 'danger'}
                                                        >
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="font-semibold text-gray-900">
                                                            {user.orders}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(
                                                                user.created_at
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    user.id,
                                                                    user.is_active
                                                                )
                                                            }
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                user.is_active
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-red-600 hover:bg-red-50'
                                                            }`}
                                                            title={
                                                                user.is_active
                                                                    ? 'Deactivate user'
                                                                    : 'Activate user'
                                                            }
                                                        >
                                                            <Power size={18} />
                                                        </motion.button>
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
                                    <div className="text-5xl mb-4">👥</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No users found
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
