import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, usePage } from "@inertiajs/react";
import CustomerLayout from "../../Layouts/CustomerLayout";
import Button from "../../Components/UI/Button";
import Input from "../../Components/UI/Input";
import Select from "../../Components/UI/Select";
import Textarea from "../../Components/UI/Textarea";
import AddressAutocomplete from "../../Components/AddressAutocomplete/AddressAutocomplete";
import { Card, CardBody, CardHeader } from "../../Components/UI/Card";
import { getPendingCart, clearPendingCart } from "../../Utils/cartStorage";

const checkoutSchema = z.object({
    type: z.enum(["dine-in", "takeaway", "delivery"]),
    delivery_address: z.string().optional(),
    delivery_phone: z.string().optional(),
    table_number: z.string().optional(),
    notes: z.string().optional(),
}).refine((data) => {
    // Require table_number for dine-in
    if (data.type === "dine-in") {
        return data.table_number && data.table_number.trim().length > 0;
    }
    return true;
}, {
    message: "Table number is required for dine-in orders",
    path: ["table_number"],
}).refine((data) => {
    // Require delivery_address for delivery
    if (data.type === "delivery") {
        return data.delivery_address && data.delivery_address.trim().length > 0;
    }
    return true;
}, {
    message: "Delivery address is required for delivery orders",
    path: ["delivery_address"],
});

export default function CartIndex({ cartItems = [], subtotal = 0 }) {
    const { auth } = usePage().props;
    const items = Array.isArray(cartItems) ? cartItems : [];
    const [isProcessing, setIsProcessing] = useState(false);
    const [syncedItems, setSyncedItems] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            type: "dine-in",
        },
    });

    const handleAddressSelect = (addressData) => {
        setSelectedAddress(addressData);
        setValue('delivery_address', addressData.address);
    };

    const selectedType = watch("type");

    // Sync pending cart items when user logs in
    useEffect(() => {
        const syncPendingCart = async () => {
            const pendingItems = getPendingCart();
            
            if (pendingItems.length > 0 && auth?.user && !syncedItems) {
                try {
                    await fetch('/api/cart/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                        },
                        body: JSON.stringify({ items: pendingItems }),
                    });
                    
                    // Clear pending cart after syncing
                    clearPendingCart();
                    setSyncedItems(true);
                    
                    // Reload cart to show synced items
                    router.reload();
                } catch (error) {
                    console.error('Error syncing pending cart:', error);
                }
            }
        };

        syncPendingCart();
    }, [auth?.user, syncedItems]);

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity === 0) {
            handleRemoveItem(itemId);
        } else {
            // Update via Inertia
            router.patch(`/cart/${itemId}`, { quantity: newQuantity });
        }
    };

    const handleRemoveItem = (itemId) => {
        router.delete(`/cart/${itemId}`);
    };

    const handleClearCart = () => {
        if (confirm("Are you sure you want to clear your cart?")) {
            router.delete("/cart");
        }
    };

    const onSubmit = (data) => {
        console.log('Form submitted with data:', data);
        console.log('Form errors:', errors);
        
        // Validate required fields based on order type
        if (data.type === 'dine-in' && !data.table_number) {
            console.error('Table number is required for dine-in orders');
            return;
        }
        
        if (data.type === 'delivery' && !data.delivery_address) {
            console.error('Delivery address is required for delivery orders');
            return;
        }
        
        setIsProcessing(true);
        router.post("/payment", data, {
            onSuccess: () => {
                console.log('Payment page navigation successful');
            },
            onError: (errors) => {
                console.error('Navigation error:', errors);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const total = subtotal;
    const tax = total * 0.1;
    const finalTotal = total + tax;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
    };

    if (items.length === 0) {
        return (
            <CustomerLayout>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <ShoppingCart
                        size={64}
                        className="mx-auto text-gray-300 mb-4"
                    />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Add some delicious items to get started
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => router.visit("/menu")}
                    >
                        Continue Shopping
                    </Button>
                </motion.div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-600">
                            {items.length} item{items.length !== 1 ? "s" : ""}{" "}
                            in your cart
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                layout
                            >
                                <Card>
                                    <CardBody className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {item.menu_item_name}
                                            </h3>
                                            {item.customization_notes && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Note:{" "}
                                                    {item.customization_notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-4 font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right min-w-24">
                                                <p className="text-sm text-gray-600">
                                                    ₦{item.menu_item_price}
                                                    each
                                                </p>
                                                <p className="font-bold text-orange-500">
                                                    ₦
                                                    {(
                                                        item.menu_item_price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() =>
                                                    handleRemoveItem(item.id)
                                                }
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6"
                    >
                        <Button
                            variant="ghost"
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-700"
                        >
                            Clear Cart
                        </Button>
                    </motion.div>
                </div>

                {/* Checkout Form */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Order Summary
                                </h2>
                            </CardHeader>

                            <CardBody className="space-y-4">
                                {/* Summary */}
                                <div className="space-y-2 pb-4 border-b border-gray-200">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₦{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (10%)</span>
                                        <span>₦{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span className="text-orange-500">
                                            ₦{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Form */}
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    {/* Order Type */}
                                    <Select
                                        label="Order Type"
                                        {...register("type")}
                                        options={[
                                            {
                                                value: "dine-in",
                                                label: "Dine In",
                                            },
                                            {
                                                value: "takeaway",
                                                label: "Takeaway",
                                            },
                                            {
                                                value: "delivery",
                                                label: "Delivery",
                                            },
                                        ]}
                                        error={errors.type?.message}
                                    />

                                    {/* Conditional Fields */}
                                    {selectedType === "dine-in" && (
                                        <Input
                                            label="Table Number"
                                            placeholder="e.g., 5"
                                            {...register("table_number")}
                                            error={errors.table_number?.message}
                                        />
                                    )}

                                    {selectedType === "delivery" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Delivery Address
                                                </label>
                                                <AddressAutocomplete
                                                    onAddressSelect={handleAddressSelect}
                                                    placeholder="Enter your delivery address"
                                                />
                                                {selectedAddress && (
                                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                                        <p><strong>Selected:</strong> {selectedAddress.address}</p>
                                                    </div>
                                                )}
                                                {errors.delivery_address && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {errors.delivery_address.message}
                                                    </p>
                                                )}
                                            </div>
                                            <Input
                                                label="Delivery Phone Number"
                                                placeholder="Enter your phone number (optional)"
                                                {...register("delivery_phone")}
                                                error={
                                                    errors.delivery_phone?.message
                                                }
                                            />
                                        </>
                                    )}

                                    {/* Notes */}
                                    <Textarea
                                        label="Special Requests"
                                        placeholder="Any special requests?"
                                        rows={3}
                                        {...register("notes")}
                                        error={errors.notes?.message}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        isLoading={isProcessing}
                                        className="w-full"
                                    >
                                        Proceed to Payment
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </CustomerLayout>
    );
}
