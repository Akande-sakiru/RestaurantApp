/**
 * Geolocation & Distance Calculation Utilities
 * Frontend utilities for location-based features
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Can be used on frontend for instant feedback without API call
 * 
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.asin(Math.sqrt(a));
    const distance = EARTH_RADIUS_KM * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate delivery fee based on distance
 * Pricing tiers:
 * - 0-2 km:    ₦500
 * - 2-5 km:    ₦1000
 * - 5-10 km:   ₦1300
 * - 10-15 km:  ₦1700
 * - 15+ km:    ₦2000 per km
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Delivery fee in naira
 */
export function calculateDeliveryFee(distanceKm) {
    if (distanceKm <= 2) return 500;
    if (distanceKm <= 5) return 1000;
    if (distanceKm <= 10) return 1300;
    if (distanceKm <= 15) return 1700;

    // For 15+ km: ₦1700 base + ₦2000 per km
    const excessKm = distanceKm - 15;
    return 1700 + excessKm * 2000;
}

/**
 * Check if delivery is available
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} maxRadiusKm - Maximum delivery radius
 * @returns {boolean} True if delivery is available
 */
export function isDeliveryAvailable(distanceKm, maxRadiusKm = 20) {
    return distanceKm <= maxRadiusKm;
}

/**
 * Get delivery message for user
 * 
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} maxRadiusKm - Maximum delivery radius
 * @returns {string} User-friendly message
 */
export function getDeliveryMessage(distanceKm, maxRadiusKm = 20) {
    if (!isDeliveryAvailable(distanceKm, maxRadiusKm)) {
        return `Sorry, this location is outside our delivery range (max: ${maxRadiusKm}km). Current distance: ${distanceKm}km`;
    }

    const fee = calculateDeliveryFee(distanceKm);
    return `Distance: ${distanceKm}km | Delivery Fee: ₦${fee}`;
}

/**
 * Get user's current location
 * 
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                let message = 'Unable to get your location';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message =
                            'Permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        message = 'The request to get user location timed out.';
                        break;
                }

                reject(new Error(message));
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
}

/**
 * Format coordinates for display
 * 
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {string} Formatted coordinates
 */
export function formatCoordinates(latitude, longitude) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Validate coordinates
 * 
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True if valid
 */
export function validateCoordinates(latitude, longitude) {
    return (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

/**
 * Get pricing tiers for display
 * 
 * @returns {Array} Pricing tiers
 */
export function getPricingTiersDisplay() {
    return [
        { min: 0, max: 2, fee: 500, label: '0-2 km' },
        { min: 2, max: 5, fee: 1000, label: '2-5 km' },
        { min: 5, max: 10, fee: 1300, label: '5-10 km' },
        { min: 10, max: 15, fee: 1700, label: '10-15 km' },
        { min: 15, max: 999, fee: '₦2000/km', label: '15+ km', perKm: true },
    ];
}
