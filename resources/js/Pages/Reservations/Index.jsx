import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import { Calendar, Users, Clock, X } from 'lucide-react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Badge from '../../Components/UI/Badge';
import Button from '../../Components/UI/Button';
import { Card, CardBody } from '../../Components/UI/Card';


const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'default',
};

const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
};

export default function ReservationsIndex({ reservations = [] }) {
    const handleCancel = (reservationId) => {
        if (
            confirm(
                'Are you sure you want to cancel this reservation?'
            )
        ) {
            router.patch(`/reservations/${reservationId}/cancel`);
        }
    };

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

    if (reservations.length === 0) {
        return (
            <CustomerLayout>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        No reservations yet
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Book a table to secure your spot
                    </p>
                    <Link href="/reservations/create">
                        <Button 
                            variant="primary" 
                            size="lg"
                            className="px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
                        >
                            Make a Reservation
                        </Button>
                    </Link>
                </motion.div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        My Reservations
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Manage your table reservations
                    </p>
                </div>
                <Link href="/reservations/create" className="w-full sm:w-auto">
                    <Button 
                        variant="primary" 
                        size="lg"
                        className="px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
                    >
                        New Reservation
                    </Button>
                </Link>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {reservations.map((reservation) => (
                    <motion.div
                        key={reservation.id}
                        variants={itemVariants}
                        layout
                    >
                        <Card>
                            <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start space-x-2 sm:space-x-4">
                                        <div className="text-2xl sm:text-3xl flex-shrink-0">📅</div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 break-words text-sm sm:text-base">
                                                Reservation #{reservation.reservation_number}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span>
                                                        {new Date(
                                                            reservation.reserved_date
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} className="flex-shrink-0" />
                                                    <span>
                                                        {reservation.reserved_time}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users size={14} className="flex-shrink-0" />
                                                    <span>
                                                        {reservation.party_size}{' '}
                                                        guest
                                                        {reservation.party_size !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            {reservation.special_requests && (
                                                <p className="text-xs sm:text-sm text-gray-600 mt-2 break-words">
                                                    Note:{' '}
                                                    {reservation.special_requests}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2 flex-shrink-0">
                                    <Badge
                                        variant={
                                            statusColors[reservation.status]
                                        }
                                    >
                                        {statusLabels[reservation.status]}
                                    </Badge>

                                    {(reservation.status === 'pending' ||
                                        reservation.status === 'confirmed') && (
                                        <button
                                            onClick={() =>
                                                handleCancel(reservation.id)
                                            }
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <X size={18} className="sm:w-5 sm:h-5" />
                                        </button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </CustomerLayout>
    );
}
