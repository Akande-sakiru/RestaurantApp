import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, Phone, Users, AlertCircle } from 'lucide-react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';


/**
 * Validation schema for reservation form
 * - Date must be today or later (no past dates)
 * - Time must be in HH:mm format
 * - Party size must be 1-20 people
 * - Special requests are optional and max 500 characters
 */
const reservationSchema = z.object({
    reserved_date: z
        .string()
        .min(1, 'Date is required')
        .refine((date) => {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate >= today;
        }, 'Date cannot be in the past'),
    reserved_time: z
        .string()
        .min(1, 'Time is required')
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    party_size: z
        .coerce
        .number()
        .int('Party size must be a whole number')
        .min(1, 'Party size must be at least 1')
        .max(20, 'Party size cannot exceed 20 people'),
    special_requests: z
        .string()
        .max(500, 'Special requests cannot exceed 500 characters')
        .optional()
        .or(z.literal('')),
});

/**
 * ReservationCreate Component
 * 
 * Features:
 * - Split layout with form and side info panel
 * - Production-ready form validation with Zod
 * - Date/time pickers with past date prevention
 * - Party size selector (1-20)
 * - Orange (#f97316) primary color matching restaurant theme
 * - Smooth animations with Framer Motion
 * - Error handling and loading states
 * - Fully responsive design
 */
