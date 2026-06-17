<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DeliveryFeeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class DeliveryFeeApiController extends Controller
{
    private DeliveryFeeService $deliveryFeeService;

    public function __construct(DeliveryFeeService $deliveryFeeService)
    {
        $this->deliveryFeeService = $deliveryFeeService;
    }

    /**
     * Calculate delivery fee based on customer coordinates
     * 
     * @param Request $request
     * 
     * @return JsonResponse
     */
    public function calculate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_latitude' => 'required|numeric|between:-90,90',
                'customer_longitude' => 'required|numeric|between:-180,180',
                'restaurant_id' => 'nullable|exists:users,id',
            ]);

            // Get restaurant (use authenticated user as restaurant if not specified)
            $restaurantId = $validated['restaurant_id'] ?? auth()->id();

            if (!$restaurantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant not found',
                ], 404);
            }

            // Get restaurant data
            $restaurant = \App\Models\User::find($restaurantId);

            if (!$restaurant || !$restaurant->latitude || !$restaurant->longitude) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant location not configured',
                ], 422);
            }

            // Validate coordinates
            if (!$this->deliveryFeeService->validateCoordinates(
                $validated['customer_latitude'],
                $validated['customer_longitude']
            )) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid customer coordinates',
                ], 422);
            }

            // Calculate delivery details
            $deliveryDetails = $this->deliveryFeeService->getDeliveryDetails(
                $restaurant->latitude,
                $restaurant->longitude,
                $validated['customer_latitude'],
                $validated['customer_longitude'],
                $restaurant->max_delivery_radius_km ?? 20
            );

            return response()->json([
                'success' => true,
                'data' => $deliveryDetails,
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
                'message' => 'Failed to calculate delivery fee',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get pricing tiers
     * 
     * @return JsonResponse
     */
    public function getPricingTiers(): JsonResponse
    {
        try {
            $tiers = $this->deliveryFeeService->getPricingTiers();

            $formattedTiers = array_map(function ($tier) {
                return [
                    'min_km' => $tier['min'],
                    'max_km' => $tier['max'],
                    'fee' => $tier['fee'],
                    'is_per_km' => $tier['is_per_km'] ?? false,
                    'label' => $this->formatTierLabel($tier),
                ];
            }, $tiers);

            return response()->json([
                'success' => true,
                'data' => $formattedTiers,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pricing tiers',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Format tier label for display
     * 
     * @param array $tier
     * 
     * @return string
     */
    private function formatTierLabel(array $tier): string
    {
        if ($tier['max'] === PHP_INT_MAX) {
            return "{$tier['min']}+ km";
        }
        return "{$tier['min']}-{$tier['max']} km";
    }
}
