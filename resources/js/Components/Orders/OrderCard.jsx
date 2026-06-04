import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ChevronRight, Calendar, DollarSign, Users } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrderCard({ order }) {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    const itemCount = order.items?.length || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
        >
            <Link href={`/orders/${order.id}`}>
                <div className="cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-gray-900">
                                    Order #{order.order_number}
                                </span>
                                <OrderStatusBadge status={order.status} size="sm" />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {orderDate}
                                </span>
                                <span className="text-gray-400">at {orderTime}</span>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Items
                            </p>
                            <p className="flex items-center gap-1 font-semibold text-gray-900">
                                <Users size={14} className="text-orange-500" />
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Total
                            </p>
                            <p className="flex items-center gap-1 font-semibold text-orange-500">
                                <DollarSign size={14} />
                                ₦{order.total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Order Type */}
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                            {order.type}
                        </span>
                    </div>

                    {/* CTA */}
                    <motion.button
                        whileHover={{ x: 2 }}
                        className="w-full py-2 text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center justify-center gap-1"
                    >
                        View Details
                        <ChevronRight size={16} />
                    </motion.button>
                </div>
            </Link>
        </motion.div>
    );
}
