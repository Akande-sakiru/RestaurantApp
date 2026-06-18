import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import { Eye, Filter, Search, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import AdminLayout from "../../../Layouts/AdminLayout";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Select from "../../../Components/UI/Select";
import { Card, CardBody, CardHeader } from "../../../Components/UI/Card";
import Badge from "../../../Components/UI/Badge";

const statusColors = {
    pending: "warning",
    confirmed: "info",
    preparing: "info",
    ready: "success",
    completed: "success",
    cancelled: "danger",
};

const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
};

const statusOptions = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
];

export default function OrdersIndex({ orders = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Handle both paginated object and array formats
    const ordersList = Array.isArray(orders) ? orders : orders?.data || [];

    const filteredOrders = ordersList.filter((order) => {
        const matchesSearch =
            order.order_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.customer_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || order.status === filterStatus;
        const matchesType = filterType === "all" || order.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
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

    const handleStatusChange = (orderId, newStatus) => {
        router.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
    };

    const totalRevenue = filteredOrders.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
    );
    const completedCount = filteredOrders.filter(
        (o) => o.status === "completed"
    ).length;
    const pendingCount = filteredOrders.filter(
        (o) => o.status === "pending"
    ).length;

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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track all restaurant orders
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {filteredOrders.length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Total Orders
                            </p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                ₦{totalRevenue.toFixed(2)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Revenue
                            </p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {pendingCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Pending
                            </p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">
                                {completedCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Completed
                            </p>
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
                        placeholder="Search order or customer..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        size="md"
                        options={[
                            { value: 'all', label: 'All Status' },
                            ...statusOptions.map((s) => ({
                                value: s,
                                label: statusLabels[s],
                            })),
                        ]}
                    />
                    <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        size="md"
                        options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'dine-in', label: 'Dine-in' },
                            { value: 'takeaway', label: 'Takeaway' },
                            { value: 'delivery', label: 'Delivery' },
                        ]}
                    />
                </motion.div>

                {/* Orders Table */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card>
                        <CardHeader className="border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Orders ({filteredOrders.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {filteredOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Order #
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Customer
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Type
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Total
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                                    Time
                                                </th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map(
                                                (order, index) => (
                                                    <motion.tr
                                                        key={order.id}
                                                        variants={itemVariants}
                                                        whileHover={{
                                                            backgroundColor:
                                                                "#f9fafb",
                                                        }}
                                                        className="border-b border-gray-100 last:border-b-0 transition-colors"
                                                    >
                                                        <td className="py-4 px-4">
                                                            <p className="font-semibold text-gray-900">
                                                                {
                                                                    order.order_number
                                                                }
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {
                                                                        order.customer_name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        order.items_count
                                                                    }{" "}
                                                                    items
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <Badge
                                                                variant={
                                                                    order.type ===
                                                                    "dine-in"
                                                                        ? "default"
                                                                        : order.type ===
                                                                          "takeaway"
                                                                        ? "warning"
                                                                        : "info"
                                                                }
                                                            >
                                                                {order.type
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    order.type
                                                                        .slice(
                                                                            1
                                                                        )
                                                                        .replace(
                                                                            "-",
                                                                            " "
                                                                        )}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <Select
                                                                value={
                                                                    order.status
                                                                }
                                                                onChange={(e) =>
                                                                    handleStatusChange(
                                                                        order.id,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                size="sm"
                                                                options={statusOptions.map(
                                                                    (status) => ({
                                                                        value: status,
                                                                        label: statusLabels[status],
                                                                    })
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <p className="font-bold text-orange-500">
                                                                ₦
                                                                {parseFloat(
                                                                    order.total
                                                                ).toFixed(2)}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(
                                                                    order.created_at
                                                                ).toLocaleTimeString()}
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <Link
                                                                href={`/admin/orders/${order.id}`}
                                                            >
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.95,
                                                                    }}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </motion.button>
                                                            </Link>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="text-5xl mb-4">📦</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No orders found
                                    </h3>
                                    <p className="text-gray-600">
                                        Try adjusting your search or filter
                                        criteria
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
