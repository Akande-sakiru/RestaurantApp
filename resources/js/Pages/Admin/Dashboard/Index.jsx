import { motion } from 'framer-motion';
import {
    ShoppingBag,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import StatsCard from '../../../Components/Admin/StatsCard';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';
import { mockDashboardStats } from '../../../mockData';

export default function AdminDashboard({
    todayOrders = mockDashboardStats.todayOrders,
    todayRevenue = mockDashboardStats.todayRevenue,
    pendingOrders = mockDashboardStats.pendingOrders,
    todayReservations = mockDashboardStats.todayReservations,
    pendingReservations = mockDashboardStats.pendingReservations,
    activeMenuItems = mockDashboardStats.activeMenuItems,
    categories = mockDashboardStats.categories,
    recentOrders = mockDashboardStats.recentOrders,
    todayReservationsList = mockDashboardStats.todayReservationsList,
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
                        value={todayOrders}
                        icon={ShoppingBag}
                        color="orange"
                        trend="+12% from yesterday"
                    />
                    <StatsCard
                        title="Total Revenue"
                        value={`$${todayRevenue.toFixed(2)}`}
                        icon={TrendingUp}
                        color="green"
                        trend="+8% from yesterday"
                    />
                    <StatsCard
                        title="Pending Orders"
                        value={pendingOrders}
                        icon={AlertCircle}
                        color="red"
                    />
                    <StatsCard
                        title="Today's Reservations"
                        value={todayReservations}
                        icon={Calendar}
                        color="blue"
                    />
                </motion.div>

                {/* Secondary Stats */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <StatsCard
                        title="Pending Reservations"
                        value={pendingReservations}
                        icon={Clock}
                        color="orange"
                    />
                    <StatsCard
                        title="Active Menu Items"
                        value={activeMenuItems}
                        icon={ShoppingBag}
                        color="green"
                    />
                    <StatsCard
                        title="Categories"
                        value={categories}
                        icon={TrendingUp}
                        color="blue"
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
                                                    ${order.total?.toFixed(2)}
                                                </p>
                                                <Badge
                                                    variant={
                                                        order.status ===
                                                        'pending'
                                                            ? 'warning'
                                                            : 'success'
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
                            {todayReservationsList.length > 0 ? (
                                <div className="space-y-4">
                                    {todayReservationsList
                                        .slice(0, 5)
                                        .map((reservation) => (
                                            <motion.div
                                                key={reservation.id}
                                                whileHover={{ x: 4 }}
                                                className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            reservation.user
                                                                ?.name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {reservation.party_size}{' '}
                                                        guests at{' '}
                                                        {
                                                            reservation.reserved_time
                                                        }
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        reservation.status ===
                                                        'pending'
                                                            ? 'warning'
                                                            : 'success'
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
