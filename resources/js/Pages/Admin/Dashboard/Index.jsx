import { motion } from "framer-motion";
import {
    ShoppingBag,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    AlertCircle,
} from "lucide-react";
import AdminLayout from "../../../Layouts/AdminLayout";
import StatsCard from "../../../Components/Admin/StatsCard";
import { Card, CardBody, CardHeader } from "../../../Components/UI/Card";
import Badge from "../../../Components/UI/Badge";

export default function AdminDashboard({
    todayOrderCount = 0,
    todayRevenue = 0,
    pendingOrderCount = 0,
    todayReservationCount = 0,
    pendingReservationCount = 0,
    activeMenuItemCount = 0,
    categoryCount = 0,
    recentOrders = [],
    todayReservations = [],
}) {
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
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Stats Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatsCard
                        title="Today's Orders"
                        value={todayOrderCount}
                        icon={ShoppingBag}
                        color="orange"
                        trend="+12% from yesterday"
                    />
                    <StatsCard
                        title="Total Revenue"
                        value={`₦${todayRevenue.toFixed(2)}`}
                        icon={TrendingUp}
                        color="orange"
                        trend="+8% from yesterday"
                    />
                    <StatsCard
                        title="Pending Orders"
                        value={pendingOrderCount}
                        icon={AlertCircle}
                        color="red"
                    />
                    <StatsCard
                        title="Today's Reservations"
                        value={todayReservationCount}
                        icon={Calendar}
                        color="orange"
                    />
                </motion.div>

                {/* Secondary Stats */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <StatsCard
                        title="Pending Reservations"
                        value={pendingReservationCount}
                        icon={Clock}
                        color="red"
                    />
                    <StatsCard
                        title="Active Menu Items"
                        value={activeMenuItemCount}
                        icon={ShoppingBag}
                        color="orange"
                    />
                    <StatsCard
                        title="Categories"
                        value={categoryCount}
                        icon={TrendingUp}
                        color="orange"
                    />
                </motion.div>

                {/* Recent Orders & Reservations */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-gray-900">
                                Recent Orders
                            </h3>
                        </CardHeader>
                        <CardBody>
                            {recentOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {recentOrders.slice(0, 5).map((order) => (
                                        <motion.div
                                            key={order.id}
                                            whileHover={{ x: 4 }}
                                            className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Order #{order.order_number}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.user?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-orange-500">
                                                    ₦{order.total?.toFixed(2)}
                                                </p>
                                                <Badge
                                                    variant={
                                                        order.status ===
                                                        "pending"
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                    size="sm"
                                                >
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No orders today
                                </p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Today's Reservations */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold text-gray-900">
                                Today's Reservations
                            </h3>
                        </CardHeader>
                        <CardBody>
                            {todayReservations.length > 0 ? (
                                <div className="space-y-4">
                                    {todayReservations
                                        .slice(0, 5)
                                        .map((reservation) => (
                                            <motion.div
                                                key={reservation.id}
                                                whileHover={{ x: 4 }}
                                                className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {reservation.user?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {reservation.party_size}{" "}
                                                        guests at{" "}
                                                        {
                                                            reservation.reserved_time
                                                        }
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        reservation.status ===
                                                        "pending"
                                                            ? "warning"
                                                            : "success"
                                                    }
                                                    size="sm"
                                                >
                                                    {reservation.status}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No reservations today
                                </p>
                            )}
                        </CardBody>
                    </Card>
                </motion.div>
            </motion.div>
        </AdminLayout>
    );
}
