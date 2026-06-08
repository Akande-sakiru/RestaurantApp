import { useState, useCallback } from 'react';

/**
 * useGeocoding Hook
 * Handles address to coordinates conversion and vice versa
 */
export default function useGeocoding() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Convert address to coordinates
     * 
     * @param {string} address Street address
     * @param {string|null} city City name
     * @param {string|null} country Country name
     * 
     * @returns {Promise<{latitude: number, longitude: number, formatted_address: string}>}
     */
    const addressToCoordinates = useCallback(
        async (address, city = null, country = null) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    '/api/geocoding/address-to-coordinates',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content'),
                        },
                        body: JSON.stringify({
                            address,
                            city,
                            country,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to geocode address');
                }

                setIsLoading(false);
                return data.data;
            } catch (err) {
                const errorMessage =
                    err.message || 'Failed to geocode address';
                setError(errorMessage);
                setIsLoading(false);
                throw err;
            }
        },
        []
    );

    /**
     * Convert coordinates to address
     * 
     * @param {number} latitude Latitude
     * @param {number} longitude Longitude
     * 
     * @returns {Promise<{formatted_address: string, latitude: number, longitude: number}>}
     */
    const coordinatesToAddress = useCallback(
        async (latitude, longitude) => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    '/api/geocoding/coordinates-to-address',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content'),
                        },
                        body: JSON.stringify({
                            latitude,
                            longitude,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to reverse geocode'
                    );
                }

                setIsLoading(false);
                return data.data;
            } catch (err) {
                const errorMessage =
                    err.message || 'Failed to get address';
                setError(errorMessage);
                setIsLoading(false);
                throw err;
            }
        },
        []
    );

    /**
     * Clear errors
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        addressToCoordinates,
        coordinatesToAddress,
        clearError,
    };
}
