import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Filter, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Input from '../../../Components/UI/Input';
import Select from '../../../Components/UI/Select';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';

const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'default',
    cancelled: 'danger',
};

const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function ReservationsIndex({ reservations = { data: [] }, pendingReservationCount = 0 }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');

    // Extract reservations from paginated response
    const reservationsList = Array.isArray(reservations) ? reservations : (reservations?.data || []);

    const today = new Date().toISOString().split('T')[0];

    const filteredReservations = reservationsList.filter((res) => {
        const customerName = res.user?.name || 'Unknown';
        const matchesSearch =
            res.reservation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || res.status === filterStatus;

        let matchesDate = true;
        if (filterDate === 'upcoming') {
            matchesDate = res.reserved_date >= today;
        } else if (filterDate === 'past') {
            matchesDate = res.reserved_date < today;
        }

        return matchesSearch && matchesStatus && matchesDate;
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

    const handleStatusChange = (resId, newStatus) => {
        router.patch(`/admin/reservations/${resId}/status`, { status: newStatus });
    };

    const upcomingCount = reservationsList.filter(
        (r) => r.reserved_date >= today && r.status !== 'cancelled'
    ).length;
    const totalGuests = filteredReservations.reduce((sum, res) => sum + res.party_size, 0);
    const confirmedCount = filteredReservations.filter((r) => r.status === 'confirmed').length;

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
                    <h1 className="text-3xl font-bold text-gray-900">Reservations Management</h1>
                    <p className="text-gray-600 mt-1">Manage and track all table reservations</p>
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
                                {filteredReservations.length}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Total Reservations</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-600">{upcomingCount}</div>
                            <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-orange-500">{totalGuests}</div>
                            <p className="text-sm text-gray-600 mt-1">Total Guests</p>
                        </CardBody>
                    </Card>
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {confirmedCount}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Confirmed</p>
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
                        placeholder="Search reservation or customer..."
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
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        size="md"
                        options={[
                            { value: 'all', label: 'All Dates' },
                            { value: 'upcoming', label: 'Upcoming' },
                            { value: 'past', label: 'Past' },
                        ]}
                    />
                </motion.div>

                {/* Reservations Table */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card>
                        <CardHeader className="border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                Reservations ({filteredReservations.length})
                            </h2>
                        </CardHeader>
                        <CardBody>
                            {filteredReservations.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredReservations.map((res, index) => (
                                        <motion.div
                                            key={res.id}
                                            variants={itemVariants}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left Section */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <h3 className="font-bold text-gray-900">
                                                            {res.reservation_number}
                                                        </h3>
                                                        <Badge variant={statusColors[res.status]}>
                                                            {statusLabels[res.status]}
                                                        </Badge>
                                                    </div>

                                                    <p className="font-medium text-gray-900 mb-3">
                                                        {res.user?.name || 'Unknown'}
                                                    </p>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Calendar
                                                                size={16}
                                                                className="text-gray-500"
                                                            />
                                                            <span className="text-gray-700">
                                                                {new Date(
                                                                    res.reserved_date
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Clock
                                                                size={16}
                                                                className="text-gray-500"
                                                            />
                                                            <span className="text-gray-700">
                                                                {res.reserved_time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Users
                                                                size={16}
                                                                className="text-gray-500"
                                                            />
                                                            <span className="text-gray-700">
                                                                {res.party_size} guests
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {res.user?.phone || 'N/A'}
                                                        </div>
                                                    </div>

                                                    {res.special_requests && (
                                                        <p className="text-sm text-gray-600 italic">
                                                            Note: {res.special_requests}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Right Section - Actions */}
                                                <div className="flex flex-col items-end space-y-2">
                                                    <Select
                                                        value={res.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(res.id, e.target.value)
                                                        }
                                                        size="sm"
                                                        options={statusOptions.map((status) => ({
                                                            value: status,
                                                            label: statusLabels[status],
                                                        }))}
                                                    />
                                                    <Link href={`/admin/reservations/${res.id}`}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Eye size={18} />
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="text-5xl mb-4">📅</div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No reservations found
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
