import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Button from '../../Components/UI/Button';

export default function OrderConfirmation({ order = {} }) {
    const orderData = order.order || order;
    const [liveStatus, setLiveStatus] = useState(orderData.status || 'pending');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Poll for status updates every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/orders/${orderData.id}`);
                const data = await response.json();
                if (data.status) {
                    setLiveStatus(data.order_status);
                }
            } catch (error) {
                console.error('Error fetching order status:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [orderData.id]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`/api/orders/${orderData.id}`);
            const data = await response.json();
            if (data.status) {
                setLiveStatus(data.order_status);
            }
        } catch (error) {
            console.error('Error refreshing status:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'preparing': 'bg-orange-100 text-orange-800',
        'ready': 'bg-green-100 text-green-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
    };

    const getEstimatedTime = (type) => {
        if (type === 'dine-in') return '15-20 minutes';
        if (type === 'takeaway') return '20-25 minutes';
        if (type === 'delivery') return '30-45 minutes';
        return 'Soon';
    };

    return (
        <CustomerLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto py-12"
            >
                {/* Success Header */}
                <motion.div
                    variants={itemVariants}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            delay: 0.2,
                        }}
                        className="flex justify-center mb-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                            <CheckCircle
                                size={80}
                                className="text-green-500 relative"
                            />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for your order. We're preparing your delicious meal.
                    </p>
                </motion.div>

                {/* Order Details Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
                >
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm mb-1">
                                    Order Number
                                </p>
                                <p className="text-white text-2xl font-bold">
                                    #{orderData.order_number || 'N/A'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`px-4 py-2 rounded-full ${statusColors[liveStatus] || 'bg-gray-100'}`}>
                                    <p className="text-sm font-semibold capitalize">
                                        {liveStatus || 'Processing'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 180 }}
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all disabled:opacity-50"
                                >
                                    <RefreshCw 
                                        size={18} 
                                        className="text-white" 
                                        style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
                                    />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Timeline */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">
                                What's Next
                            </h3>
                            <div className="space-y-4">
                                {/* Step 1 */}
                                <div className="flex items-start">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">
                                            Order Received
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            We've received your order and started preparation
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 flex-shrink-0">
                                        <Clock size={20} className="text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">
                                            Preparing Your Order
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Estimated time: {getEstimatedTime(orderData.type)}
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                {orderData.type === 'delivery' && (
                                    <div className="flex items-start">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 flex-shrink-0">
                                            <MapPin size={20} className="text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-semibold text-gray-900">
                                                On the Way
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                We'll deliver to your address
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-8"></div>

                        {/* Order Summary */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Order Summary
                            </h3>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                                {orderData.items && orderData.items.length > 0 ? (
                                    orderData.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {item.menu_item_name}
                                                </p>
                                                {item.customization_notes && (
                                                    <p className="text-sm text-gray-500">
                                                        {item.customization_notes}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                ₦{(item.menu_item_price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600">No items found</p>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2">
                                {(() => {
                                    const subtotal = orderData.subtotal ? parseFloat(orderData.subtotal) : 0;
                                    const tax = subtotal * 0.1;
                                    const total = orderData.total ? parseFloat(orderData.total) : subtotal + tax;
                                    
                                    return (
                                        <>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₦{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax (10%)</span>
                                                <span>₦{tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                                <span>Total Amount</span>
                                                <span className="text-orange-500">₦{total.toFixed(2)}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-8"></div>

                        {/* Delivery Details */}
                        {orderData.type === 'delivery' && orderData.delivery_address && (
                            <motion.div variants={itemVariants} className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Delivery Address
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                                    <MapPin size={20} className="text-orange-500 mt-1 flex-shrink-0" />
                                    <p className="text-gray-700">
                                        {orderData.delivery_address}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Dine-in Details */}
                        {orderData.type === 'dine-in' && orderData.table_number && (
                            <motion.div variants={itemVariants} className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Table Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Table Number:</span>{' '}
                                        {orderData.table_number}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Special Notes */}
                        {orderData.notes && (
                            <motion.div variants={itemVariants} className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Special Requests
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700">{orderData.notes}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Contact Info */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3 mb-8"
                        >
                            <Phone size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Need help? Contact us at{' '}
                                    <span className="font-semibold text-blue-600">
                                        (555) 123-4567
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link href="/orders" className="flex-1">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full flex items-center justify-center space-x-2"
                        >
                            <span>Track Your Order</span>
                            <ArrowRight size={18} />
                        </Button>
                    </Link>
                    <Link href="/menu" className="flex-1">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="w-full"
                        >
                            Continue Shopping
                        </Button>
                    </Link>
                </motion.div>

                {/* Print & Share */}
                <motion.div
                    variants={itemVariants}
                    className="text-center mt-8"
                >
                    <button
                        onClick={() => window.print()}
                        className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                    >
                        Print Receipt
                    </button>
                </motion.div>
            </motion.div>
        </CustomerLayout>
    );
}
