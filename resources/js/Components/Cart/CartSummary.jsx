import { motion } from 'framer-motion';
import Button from '../UI/Button';
import { Link } from '@inertiajs/react';

export default function CartSummary({
    items = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    onCheckout,
    isLoading = false,
}) {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
            {/* Summary Lines */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="text-gray-900 font-medium">
                        ₦{subtotal.toFixed(2)}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (estimated)</span>
                    <span className="text-gray-900 font-medium">
                        ₦{tax.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-500">
                    ₦{total.toFixed(2)}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCheckout}
                    disabled={items.length === 0 || isLoading}
                    className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Processing...' : 'Checkout'}
                </motion.button>

                <Link href="/menu">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </motion.button>
                </Link>
            </div>

            {/* Info */}
            {items.length === 0 && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                        Your cart is empty
                    </p>
                </div>
            )}
        </motion.div>
    );
}