export default function ReservationCreate() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [layoutMode] = useState('split'); // 'split' or 'full-width'

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(reservationSchema),
        mode: 'onBlur', // Validate on blur for better UX
        defaultValues: {
            reserved_date: '',
            reserved_time: '',
            party_size: 2,
            special_requests: '',
        },
    });

    const watchPartySize = watch('party_size');

    const onSubmit = (data) => {
        setIsSubmitting(true);
        router.post('/reservations', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Get today's date in YYYY-MM-DD format for min constraint
    const today = new Date().toISOString().split('T')[0];

    // Format hours object to string if needed
    const formatHours = (hours) => {
        if (typeof hours === 'string') {
            return hours;
        }
        if (typeof hours === 'object' && hours !== null) {
            return Object.entries(hours)
                .map(([day, time]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${time}`)
                .join(' | ');
        }
        return 'Hours not available';
    };

    const formattedHours = '';

    // Animation variants
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

    const sideItemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
    };

    // Render split layout with form on left, info on right
    if (layoutMode === 'split') {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                                Reserve Your Table
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl">
                                Join us for an unforgettable dining experience. Book your reservation now and secure the perfect table.
                            </p>
                        </motion.div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                            {/* Form Section - Left Column (2 cols) */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="lg:col-span-2"
                            >
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    {/* Form Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 md:px-8 py-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            Booking Details
                                        </h2>
                                        <p className="text-orange-100 mt-1 text-sm">
                                            Fill in your reservation information below
                                        </p>
                                    </div>

                                    {/* Form Body */}
                                    <div className="px-6 md:px-8 py-8">
                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                            className="space-y-6"
                                            noValidate
                                        >
                                            {/* Date Field */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="space-y-2"
                                            >
                                                <Input
                                                    type="date"
                                                    label="Reservation Date"
                                                    min={today}
                                                    {...register('reserved_date')}
                                                    error={errors.reserved_date?.message}
                                                    className="text-lg"
                                                />
                                                <p className="text-xs text-gray-500 ml-0">
                                                    Select a date from today onwards
                                                </p>
                                            </motion.div>

                                            {/* Time Field */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="space-y-2"
                                            >
                                                <Input
                                                    type="time"
                                                    label="Reservation Time"
                                                    {...register('reserved_time')}
                                                    error={errors.reserved_time?.message}
                                                    className="text-lg"
                                                />
                                                <p className="text-xs text-gray-500 ml-0">
                                                    Restaurant hours: Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 12pm-9pm
                                                </p>
                                            </motion.div>

                                            {/* Party Size with Visual Selector */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="space-y-3"
                                            >
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Party Size
                                                </label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[1, 2, 3, 4, 5].map((size) => (
                                                        <motion.button
                                                            key={size}
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const input = document.querySelector('input[name="party_size"]');
                                                                if (input) input.value = size;
                                                            }}
                                                            className={`py-3 px-2 rounded-lg font-semibold transition-all text-center ${
                                                                watchPartySize === size
                                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {size}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[6, 7, 8, 9].map((size) => (
                                                        <motion.button
                                                            key={size}
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const input = document.querySelector('input[name="party_size"]');
                                                                if (input) input.value = size;
                                                            }}
                                                            className={`py-3 px-2 rounded-lg font-semibold transition-all text-center ${
                                                                watchPartySize === size
                                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {size}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[10, 15, 20].map((size) => (
                                                        <motion.button
                                                            key={size}
                                                            type="button"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                const input = document.querySelector('input[name="party_size"]');
                                                                if (input) input.value = size;
                                                            }}
                                                            className={`py-3 px-2 rounded-lg font-semibold transition-all text-center ${
                                                                watchPartySize === size
                                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {size}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                                {/* Hidden number input for form data */}
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    className="hidden"
                                                    {...register('party_size')}
                                                />
                                                {errors.party_size && (
                                                    <p className="text-sm text-red-500 flex items-center gap-2">
                                                        <AlertCircle size={16} />
                                                        {errors.party_size.message}
                                                    </p>
                                                )}
                                            </motion.div>

                                            {/* Special Requests */}
                                            <motion.div variants={itemVariants}>
                                                <Textarea
                                                    label="Special Requests (Optional)"
                                                    placeholder="Any dietary restrictions, special occasions, or seating preferences?"
                                                    rows={4}
                                                    {...register('special_requests')}
                                                    error={errors.special_requests?.message}
                                                />
                                                <p className="text-xs text-gray-500 mt-2 ml-0">
                                                    Let us know if you have any special requirements
                                                </p>
                                            </motion.div>

                                            {/* Info Box */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 flex gap-3"
                                            >
                                                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                                <div className="text-sm text-orange-800">
                                                    <p className="font-semibold mb-1">
                                                        Important Information
                                                    </p>
                                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                                        <li>Confirmation will be sent to your email</li>
                                                        <li>We hold reservations for 15 minutes after the reserved time</li>
                                                        <li>For larger groups (20+), please call us directly</li>
                                                    </ul>
                                                </div>
                                            </motion.div>

                                            {/* Action Buttons */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="flex flex-col sm:flex-row gap-4 pt-4"
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    isLoading={isSubmitting}
                                                    disabled={isSubmitting}
                                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                                                >
                                                    {isSubmitting ? 'Booking...' : 'Confirm Reservation'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="lg"
                                                    onClick={() => router.visit('/reservations')}
                                                    disabled={isSubmitting}
                                                    className="flex-1"
                                                >
                                                    Cancel
                                                </Button>
                                            </motion.div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Info Panel - Right Column */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="lg:col-span-1 space-y-6"
                            >
                                {/* Restaurant Hours */}
                                <motion.div variants={sideItemVariants}>
                                    <Card hover className="bg-white border-2 border-orange-100 hover:border-orange-300">
                                        <CardBody className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-3 rounded-lg">
                                                    <Clock className="text-orange-500" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Hours
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {formattedHours}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>

                                {/* Call Us */}
                                <motion.div variants={sideItemVariants}>
                                    <Card hover className="bg-white border-2 border-orange-100 hover:border-orange-300">
                                        <CardBody className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-3 rounded-lg">
                                                    <Phone className="text-orange-500" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Call Us
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        (555) 123-4567
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        For immediate assistance
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>

                                {/* Group Sizes */}
                                <motion.div variants={sideItemVariants}>
                                    <Card hover className="bg-white border-2 border-orange-100 hover:border-orange-300">
                                        <CardBody className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-3 rounded-lg">
                                                    <Users className="text-orange-500" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Group Sizes
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        1-20 guests
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        For larger groups, please call us
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>

                                {/* Why Book With Us */}
                                <motion.div
                                    variants={sideItemVariants}
                                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
                                >
                                    <h3 className="font-semibold text-lg mb-4">
                                        Why Book With Us?
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-200 font-bold">✓</span>
                                            <span>Guaranteed table availability</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-200 font-bold">✓</span>
                                            <span>Instant email confirmation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-200 font-bold">✓</span>
                                            <span>Premium dining experience</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-200 font-bold">✓</span>
                                            <span>Special occasion support</span>
                                        </li>
                                    </ul>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }
}
