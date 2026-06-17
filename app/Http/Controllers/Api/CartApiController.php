<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartApiController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {
    }

    /**
     * Sync pending cart items from frontend storage
     */
    public function syncPending(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        foreach ($validated['items'] as $itemData) {
            $item = MenuItem::findOrFail($itemData['menu_item_id']);

            if ($item->is_available) {
                $this->cartService->add(
                    $user,
                    $item,
                    $itemData['quantity'],
                    $itemData['notes'] ?? null
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart synced successfully'
        ]);
    }
}
