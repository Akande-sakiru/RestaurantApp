/**
 * CartExample.jsx
 * 
 * Complete example showing how to integrate CartDrawer, CartItem, and CartSummary
 * together in a menu or products page with full cart functionality.
 * 
 * This component demonstrates:
 * - Managing cart state
 * - Adding/removing items
 * - Updating quantities
 * - Opening/closing the cart drawer
 * - Integrating with menu items
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import CartDrawer from './CartDrawer';
import Button from '../UI/Button';
import { ShoppingCart } from 'lucide-react';

/**
 * Example cart context/state management pattern
 */
export function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existing = prevItems.find((ci) => ci.id === item.id);
            if (existing) {
                return prevItems.map((ci) =>
                    ci.id === item.id
                        ? { ...ci, quantity: ci.quantity + 1 }
                        : ci
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeItem(itemId);
        } else {
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    };

    const removeItem = (itemId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== itemId)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems,
    };
}

/**
 * Example menu item component with add to cart button
 */
function MenuItem({ item, onAddToCart }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        🍽️
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                </p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-orange-500">
                        ₦{item.price.toFixed(2)}
                    </p>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddToCart(item)}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Main example component
 */
export default function CartExample() {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        getTotalItems,
    } = useCart();

    // Mock menu items
    const menuItems = [
        {
            id: 1,
            name: 'Deluxe Burger',
            description: 'Juicy beef patty with fresh toppings',
            price: 12.99,
            category: { name: 'Burgers' },
        },
        {
            id: 2,
            name: 'Margherita Pizza',
            description: 'Classic pizza with mozzarella and basil',
            price: 14.99,
            category: { name: 'Pizza' },
        },
        {
            id: 3,
            name: 'Fried Chicken Combo',
            description: 'Crispy chicken pieces with sides',
            price: 11.99,
            category: { name: 'Chicken' },
        },
        {
            id: 4,
            name: 'Fresh Veggie Wrap',
            description: 'Nutritious wrap with fresh vegetables',
            price: 9.99,
            category: { name: 'Wraps' },
        },
        {
            id: 5,
            name: 'Chocolate Cake',
            description: 'Rich and decadent dessert',
            price: 6.99,
            category: { name: 'Desserts' },
        },
        {
            id: 6,
            name: 'Loaded Fries',
            description: 'Crispy fries with cheese and toppings',
            price: 7.99,
            category: { name: 'Sides' },
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow sticky top-0 z-40"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Menu
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCartOpen(true)}
                        className="relative inline-flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <ShoppingCart size={20} />
                        <span className="font-semibold">
                            Cart ({getTotalItems()})
                        </span>
                        {getTotalItems() > 0 && (
                            <motion.span
                                key={getTotalItems()}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full"
                            >
                                {getTotalItems()}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                        Our Delicious Menu
                    </h2>
                    <p className="text-gray-600 max-w-2xl">
                        Browse our selection of mouth-watering dishes crafted
                        with fresh ingredients and passion.
                    </p>
                </motion.div>

                {/* Menu Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <MenuItem
                                item={item}
                                onAddToCart={addToCart}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </main>

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
            />
        </div>
    );
}

/**
 * Usage in your actual application:
 * 
 * 1. Import the useCart hook:
 *    import { useCart } from './Components/Cart/CartExample';
 * 
 * 2. Use it in your component:
 *    const { cartItems, isCartOpen, setIsCartOpen, ... } = useCart();
 * 
 * 3. Import and use CartDrawer:
 *    import CartDrawer from './Components/Cart/CartDrawer';
 * 
 * 4. Render the drawer:
 *    <CartDrawer
 *      isOpen={isCartOpen}
 *      onClose={() => setIsCartOpen(false)}
 *      items={cartItems}
 *      onUpdateQuantity={updateQuantity}
 *      onRemoveItem={removeItem}
 *    />
 */
