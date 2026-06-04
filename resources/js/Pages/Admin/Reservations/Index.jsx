import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Filter, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Input from '../../../Components/UI/Input';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';
import Badge from '../../../Components/UI/Badge';

// Mock data
const mockReservations = [
    {
        id: 1,
        reservation_number: 'RES-20240525-001',
        customer_name: 'John Doe',
        party_size: 4,
        reserved_date: '2024-05-26',
        reserved_time: '19:00',
        status: 'confirmed',
        special_requests: 'Window seat if available',
        phone: '+1 (555) 123-4567',
        created_at: '2024-05-25T10:00:00',
    },
    {
        id: 2,
        reservation_number: 'RES-20240525-002',
        customer_name: 'Jane Smith',
        party_size: 2,
        reserved_date: '2024-05-27',
        reserved_time: '20:30',
        status: 'pending',
        special_requests: 'Celebration dinner - anniversary',
        phone: '+1 (555) 234-5678',
        created_at: '2024-05-25T11:30:00',
    },
    {
        id: 3,
        reservation_number: 'RES-20240525-003',
        customer_name: 'Mike Johnson',
        party_size: 6,
        reserved_date: '2024-05-28',
        reserved_time: '18:00',
        status: 'confirmed',
        special_requests: null,
        phone: '+1 (555) 345-6789',
        created_at: '2024-05-25T09:15:00',
    },
    {
        id: 4,
        reservation_number: 'RES-20240525-004',
        customer_name: 'Sarah Williams',
        party_size: 3,
        reserved_date: '2024-05-26',
        reserved_time: '18:30',
        status: 'completed',
        special_requests: 'High chair needed',
        phone: '+1 (555) 456-7890',
        created_at: '2024-05-24T14:20:00',
    },
    {
        id: 5,
        reservation_number: 'RES-20240525-005',
        customer_name: 'Alex Brown',
        party_size: 5,
        reserved_date: '2024-05-29',
        reserved_time: '19:30',
        status: 'cancelled',
        special_requests: null,
        phone: '+1 (555) 567-8901',
        created_at: '2024-05-25T08:00:00',
    },
];

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

export default function ReservationsIndex({ reservations = mockReservations }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');

    const today = new Date().toISOString().split('T')[0];

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.reservation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
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

    const upcomingCount = reservations.filter(
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
                    <div className="flex items-center space-x-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {statusLabels[status]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="all">All Dates</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </select>
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
                                                        {res.customer_name}
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
                                                            {res.phone}
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
                                                    <select
                                                        value={res.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(res.id, e.target.value)
                                                        }
                                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {statusLabels[status]}
                                                            </option>
                                                        ))}
                                                    </select>
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
