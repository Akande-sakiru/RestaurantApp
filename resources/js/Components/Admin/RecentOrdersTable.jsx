import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import OrderStatusBadge from '../Orders/OrderStatusBadge';

export default function RecentOrdersTable({ orders = [] }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                    <Link href="/admin/orders">
                        <motion.button
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-1 text-orange-100 hover:text-white transition-colors text-sm font-medium"
                        >
                            View All <ChevronRight size={16} />
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            {orders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="divide-y divide-gray-100"
                        >
                            {orders.map((order) => (
                                <motion.tr
                                    key={order.id}
                                    variants={rowVariants}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gray-900">
                                            #{order.order_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {order.user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.user?.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {order.items?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-orange-600">
                                            ₦{order.total}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <OrderStatusBadge status={order.status} size="sm" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
                                            >
                                                View
                                            </motion.button>
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-12 text-center"
                >
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-500 font-medium">No recent orders</p>
                </motion.div>
            )}
        </div>
    );
}
