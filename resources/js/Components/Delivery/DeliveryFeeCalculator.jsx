import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, AlertCircle, CheckCircle, Navigation, Map } from 'lucide-react';
import useDeliveryFee from '../../Hooks/useDeliveryFee';
import useGeocoding from '../../Hooks/useGeocoding';
import AddressAutocomplete from '../AddressAutocomplete/AddressAutocomplete';
import Button from '../UI/Button';

/**
 * DeliveryFeeCalculator Component
 * Handles geolocation, address input, and delivery fee calculation for checkout
 */
export default function DeliveryFeeCalculator({
    restaurantLatitude,
    restaurantLongitude,
    restaurantId,
    maxDeliveryRadius = 20,
    onDeliveryDataChange,
    initialAddress = '',
}) {
    const {
        isLoading: isDeliveryLoading,
        error: deliveryError,
        deliveryData,
        isLocationSupported,
        getLocationAndCalculateFee,
        calculateDeliveryFee: apiCalculate,
        clearDeliveryData,
    } = useDeliveryFee();

    const {
        isLoading: isGeocodingLoading,
        error: geocodingError,
        addressToCoordinates,
        clearError: clearGeocodingError,
    } = useGeocoding();

    const [manualCoordinates, setManualCoordinates] = useState({
        latitude: '',
        longitude: '',
    });

    const [addressInput, setAddressInput] = useState(initialAddress);
    const [mode, setMode] = useState('geolocation'); // 'geolocation', 'address', 'coordinates'
    const [isLoading, setIsLoading] = useState(false);

    // Combine loading states
    const loading = isDeliveryLoading || isGeocodingLoading || isLoading;
    const error = deliveryError || geocodingError;

    // Notify parent component when delivery data changes
    useEffect(() => {
        if (deliveryData && onDeliveryDataChange) {
            onDeliveryDataChange({
                distance_km: deliveryData.distance_km,
                delivery_fee: deliveryData.delivery_fee,
                is_available: deliveryData.is_available,
                customer_latitude: deliveryData.customer_latitude,
                customer_longitude: deliveryData.customer_longitude,
            });
        }
    }, [deliveryData, onDeliveryDataChange]);

    /**
     * Handle getting current location and calculating fee
     */
    const handleGetLocation = async () => {
        try {
            if (!restaurantLatitude || !restaurantLongitude) {
                throw new Error('Restaurant location not configured');
            }

            await getLocationAndCalculateFee(restaurantId);
        } catch (err) {
            console.error('Error:', err.message);
        }
    };

    /**
     * Handle address input and conversion to coordinates
     */
    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        if (!addressInput.trim()) {
            alert('Please enter a delivery address');
            return;
        }

        if (!restaurantLatitude || !restaurantLongitude) {
            throw new Error('Restaurant location not configured');
        }

        try {
            setIsLoading(true);
            clearGeocodingError();

            const result = await addressToCoordinates(addressInput.trim());

            // Calculate delivery fee with the geocoded coordinates
            await apiCalculate(result.latitude, result.longitude, restaurantId);
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle manual coordinate entry
     */
    const handleManualCalculate = async () => {
        const { latitude, longitude } = manualCoordinates;

        if (!latitude || !longitude) {
            alert('Please enter both latitude and longitude');
            return;
        }

        if (
            isNaN(latitude) ||
            isNaN(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            alert('Invalid coordinates. Please check your values.');
            return;
        }

        try {
            await apiCalculate(parseFloat(latitude), parseFloat(longitude), restaurantId);
        } catch (err) {
            console.error('Error:', err.message);
        }
    };

    /**
     * Handle input change for manual coordinates
     */
    const handleCoordinateChange = (e) => {
        const { name, value } = e.target;
        setManualCoordinates((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MapPin size={24} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Details
                </h3>
            </div>

            {/* Restaurant Location Check */}
            {(!restaurantLatitude || !restaurantLongitude) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">
                            Restaurant Location Not Configured
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            Please contact the restaurant to configure delivery settings. Run command:
                        </p>
                        <p className="text-xs text-red-600 font-mono mt-1">
                            php artisan restaurant:configure latitude longitude --radius=20
                        </p>
                    </div>
                </div>
            )}

            {/* Location Support Check */}
            {!isLocationSupported && mode === 'geolocation' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                        Your browser doesn't support geolocation. Please enter address or coordinates.
                    </p>
                </div>
            )}

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2"
                    >
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Selection Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
                {isLocationSupported && (
                    <button
                        onClick={() => {
                            setMode('geolocation');
                            clearDeliveryData();
                        }}
                        className={`px-4 py-2 font-medium text-sm transition-colors ${
                            mode === 'geolocation'
                                ? 'text-orange-500 border-b-2 border-orange-500'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Navigation size={16} className="inline mr-2" />
                        My Location
                    </button>
                )}

                <button
                    onClick={() => {
                        setMode('address');
                        clearDeliveryData();
                    }}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                        mode === 'address'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Map size={16} className="inline mr-2" />
                    Address
                </button>

                <button
                    onClick={() => {
                        setMode('coordinates');
                        clearDeliveryData();
                    }}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                        mode === 'coordinates'
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Coordinates
                </button>
            </div>

            {/* Geolocation Mode */}
            {mode === 'geolocation' && isLocationSupported && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4"
                >
                    <Button
                        variant="primary"
                        size="md"
                        disabled={loading || !restaurantLatitude || !restaurantLongitude}
                        isLoading={loading}
                        onClick={handleGetLocation}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Navigation size={18} />
                        <span>Get My Location</span>
                    </Button>
                    {(!restaurantLatitude || !restaurantLongitude) && (
                        <p className="text-xs text-red-600 mt-2 text-center">
                            Restaurant location not configured
                        </p>
                    )}
                </motion.div>
            )}

            {/* Address Mode */}
            {mode === 'address' && (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddressSubmit}
                    className="mb-4 space-y-3"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Address
                        </label>
                        <AddressAutocomplete
                            onAddressSelect={(addressData) => {
                                setAddressInput(addressData.address);
                                // Auto-calculate delivery fee with selected coordinates
                                setIsLoading(true);
                                apiCalculate(addressData.latitude, addressData.longitude, restaurantId)
                                    .catch(err => console.error('Error calculating fee:', err.message))
                                    .finally(() => setIsLoading(false));
                            }}
                            placeholder="Start typing your delivery address..."
                            initialValue={addressInput}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Start typing to see address suggestions or enter your complete address
                        </p>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={loading || !restaurantLatitude || !restaurantLongitude}
                        isLoading={loading}
                        className="w-full"
                    >
                        Calculate Delivery Fee
                    </Button>
                    {(!restaurantLatitude || !restaurantLongitude) && (
                        <p className="text-xs text-red-600 text-center">
                            Restaurant location not configured
                        </p>
                    )}
                </motion.form>
            )}

            {/* Coordinates Mode */}
            {mode === 'coordinates' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 space-y-3"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                        </label>
                        <input
                            type="number"
                            name="latitude"
                            placeholder="e.g., 6.5244"
                            value={manualCoordinates.latitude}
                            onChange={handleCoordinateChange}
                            step="0.0001"
                            min="-90"
                            max="90"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                        </label>
                        <input
                            type="number"
                            name="longitude"
                            placeholder="e.g., 3.3792"
                            value={manualCoordinates.longitude}
                            onChange={handleCoordinateChange}
                            step="0.0001"
                            min="-180"
                            max="180"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        disabled={loading || !restaurantLatitude || !restaurantLongitude}
                        isLoading={loading}
                        onClick={handleManualCalculate}
                        className="w-full"
                    >
                        Calculate Fee
                    </Button>
                    {(!restaurantLatitude || !restaurantLongitude) && (
                        <p className="text-xs text-red-600 text-center">
                            Restaurant location not configured
                        </p>
                    )}
                </motion.div>
            )}

            {/* Delivery Data Display */}
            <AnimatePresence>
                {deliveryData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-lg border ${
                            deliveryData.is_available
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            {deliveryData.is_available ? (
                                <CheckCircle
                                    size={24}
                                    className="text-green-600 flex-shrink-0 mt-0.5"
                                />
                            ) : (
                                <AlertCircle
                                    size={24}
                                    className="text-red-600 flex-shrink-0 mt-0.5"
                                />
                            )}

                            <div className="flex-1">
                                {deliveryData.is_available ? (
                                    <>
                                        <h4 className="font-semibold text-green-900 mb-2">
                                            Delivery Available
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-green-700 font-medium">
                                                    {deliveryData.distance_km} km
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Distance
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-green-700 font-medium">
                                                    ₦{deliveryData.delivery_fee}
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Delivery Fee
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-green-700 font-medium">
                                                    {maxDeliveryRadius} km
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                    Max Radius
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-semibold text-red-900 mb-2">
                                            Outside Delivery Range
                                        </h4>
                                        <p className="text-sm text-red-700">
                                            Distance: {deliveryData.distance_km} km
                                        </p>
                                        <p className="text-sm text-red-700">
                                            Max delivery radius: {maxDeliveryRadius} km
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-6"
                >
                    <div className="text-center">
                        <Loader size={32} className="animate-spin text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                            Processing your address...
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Info Text */}
            {!deliveryData && !loading && (
                <p className="text-sm text-gray-500 text-center">
                    {mode === 'geolocation' && 'Get your location to calculate delivery fee'}
                    {mode === 'address' && 'Enter your delivery address to calculate fee'}
                    {mode === 'coordinates' && 'Enter coordinates to calculate fee'}
                </p>
            )}
        </div>
    );
}
