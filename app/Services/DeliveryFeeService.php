<?php

namespace App\Services;

/**
 * DeliveryFeeService
 * 
 * Handles delivery fee calculations based on distance using Haversine formula.
 * Pricing tiers (in Nigerian Naira):
 * - 0-2 km:    ₦500
 * - 2-5 km:    ₦1000
 * - 5-10 km:   ₦1300
 * - 10-15 km:  ₦1700
 * - 15+ km:    ₦2000 per km
 */
class DeliveryFeeService
{
    /**
     * Earth's radius in kilometers
     */
    private const EARTH_RADIUS_KM = 6371;

    /**
     * Delivery pricing tiers
     */
    private const PRICING_TIERS = [
        ['min' => 0, 'max' => 2, 'fee' => 500],
        ['min' => 2, 'max' => 5, 'fee' => 1000],
        ['min' => 5, 'max' => 10, 'fee' => 1300],
        ['min' => 10, 'max' => 15, 'fee' => 1700],
        ['min' => 15, 'max' => PHP_INT_MAX, 'fee' => 2000, 'is_per_km' => true],
    ];

    /**
     * Calculate distance between two coordinates using Haversine formula
     * 
     * @param float $lat1 Restaurant latitude
     * @param float $lon1 Restaurant longitude
     * @param float $lat2 Customer latitude
     * @param float $lon2 Customer longitude
     * 
     * @return float Distance in kilometers
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        // Convert degrees to radians
        $lat1Rad = deg2rad($lat1);
        $lon1Rad = deg2rad($lon1);
        $lat2Rad = deg2rad($lat2);
        $lon2Rad = deg2rad($lon2);

        // Haversine formula
        $dlat = $lat2Rad - $lat1Rad;
        $dlon = $lon2Rad - $lon1Rad;

        $a = sin($dlat / 2) ** 2 + cos($lat1Rad) * cos($lat2Rad) * sin($dlon / 2) ** 2;
        $c = 2 * asin(sqrt($a));

        $distance = self::EARTH_RADIUS_KM * $c;

        return round($distance, 2);
    }

    /**
     * Calculate delivery fee based on distance
     * 
     * @param float $distanceKm Distance in kilometers
     * 
     * @return int Delivery fee in naira
     */
    public function calculateDeliveryFee(float $distanceKm): int
    {
        foreach (self::PRICING_TIERS as $tier) {
            if ($distanceKm >= $tier['min'] && $distanceKm <= $tier['max']) {
                // Check if this tier has per-km calculation (for distances >= 15km)
                if (isset($tier['is_per_km']) && $tier['is_per_km']) {
                    // For 15+ km: ₦2000 per km
                    $baseFee = self::PRICING_TIERS[3]['fee']; // ₦1700 for 10-15km as base
                    $excessKm = $distanceKm - 15;
                    return (int)($baseFee + ($excessKm * $tier['fee']));
                }

                return (int)$tier['fee'];
            }
        }

        // Fallback (shouldn't reach here with current logic)
        return 0;
    }

    /**
     * Check if delivery is available within the maximum radius
     * 
     * @param float $distanceKm Distance in kilometers
     * @param int $maxRadiusKm Maximum delivery radius in kilometers
     * 
     * @return bool True if delivery is available
     */
    public function isDeliveryAvailable(float $distanceKm, int $maxRadiusKm): bool
    {
        return $distanceKm <= $maxRadiusKm;
    }

    /**
     * Get complete delivery details including distance, fee, and availability
     * 
     * @param float $lat1 Restaurant latitude
     * @param float $lon1 Restaurant longitude
     * @param float $lat2 Customer latitude
     * @param float $lon2 Customer longitude
     * @param int $maxRadiusKm Maximum delivery radius
     * 
     * @return array Delivery details
     */
    public function getDeliveryDetails(float $lat1, float $lon1, float $lat2, float $lon2, int $maxRadiusKm): array
    {
        $distance = $this->calculateDistance($lat1, $lon1, $lat2, $lon2);
        $isAvailable = $this->isDeliveryAvailable($distance, $maxRadiusKm);
        $fee = $isAvailable ? $this->calculateDeliveryFee($distance) : 0;

        return [
            'distance_km' => $distance,
            'delivery_fee' => $fee,
            'is_available' => $isAvailable,
            'max_radius_km' => $maxRadiusKm,
            'message' => $this->getDeliveryMessage($distance, $maxRadiusKm, $isAvailable),
        ];
    }

    /**
     * Get user-friendly delivery message
     * 
     * @param float $distanceKm Distance in kilometers
     * @param int $maxRadiusKm Maximum delivery radius
     * @param bool $isAvailable Is delivery available
     * 
     * @return string Message for the user
     */
    private function getDeliveryMessage(float $distanceKm, int $maxRadiusKm, bool $isAvailable): string
    {
        if (!$isAvailable) {
            return "Sorry, this location is outside our delivery range (max: {$maxRadiusKm}km). Current distance: {$distanceKm}km";
        }

        $fee = $this->calculateDeliveryFee($distanceKm);
        return "Distance: {$distanceKm}km | Delivery Fee: ₦{$fee}";
    }

    /**
     * Get pricing tiers information
     * 
     * @return array Pricing tiers
     */
    public function getPricingTiers(): array
    {
        return self::PRICING_TIERS;
    }

    /**
     * Validate coordinates
     * 
     * @param float $latitude Latitude
     * @param float $longitude Longitude
     * 
     * @return bool True if valid
     */
    public function validateCoordinates(float $latitude, float $longitude): bool
    {
        return $latitude >= -90 && $latitude <= 90 && $longitude >= -180 && $longitude <= 180;
    }
}
