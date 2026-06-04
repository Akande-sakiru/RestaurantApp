import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Users,
    Phone,
    ChevronRight,
    MapPin,
} from 'lucide-react';
import OrderStatusBadge from '../Orders/OrderStatusBadge';

export default function ReservationCard({ reservation }) {
    const reservationDate = new Date(
        reservation.reserved_date
    ).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const reservationTime = reservation.reserved_time;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
        >
            <Link href={`/reservations/${reservation.id}`}>
                <div className="cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-gray-900">
                                    Reservation #{reservation.reservation_number}
                                </span>
                                <OrderStatusBadge
                                    status={reservation.status}
                                    size="sm"
                                />
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-100">
                        <div className="flex items-start gap-3">
                            <Calendar
                                size={16}
                                className="text-orange-500 mt-1 flex-shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Date
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {reservationDate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock
                                size={16}
                                className="text-orange-500 mt-1 flex-shrink-0"
                            />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Time
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {reservationTime}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Party Size */}
                    <div className="mb-4 flex items-center gap-3">
                        <Users
                            size={16}
                            className="text-orange-500 flex-shrink-0"
                        />
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full">
                            {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
                        </span>
                    </div>

                    {/* Special Requests */}
                    {reservation.special_requests && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Special Requests
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                                {reservation.special_requests}
                            </p>
                        </div>
                    )}

                    {/* CTA */}
                    <motion.button
                        whileHover={{ x: 2 }}
                        className="w-full py-2 text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center justify-center gap-1"
                    >
                        View Details
                        <ChevronRight size={16} />
                    </motion.button>
                </div>
            </Link>
        </motion.div>
    );
}
