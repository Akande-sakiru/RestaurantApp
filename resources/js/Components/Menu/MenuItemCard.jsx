import { motion } from 'framer-motion';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';

export default function MenuItemCard({
    item,
    onAddToCart,
    isLoading = false,
}) {
    const handleAddToCart = () => {
        onAddToCart(item.id);
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {/* Availability Badge */}
                {!item.is_available && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <Badge variant="danger" size="lg">
                            <AlertCircle size={16} className="mr-1" />
                            Unavailable
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.name}
                </h3>

                {item.category && (
                    <Badge variant="primary" size="sm" className="mb-2">
                        {item.category.name}
                    </Badge>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-500">
                        ${item.price.toFixed(2)}
                    </span>

                    <Button
                        variant={item.is_available ? 'primary' : 'secondary'}
                        size="sm"
                        disabled={!item.is_available || isLoading}
                        isLoading={isLoading}
                        onClick={handleAddToCart}
                        className="flex items-center space-x-1"
                    >
                        <ShoppingCart size={16} />
                        <span>Add</span>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
