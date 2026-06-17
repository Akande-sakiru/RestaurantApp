import { useState, useCallback } from 'react';

/**
 * useDeliveryFee Hook
 * Handles geolocation and delivery fee calculation
 */
export default function useDeliveryFee() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deliveryData, setDeliveryData] = useState(null);
    const [isLocationSupported] = useState('geolocation' in navigator);

    /**
     * Get user's current location using browser geolocation API
     * @returns {Promise<{latitude: number, longitude: number}>}
     */
    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!isLocationSupported) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            setIsLoading(true);
            setError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                    setIsLoading(false);
                },
                (err) => {
                    let errorMessage = 'Unable to get your location';
                    
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage = 'Permission denied. Please enable location access in your browser settings.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case err.TIMEOUT:
                            errorMessage = 'The request to get user location timed out.';
                            break;
                        default:
                            errorMessage = err.message;
                    }

                    setError(errorMessage);
                    setIsLoading(false);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }, [isLocationSupported]);

    /**
     * Calculate delivery fee based on coordinates
     * @param {number} latitude - Customer latitude
     * @param {number} longitude - Customer longitude
     * @param {number} restaurantId - Restaurant ID (optional)
     * @returns {Promise<Object>} Delivery details
     */
    const calculateDeliveryFee = useCallback(
        async (latitude, longitude, restaurantId = null) => {
            try {
                setIsLoading(true);
                setError(null);

                const payload = {
                    customer_latitude: latitude,
                    customer_longitude: longitude,
                };

                if (restaurantId) {
                    payload.restaurant_id = restaurantId;
                }

                const response = await fetch('/api/delivery-fee/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content'),
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to calculate delivery fee'
                    );
                }

                setDeliveryData(data.data);
                setIsLoading(false);

                return data.data;
            } catch (err) {
                const errorMessage =
                    err.message || 'Failed to calculate delivery fee';
                setError(errorMessage);
                setIsLoading(false);
                throw err;
            }
        },
        []
    );

    /**
     * Get current location and calculate delivery fee in one action
     * @param {number} restaurantId - Restaurant ID (optional)
     * @returns {Promise<Object>} Delivery details
     */
    const getLocationAndCalculateFee = useCallback(
        async (restaurantId = null) => {
            try {
                const location = await getCurrentLocation();
                const delivery = await calculateDeliveryFee(
                    location.latitude,
                    location.longitude,
                    restaurantId
                );
                return { location, delivery };
            } catch (err) {
                setError(err.message);
                throw err;
            }
        },
        [getCurrentLocation, calculateDeliveryFee]
    );

    /**
     * Get pricing tiers
     * @returns {Promise<Array>} Pricing tiers
     */
    const getPricingTiers = useCallback(async () => {
        try {
            const response = await fetch('/api/delivery-fee/pricing-tiers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch pricing tiers');
            }

            return data.data;
        } catch (err) {
            console.error('Error fetching pricing tiers:', err);
            throw err;
        }
    }, []);

    /**
     * Clear delivery data and errors
     */
    const clearDeliveryData = useCallback(() => {
        setDeliveryData(null);
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        deliveryData,
        isLocationSupported,
        getCurrentLocation,
        calculateDeliveryFee,
        getLocationAndCalculateFee,
        getPricingTiers,
        clearDeliveryData,
    };
}
