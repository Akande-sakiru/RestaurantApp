import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Package, ChevronRight } from 'lucide-react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Badge from '../../Components/UI/Badge';
import Button from '../../Components/UI/Button';
import { Card, CardBody } from '../../Components/UI/Card';


const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    ready: 'success',
    completed: 'success',
    cancelled: 'danger',
};

const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function OrdersIndex({ orders = [] }) {
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
            transition: { duration: 0.3 },
        },
    };

    if (orders.length === 0) {
        return (
            <CustomerLayout>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        No orders yet
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Start by placing your first order
                    </p>
                    <Link href="/menu">
                        <Button 
                            variant="primary" 
                            size="lg"
                            className="px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
                        >
                            Browse Menu
                        </Button>
                    </Link>
                </motion.div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    My Orders
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Track and manage your orders
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        variants={itemVariants}
                        layout
                    >
                        <Link href={`/orders/${order.id}`}>
                            <Card hover>
                                <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start space-x-2 sm:space-x-4">
                                            <div className="text-2xl sm:text-3xl flex-shrink-0">
                                                {order.type === 'dine-in'
                                                    ? '🍽️'
                                                    : order.type === 'takeaway'
                                                      ? '📦'
                                                      : '🚗'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-gray-900 break-words text-sm sm:text-base">
                                                    Order #{order.order_number}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleDateString()}{' '}
                                                    at{' '}
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Total
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-orange-500">
                                                ₦{parseFloat(order.total).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <Badge
                                                variant={
                                                    statusColors[order.status]
                                                }
                                            >
                                                {statusLabels[order.status]}
                                            </Badge>
                                            <ChevronRight
                                                size={18}
                                                className="text-gray-400 flex-shrink-0 hidden sm:block"
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </CustomerLayout>
    );
}
