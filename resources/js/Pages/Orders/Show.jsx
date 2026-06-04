import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Badge from '../../Components/UI/Badge';
import Button from '../../Components/UI/Button';
import { Card, CardBody, CardHeader, CardFooter } from '../../Components/UI/Card';
import { mockOrders } from '../../mockData';

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

const statusSteps = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Completed' },
];

export default function OrderShow({ order = mockOrders[0] }) {
    const currentStepIndex = statusSteps.findIndex(
        (step) => step.key === order.status
    );

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

    return (
        <CustomerLayout>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <Link href="/orders" className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 mb-4">
                        <ArrowLeft size={20} />
                        <span>Back to Orders</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Order #{order.order_number}
                    </h1>
                </div>
                <Badge variant={statusColors[order.status]} size="lg">
                    {statusLabels[order.status]}
                </Badge>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Order Status
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    {statusSteps.map((step, index) => (
                                        <div
                                            key={step.key}
                                            className="flex flex-col items-center flex-1"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                                                    index <= currentStepIndex
                                                        ? 'bg-orange-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            >
                                                {index + 1}
                                            </motion.div>
                                            <span className="text-xs font-medium text-gray-600 text-center">
                                                {step.label}
                                            </span>

                                            {index < statusSteps.length - 1 && (
                                                <div
                                                    className={`h-1 w-full mt-2 ${
                                                        index < currentStepIndex
                                                            ? 'bg-orange-500'
                                                            : 'bg-gray-300'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Order Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Order Items
                                </h2>
                            </CardHeader>
                            <CardBody>
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {order.items?.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.menu_item_name}
                                                </h3>
                                                {item.customization_notes && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Note:{' '}
                                                        {item.customization_notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    {item.quantity}x ₦
                                                    {item.menu_item_price.toFixed(
                                                        2
                                                    )}
                                                </p>
                                                <p className="font-bold text-orange-500">
                                                    ₦
                                                    {(
                                                        item.menu_item_price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Order Details */}
                    {(order.delivery_address ||
                        order.table_number ||
                        order.notes) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Additional Details
                                    </h2>
                                </CardHeader>
                                <CardBody className="space-y-4">
                                    {order.delivery_address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin
                                                size={20}
                                                className="text-orange-500 mt-1"
                                            />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Delivery Address
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {order.delivery_address}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.table_number && (
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">🍽️</span>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Table Number
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {order.table_number}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.notes && (
                                        <div className="flex items-start space-x-3">
                                            <Clock
                                                size={20}
                                                className="text-orange-500 mt-1"
                                            />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Special Requests
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {order.notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-bold text-gray-900">
                                Order Summary
                            </h2>
                        </CardHeader>

                        <CardBody className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Order Date</span>
                                    <span>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Order Type</span>
                                    <span className="capitalize">
                                        {order.type?.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>
                                        ${order.subtotal?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>
                                        $
                                        {(
                                            order.total -
                                            order.subtotal
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-orange-500">
                                        ${order.total?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </CardBody>

                        <CardFooter>
                            <Link href="/menu" className="w-full">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="w-full"
                                >
                                    Order Again
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </CustomerLayout>
    );
}
