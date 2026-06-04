<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {
    }

    /**
     * Display the cart.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $cartItems = $this->cartService->get($user);
        $subtotal = $this->cartService->subtotal($user);

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * Add a menu item to the cart.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        

        $validated = $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $item = MenuItem::findOrFail($validated['menu_item_id']);

        if (!$item->is_available) {
            return back()->withErrors(['menu_item_id' => 'This item is not currently available.']);
        }
//
        $this->cartService->add($user, $item, $validated['quantity'], $validated['notes'] ?? null);

        // Return with redirect to the same page (for Inertia)
        return redirect()->route('cart.index')->with('success', 'Item added to cart');
    }

    /**
     * Update a cart item's quantity.
     */
    public function update(Request $request, MenuItem $menuItem)
    {
        $user = $request->user();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $this->cartService->update($user, $menuItem, $validated['quantity']);

        return back()->with('success', 'Cart updated');
    }

    /**
     * Remove a cart item.
     */
    public function destroy(Request $request, MenuItem $menuItem)
    {
        $user = $request->user();
        $this->cartService->remove($user, $menuItem);

        return back()->with('success', 'Item removed from cart');
    }

    /**
     * Clear the entire cart.
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        $this->cartService->clear($user);

        return back()->with('success', 'Cart cleared');
    }
}
