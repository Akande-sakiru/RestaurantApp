<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeocodingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class GeocodingApiController extends Controller
{
    private GeocodingService $geocodingService;

    public function __construct(GeocodingService $geocodingService)
    {
        $this->geocodingService = $geocodingService;
    }

    /**
     * Convert address to coordinates
     * 
     * @param Request $request
     * 
     * @return JsonResponse
     */
    public function addressToCoordinates(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'address' => 'required|string|min:5',
                'city' => 'nullable|string',
                'country' => 'nullable|string',
            ]);

            if (!$this->geocodingService->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Geocoding service not configured',
                ], 503);
            }

            $result = $this->geocodingService->addressToCoordinates(
                $validated['address'],
                $validated['city'] ?? null,
                $validated['country'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Convert coordinates to address (Reverse Geocoding)
     * 
     * @param Request $request
     * 
     * @return JsonResponse
     */
    public function coordinatesToAddress(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            if (!$this->geocodingService->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Geocoding service not configured',
                ], 503);
            }

            $result = $this->geocodingService->coordinatesToAddress(
                $validated['latitude'],
                $validated['longitude']
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }
}
