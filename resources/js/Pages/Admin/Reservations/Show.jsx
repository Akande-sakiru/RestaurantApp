import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ArrowLeft, Calendar, Clock, Users, Phone, Mail, MapPin } from 'lucide-react';
import OrderStatusBadge from '../../../Components/Orders/OrderStatusBadge';

export default function ShowReservation({ reservation }) {
    const reservationDate = new Date(
        reservation.reserved_date
    ).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const reservationTime = reservation.reserved_time;

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
                        <Link href="/admin/reservations">
                            <motion.button
                                whileHover={{ x: -2 }}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Reservations
                            </motion.button>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Reservation #{reservation.reservation_number}
                                </h1>
                            </div>
                            <OrderStatusBadge status={reservation.status} size="lg" />
                        </div>
                    </motion.div>

                    {/* Reservation Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    >
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar size={18} className="text-orange-500" />
                                <span className="text-sm text-gray-600">Date</span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {reservationDate}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={18} className="text-orange-500" />
                                <span className="text-sm text-gray-600">Time</span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {reservationTime}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={18} className="text-orange-500" />
                                <span className="text-sm text-gray-600">Party Size</span>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full capitalize">
                                {reservation.status}
                            </span>
                        </div>
                    </motion.div>

                    {/* Reservation Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Special Requests */}
                            {reservation.special_requests && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                        <h2 className="text-xl font-bold text-white">
                                            Special Requests
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {reservation.special_requests}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Reservation Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                    <h2 className="text-xl font-bold text-white">
                                        Reservation Information
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Reservation Number
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            #{reservation.reservation_number}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Party Size
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {reservation.party_size} people
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Reserved Date
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {reservationDate}
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            Reserved Time
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {reservationTime}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Customer Info */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Guest Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                            Name
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {reservation.user?.name}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail size={14} className="text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Email
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900 break-all ml-6 -mt-5">
                                            {reservation.user?.email}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone size={14} className="text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Phone
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900 ml-6 -mt-5">
                                            {reservation.user?.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Reservation Status
                                </h3>
                                <div className="flex justify-center">
                                    <OrderStatusBadge
                                        status={reservation.status}
                                        size="lg"
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-800">
                                    <span className="font-semibold">Note:</span> Reservations are held for 15 minutes after the reserved time.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
