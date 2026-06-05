/**
 * Cart Storage Utility
 * Manages temporary cart storage for unauthenticated users
 */

const CART_STORAGE_KEY = 'restaurant_pending_cart';
const CART_INTENT_KEY = 'cart_intent'; // Flag to indicate user added something to cart

/**
 * Get pending cart items (for unauthenticated users)
 */
export const getPendingCart = () => {
    if (typeof window === 'undefined') return [];
    
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error retrieving pending cart:', error);
        return [];
    }
};

/**
 * Add item to pending cart
 */
export const addToPendingCart = (menuItemId, quantity, notes = null) => {
    if (typeof window === 'undefined') return;
    
    try {
        const cart = getPendingCart();
        
        // Check if item already exists
        const existingIndex = cart.findIndex(item => item.menu_item_id === menuItemId);
        
        if (existingIndex >= 0) {
            // Update quantity if item exists
            cart[existingIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                menu_item_id: menuItemId,
                quantity,
                notes,
                added_at: new Date().toISOString()
            });
        }
        
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        localStorage.setItem(CART_INTENT_KEY, 'true'); // Mark that user has cart intent
    } catch (error) {
        console.error('Error adding to pending cart:', error);
    }
};

/**
 * Clear pending cart
 */
export const clearPendingCart = () => {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_INTENT_KEY);
    } catch (error) {
        console.error('Error clearing pending cart:', error);
    }
};

/**
 * Check if user has cart intent (added items before login)
 */
export const hasCartIntent = () => {
    if (typeof window === 'undefined') return false;
    
    try {
        return localStorage.getItem(CART_INTENT_KEY) === 'true';
    } catch (error) {
        console.error('Error checking cart intent:', error);
        return false;
    }
};

/**
 * Get pending cart count
 */
export const getPendingCartCount = () => {
    return getPendingCart().length;
};
