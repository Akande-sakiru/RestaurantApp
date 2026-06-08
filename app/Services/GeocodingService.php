<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

/**
 * GeocodingService
 * 
 * Converts addresses to coordinates using Google Maps Geocoding API
 * with caching to minimize API calls
 */
class GeocodingService
{
    private string $googleMapsApiKey;
    private const CACHE_DURATION = 60 * 60 * 24 * 30; // 30 days
    private const GOOGLE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

    public function __construct()
    {
        $this->googleMapsApiKey = config('services.google.maps_key');
    }

    /**
     * Convert address to coordinates
     * 
     * @param string $address Full address to geocode
     * @param string|null $city City name
     * @param string|null $country Country name
     * 
     * @return array Coordinates and address details
     * @throws Exception
     */
    public function addressToCoordinates(string $address, ?string $city = null, ?string $country = null): array
    {
        $fullAddress = $this->buildFullAddress($address, $city, $country);
        $cacheKey = 'geocoding:' . md5($fullAddress);

        // Check cache first
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::get(self::GOOGLE_GEOCODING_URL, [
                'address' => $fullAddress,
                'key' => $this->googleMapsApiKey,
            ])->json();

            if (!isset($response['results']) || empty($response['results'])) {
                throw new Exception('Address not found: ' . $fullAddress);
            }

            if ($response['status'] !== 'OK') {
                $errorMessage = $response['error_message'] ?? $response['status'];
                throw new Exception('Geocoding error: ' . $errorMessage);
            }

            $result = $response['results'][0];

            $coordinates = [
                'latitude' => $result['geometry']['location']['lat'],
                'longitude' => $result['geometry']['location']['lng'],
                'formatted_address' => $result['formatted_address'],
                'address_components' => $result['address_components'],
                'place_id' => $result['place_id'] ?? null,
            ];

            // Cache the result
            Cache::put($cacheKey, $coordinates, self::CACHE_DURATION);

            return $coordinates;
        } catch (\Exception $e) {
            throw new Exception('Failed to geocode address: ' . $e->getMessage());
        }
    }

    /**
     * Convert coordinates to address (Reverse Geocoding)
     * 
     * @param float $latitude Latitude
     * @param float $longitude Longitude
     * 
     * @return array Address details
     * @throws Exception
     */
    public function coordinatesToAddress(float $latitude, float $longitude): array
    {
        $cacheKey = 'reverse_geocoding:' . md5($latitude . $longitude);

        // Check cache first
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::get(self::GOOGLE_GEOCODING_URL, [
                'latlng' => "{$latitude},{$longitude}",
                'key' => $this->googleMapsApiKey,
            ])->json();

            if ($response['status'] !== 'OK') {
                throw new Exception('Reverse geocoding failed: ' . $response['status']);
            }

            if (!isset($response['results']) || empty($response['results'])) {
                throw new Exception('No address found for coordinates');
            }

            $result = $response['results'][0];

            $address = [
                'formatted_address' => $result['formatted_address'],
                'address_components' => $result['address_components'],
                'place_id' => $result['place_id'] ?? null,
                'latitude' => $latitude,
                'longitude' => $longitude,
            ];

            // Cache the result
            Cache::put($cacheKey, $address, self::CACHE_DURATION);

            return $address;
        } catch (\Exception $e) {
            throw new Exception('Failed to reverse geocode: ' . $e->getMessage());
        }
    }

    /**
     * Extract city from address components
     * 
     * @param array $addressComponents Address components from geocoding
     * 
     * @return string|null City name
     */
    public function extractCity(array $addressComponents): ?string
    {
        foreach ($addressComponents as $component) {
            if (in_array('locality', $component['types'])) {
                return $component['long_name'];
            }
        }
        return null;
    }

    /**
     * Extract country from address components
     * 
     * @param array $addressComponents Address components from geocoding
     * 
     * @return string|null Country name
     */
    public function extractCountry(array $addressComponents): ?string
    {
        foreach ($addressComponents as $component) {
            if (in_array('country', $component['types'])) {
                return $component['long_name'];
            }
        }
        return null;
    }

    /**
     * Extract postal code from address components
     * 
     * @param array $addressComponents Address components from geocoding
     * 
     * @return string|null Postal code
     */
    public function extractPostalCode(array $addressComponents): ?string
    {
        foreach ($addressComponents as $component) {
            if (in_array('postal_code', $component['types'])) {
                return $component['long_name'];
            }
        }
        return null;
    }

    /**
     * Build full address string
     * 
     * @param string $address Street address
     * @param string|null $city City
     * @param string|null $country Country
     * 
     * @return string Full address
     */
    private function buildFullAddress(string $address, ?string $city = null, ?string $country = null): string
    {
        $parts = [$address];

        if ($city) {
            $parts[] = $city;
        }

        if ($country) {
            $parts[] = $country;
        }

        return implode(', ', $parts);
    }

    /**
     * Validate that Google Maps API key is configured
     * 
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->googleMapsApiKey);
    }

    /**
     * Clear geocoding cache for an address
     * 
     * @param string $address Address to clear cache for
     * 
     * @return bool
     */
    public function clearCache(string $address): bool
    {
        $cacheKey = 'geocoding:' . md5($address);
        return Cache::forget($cacheKey);
    }
}
