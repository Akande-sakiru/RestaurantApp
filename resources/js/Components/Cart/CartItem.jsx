import { motion } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

export default function CartItem({
    item,
    onUpdate,
    onRemove,
    isLoading = false,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity);

    const handleUpdateQuantity = () => {
        if (quantity !== item.quantity) {
            onUpdate(item.id, quantity);
        }
        setIsEditing(false);
    };

    const handleRemove = () => {
        onRemove(item.id);
    };

    const incrementQuantity = () => {
        setQuantity((prev) => (prev < 10 ? prev + 1 : 10));
    };

    const decrementQuantity = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const itemTotal = (item.price * quantity).toFixed(2);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
        >
            {/* Item Image */}
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                    </div>
                )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            ₦{item.price.toFixed(2)} each
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemove}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                    </motion.button>
                </div>

                {/* Quantity Controls */}
                {!isEditing ? (
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-sm font-medium hover:bg-orange-100 transition-colors"
                        >
                            Qty: {quantity}
                        </button>
                        <span className="font-semibold text-gray-900">
                            ₦{itemTotal}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={decrementQuantity}
                            disabled={quantity === 1 || isLoading}
                            className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            <Minus size={16} />
                        </motion.button>

                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (val >= 1 && val <= 10) setQuantity(val);
                            }}
                            className="w-12 text-center px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={incrementQuantity}
                            disabled={quantity === 10 || isLoading}
                            className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={16} />
                        </motion.button>

                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => {
                                    setQuantity(item.quantity);
                                    setIsEditing(false);
                                }}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUpdateQuantity}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                Update
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
