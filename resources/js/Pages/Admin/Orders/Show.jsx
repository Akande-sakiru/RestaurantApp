import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import AdminLayout from "../../../Layouts/AdminLayout";
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    Users,
    MapPin,
} from "lucide-react";
import OrderStatusBadge from "../../../Components/Orders/OrderStatusBadge";

export default function ShowOrder({ order }) {
    const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const orderTime = new Date(order.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/admin/orders">
                            <motion.button
                                whileHover={{ x: -2 }}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Orders
                            </motion.button>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Order #{order.order_number}
                                </h1>
                            </div>
                            <OrderStatusBadge status={order.status} size="lg" />
                        </div>
                    </motion.div>

                    {/* Order Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar
                                    size={18}
                                    className="text-orange-500"
                                />
                                <span className="text-sm text-gray-600">
                                    Date
                                </span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {orderDate}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={18} className="text-orange-500" />
                                <span className="text-sm text-gray-600">
                                    Time
                                </span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {orderTime}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={18} className="text-orange-500" />
                                <span className="text-sm text-gray-600">
                                    Items
                                </span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {order.items?.length || 0} items
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign
                                    size={18}
                                    className="text-orange-500"
                                />
                                <span className="text-sm text-gray-600">
                                    Total
                                </span>
                            </div>
                            <p className="font-semibold text-lg text-orange-600">
                                ₦{parseFloat(order.total).toFixed(2)}
                            </p>
                        </div>
                    </motion.div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Order Items */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white">
                                        Order Items
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {order.items?.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 flex justify-between items-start hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {item.menu_item_name}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Qty: {item.quantity}
                                                </p>
                                                {item.customization_notes && (
                                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                        {
                                                            item.customization_notes
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    ₦
                                                    {(
                                                        parseFloat(
                                                            item.menu_item_price,
                                                        ) * item.quantity
                                                    ).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    ₦
                                                    {parseFloat(
                                                        item.menu_item_price,
                                                    ).toFixed(2)}{" "}
                                                    each
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">
                                        Special Notes
                                    </h3>
                                    <p className="text-blue-800">
                                        {order.notes}
                                    </p>
                                </div>
                            )}

                            {order?.delivery_address && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">
                                        Delivery Address
                                    </h3>
                                    <p className="text-blue-800">
                                        {order?.delivery_address}
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Customer Info */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Name
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {order.user?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Email
                                        </p>
                                        <p className="font-medium text-gray-900 break-all">
                                            {order.user?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Phone
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {order?.delivery_phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Order Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            ₦
                                            {parseFloat(order.subtotal).toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-t border-gray-200">
                                        <span className="font-semibold text-gray-900">
                                            Total
                                        </span>
                                        <span className="font-bold text-lg text-orange-600">
                                            ₦
                                            {parseFloat(order.total).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Type */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Delivery Info
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full capitalize">
                                            {order.type}
                                        </span>
                                    </div>
                                    {order.delivery_address && (
                                        <div className="flex gap-2">
                                            <MapPin
                                                size={16}
                                                className="text-orange-500 flex-shrink-0 mt-1"
                                            />
                                            <p className="text-sm text-gray-700">
                                                {order.delivery_address}
                                            </p>
                                        </div>
                                    )}
                                    {order.table_number && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Table
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                #{order.table_number}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
