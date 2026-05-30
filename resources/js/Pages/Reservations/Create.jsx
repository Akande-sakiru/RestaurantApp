import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';
import { mockRestaurantInfo } from '../../mockData';

const reservationSchema = z.object({
    reserved_date: z.string().min(1, 'Date is required'),
    reserved_time: z.string().min(1, 'Time is required'),
    party_size: z.coerce
        .number()
        .min(1, 'Party size must be at least 1')
        .max(20, 'Party size cannot exceed 20'),
    special_requests: z.string().optional(),
});

export default function ReservationCreate() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reservationSchema),
    });

    const onSubmit = (data) => {
        setIsSubmitting(true);
        router.post('/reservations', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

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
        <CustomerLayout>
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Make a Reservation
                    </h1>
                    <p className="text-gray-600">
                        Book a table at our restaurant
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-bold text-gray-900">
                                Reservation Details
                            </h2>
                        </CardHeader>

                        <CardBody>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {/* Date */}
                                <motion.div variants={itemVariants}>
                                    <Input
                                        type="date"
                                        label="Reservation Date"
                                        min={today}
                                        {...register('reserved_date')}
                                        error={errors.reserved_date?.message}
                                    />
                                </motion.div>

                                {/* Time */}
                                <motion.div variants={itemVariants}>
                                    <Input
                                        type="time"
                                        label="Reservation Time"
                                        {...register('reserved_time')}
                                        error={errors.reserved_time?.message}
                                    />
                                </motion.div>

                                {/* Party Size */}
                                <motion.div variants={itemVariants}>
                                    <Input
                                        type="number"
                                        label="Party Size"
                                        placeholder="Number of guests"
                                        min="1"
                                        max="20"
                                        {...register('party_size')}
                                        error={errors.party_size?.message}
                                    />
                                </motion.div>

                                {/* Special Requests */}
                                <motion.div variants={itemVariants}>
                                    <Textarea
                                        label="Special Requests"
                                        placeholder="Any special requests or dietary requirements?"
                                        rows={4}
                                        {...register('special_requests')}
                                        error={errors.special_requests?.message}
                                    />
                                </motion.div>

                                {/* Info Box */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                >
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Your reservation
                                        will be confirmed via email. We'll hold
                                        your table for 15 minutes after the
                                        reserved time.
                                    </p>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex gap-4"
                                >
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        isLoading={isSubmitting}
                                        className="flex-1"
                                    >
                                        Confirm Reservation
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="lg"
                                        onClick={() =>
                                            router.visit('/reservations')
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                            </form>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-4xl mb-3">🕐</div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Hours
                            </h3>
                            <p className="text-sm text-gray-600">
                                {mockRestaurantInfo.hours}
                            </p>
                        </CardBody>
                    </Card>

                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-4xl mb-3">📞</div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Call Us
                            </h3>
                            <p className="text-sm text-gray-600">
                                {mockRestaurantInfo.phone}
                                <br />
                                For immediate assistance
                            </p>
                        </CardBody>
                    </Card>

                    <Card hover={false}>
                        <CardBody className="text-center">
                            <div className="text-4xl mb-3">👥</div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Group Sizes
                            </h3>
                            <p className="text-sm text-gray-600">
                                1-20 guests
                                <br />
                                Larger groups by request
                            </p>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </CustomerLayout>
    );
}
