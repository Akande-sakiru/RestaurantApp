import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

export default function CartDrawer({
    isOpen,
    onClose,
    items = [],
    onUpdateItem,
    onRemoveItem,
    onCheckout,
    isLoading = false,
    subtotal = 0,
    tax = 0,
    total = 0,
}) {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                {/* Drawer Content */}
                <Transition.Child
                    as={Fragment}
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                >
                    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <ShoppingCart
                                        size={24}
                                        className="text-orange-500"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">
                                        Your Cart
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </motion.button>
                        </div>

                        {/* Cart Items */}
                        <div className="px-6 py-4 flex-1">
                            <AnimatePresence>
                                {items.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        {items.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                onUpdate={onUpdateItem}
                                                onRemove={onRemoveItem}
                                                isLoading={isLoading}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="text-5xl mb-4">🛒</div>
                                        <p className="text-gray-500 font-medium">
                                            Your cart is empty
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Add items to your cart to get started
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer - Summary and Checkout */}
                        {items.length > 0 && (
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                                <CartSummary
                                    items={items}
                                    subtotal={subtotal}
                                    tax={tax}
                                    total={total}
                                    onCheckout={onCheckout}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
