import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AddressAutocomplete from '../../../Components/AddressAutocomplete/AddressAutocomplete';
import { Card, CardBody, CardHeader } from '../../../Components/UI/Card';

const settingsSchema = z.object({
    latitude: z.coerce
        .number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90'),
    longitude: z.coerce
        .number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180'),
    max_delivery_radius_km: z.coerce
        .number()
        .min(1, 'Maximum delivery radius must be at least 1 km')
        .max(100, 'Maximum delivery radius cannot exceed 100 km'),
});

export default function SettingsIndex({ restaurantSettings = {} }) {
    const { flash } = usePage().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            latitude: restaurantSettings.latitude || '',
            longitude: restaurantSettings.longitude || '',
            max_delivery_radius_km: restaurantSettings.max_delivery_radius_km || 20,
        },
    });

    const handleAddressSelect = (addressData) => {
        setSelectedAddress(addressData);
        setValue('latitude', addressData.latitude);
        setValue('longitude', addressData.longitude);
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            router.patch('/admin/settings', data, {
                onSuccess: () => {
                    setMessage({
                        type: 'success',
                        text: 'Restaurant settings updated successfully!',
                    });
                    setTimeout(() => setMessage(null), 4000);
                },
                onError: (errors) => {
                    setMessage({
                        type: 'error',
                        text: errors.error || 'Failed to update settings',
                    });
                },
                onFinish: () => setIsSubmitting(false),
            });
        } catch (err) {
            setMessage({
                type: 'error',
                text: 'An error occurred while updating settings',
            });
            setIsSubmitting(false);
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

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto space-y-6"
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Restaurant Settings
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Configure your restaurant location and delivery settings
                    </p>
                </motion.div>

                {/* Flash Messages */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg flex items-start space-x-3 ${
                            message.type === 'success'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p
                            className={`text-sm ${
                                message.type === 'success'
                                    ? 'text-green-700'
                                    : 'text-red-700'
                            }`}
                        >
                            {message.text}
                        </p>
                    </motion.div>
                )}

                {/* Settings Form */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <MapPin size={24} className="text-orange-500" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    Location & Delivery
                                </h2>
                            </div>
                        </CardHeader>

                        <CardBody>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Address Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Your Restaurant Address
                                    </label>
                                    <AddressAutocomplete
                                        onAddressSelect={handleAddressSelect}
                                        placeholder="Start typing your restaurant address..."
                                    />
                                    {selectedAddress && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Selected:</strong> {selectedAddress.address}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Lat: {selectedAddress.latitude.toFixed(4)}, Lng:{' '}
                                                {selectedAddress.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">
                                            Or enter manually
                                        </span>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-blue-800 font-medium">
                                            How to find your coordinates
                                        </p>
                                        <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                            <li>
                                                Visit{' '}
                                                <a
                                                    href="https://maps.google.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:text-blue-600"
                                                >
                                                    Google Maps
                                                </a>
                                            </li>
                                            <li>Search for your restaurant location</li>
                                            <li>
                                                Right-click on your location and click the coordinates at the top to copy
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Latitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="-90"
                                        max="90"
                                        placeholder="e.g., 6.5244"
                                        {...register('latitude')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 transition-colors ${
                                            errors.latitude
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.latitude && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.latitude.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Range: -90 to 90
                                    </p>
                                </div>

                                {/* Longitude */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="-180"
                                        max="180"
                                        placeholder="e.g., 3.3792"
                                        {...register('longitude')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 transition-colors ${
                                            errors.longitude
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.longitude && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.longitude.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Range: -180 to 180
                                    </p>
                                </div>

                                {/* Max Delivery Radius */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Delivery Radius (km)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        max="100"
                                        placeholder="e.g., 20"
                                        {...register('max_delivery_radius_km')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500 transition-colors ${
                                            errors.max_delivery_radius_km
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.max_delivery_radius_km && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.max_delivery_radius_km.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Range: 1 to 100 km
                                    </p>
                                </div>

                                {/* Pricing Info */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-900 mb-3">
                                        Delivery Fee Pricing Tiers
                                    </p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex justify-between">
                                            <span>0-2 km:</span>
                                            <span className="font-medium">₦500</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>2-5 km:</span>
                                            <span className="font-medium">₦1000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>5-10 km:</span>
                                            <span className="font-medium">₦1300</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>10-15 km:</span>
                                            <span className="font-medium">₦1700</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>15+ km:</span>
                                            <span className="font-medium">₦2000 per km</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                                        isSubmitting
                                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            <span>Saving Settings...</span>
                                        </>
                                    ) : (
                                        <span>Save Settings</span>
                                    )}
                                </motion.button>
                            </form>
                        </CardBody>
                    </Card>
                </motion.div>

                {/* Current Settings Display */}
                {restaurantSettings.latitude && restaurantSettings.longitude && (
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Current Configuration
                                </h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Latitude</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {restaurantSettings.latitude}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Longitude</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {restaurantSettings.longitude}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Max Delivery Radius</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {restaurantSettings.max_delivery_radius_km} km
                                    </p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                        ✓ Restaurant location is configured and ready for delivery orders
                                    </p>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </AdminLayout>
    );
}
