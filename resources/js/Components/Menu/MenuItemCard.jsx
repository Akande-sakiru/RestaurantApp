import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, AlertCircle, Plus, Minus, Check } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import Button from "../UI/Button";
import Badge from "../UI/Badge";
import { addToPendingCart } from "../../Utils/cartStorage";

export default function MenuItemCard({ item, onAddToCart, isLoading = false }) {
    const { auth } = usePage().props;
    const [quantity, setQuantity] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    const decrementQuantity = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const incrementQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        if (!auth?.user) {
            // User is not logged in - store in pending cart and redirect to cart
            addToPendingCart(item.id, quantity);
            setQuantity(1);
            setIsExpanded(false);
            // Redirect to cart page which requires auth, will then go to login
            window.location.href = '/cart';
        } else {
            // User is logged in - add to actual cart
            onAddToCart(item.id, quantity);
            setQuantity(1);
            setIsExpanded(false);
            router.post("/cart", { menu_item_id: item.id, quantity });
        }
    };

    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    };

    const hoverVariants = {
        initial: { y: 0 },
        hover: { y: -8 },
    };

    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            className="h-full"
        >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col max-w-xs">
                {/* Image Container */}
                <div className="relative h-40 bg-gray-200 overflow-hidden group">
                    <motion.div
                        variants={imageVariants}
                        initial="initial"
                        whileHover="hover"
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                                <span className="text-3xl">🍽️</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Availability Overlay */}
                    <AnimatePresence>
                        {!item.is_available && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <AlertCircle
                                        size={28}
                                        className="text-white mx-auto mb-2"
                                    />
                                    <Badge variant="danger" size="sm">
                                        Unavailable
                                    </Badge>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Availability Status Badge - Top Right */}
                    {item.is_available && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-2 right-2"
                        >
                            <Badge variant="success" size="sm">
                                <Check size={13} className="mr-1" />
                                Available
                            </Badge>
                        </motion.div>
                    )}
                </div>

                {/* Content */}
                <div className="p-2 flex-1 flex flex-col justify-between">
                    {/* Category Badge */}
                    {item.category && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-0.5"
                        >
                            <Badge variant="primary" size="sm">
                                {item.category.name}
                            </Badge>
                        </motion.div>
                    )}

                    {/* Item Name */}
                    <h3 className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-1">
                        {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-xs mb-1 line-clamp-1">
                        {item.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-1.5">
                        <span className="text-lg font-bold text-orange-500">
                            ₦{parseFloat(item.price).toFixed(2)}
                        </span>
                    </div>

                    {/* Action Section */}
                    <AnimatePresence mode="wait">
                        {!isExpanded ? (
                            <motion.div
                                key="collapsed"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={!item.is_available || isLoading}
                                    isLoading={isLoading}
                                    onClick={() =>
                                        item.is_available && setIsExpanded(true)
                                    }
                                    className="w-20 mx-auto flex items-center justify-center gap-0.5 text-xs"
                                >
                                    <ShoppingCart size={12} />
                                    <span>Add</span>
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1"
                            >
                                {/* Quantity Selector */}
                                <div className="bg-gray-50 rounded p-1.5 border border-gray-200">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Qty
                                    </label>

                                    {/* Quantity Display */}
                                    <div className="flex items-center gap-1">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={decrementQuantity}
                                            disabled={quantity === 1}
                                            className="flex items-center justify-center w-6 h-6 rounded bg-orange-100 text-orange-500 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Minus size={12} />
                                        </motion.button>

                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="flex-1 h-6 text-center text-xs font-semibold border border-orange-300 rounded focus:border-orange-500 focus:outline-none transition-colors bg-white"
                                        />

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={incrementQuantity}
                                            className="flex items-center justify-center w-6 h-6 rounded bg-orange-100 text-orange-500 hover:bg-orange-200 transition-colors"
                                        >
                                            <Plus size={12} />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-1">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setIsExpanded(false);
                                            setQuantity(1);
                                        }}
                                        className="w-full text-xs"
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        disabled={
                                            !item.is_available || isLoading
                                        }
                                        isLoading={isLoading}
                                        onClick={handleAddToCart}
                                        className="w-full flex items-center justify-center gap-0.5 text-xs"
                                    >
                                        <Check size={12} />
                                        <span>Add</span>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
