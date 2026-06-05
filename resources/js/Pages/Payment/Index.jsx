import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    CheckCircle,
    Loader,
    ArrowLeft,
    CreditCard,
} from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import CustomerLayout from "../../Layouts/CustomerLayout";
import Button from "../../Components/UI/Button";
import { Card, CardBody, CardHeader } from "../../Components/UI/Card";
// import PaystackPop from "@paystack/inline-js";

export default function PaymentIndex({
    cartItems = [],
    subtotal = 0,
    publicKey = "",
    orderData = {
        type: "dine-in",
        delivery_address: null,
        table_number: null,
        notes: null,
    },
}) {
    const { auth } = usePage().props;
    const userEmail = auth?.user?.email || "";
    const items = Array.isArray(cartItems) ? cartItems : [];
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState("");
    const [paystackLoaded, setPaystackLoaded] = useState(false);

    // Load Paystack script
    useEffect(() => {
        if (!publicKey) {
            setError("Payment configuration error. Please try again.");
            return;
        }

        // Check if PaystackPop is already loaded
        if (window.PaystackPop) {
            setPaystackLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v2/inline.js";
        script.async = true;
        script.onload = () => {
            setPaystackLoaded(true);
        };
        script.onerror = () => {
            setError(
                "Failed to load Paystack. Please check your internet connection.",
            );
        };
        document.body.appendChild(script);

        return () => {
            // Clean up
        };
    }, [publicKey]);

    const total = subtotal;
    const tax = total * 0.1;
    const finalTotal = total + tax;

    const handlePayment = async (e) => {
        e.preventDefault();
        setError("");

        if (!paystackLoaded) {
            setError("Payment system is loading. Please wait...");
            return;
        }

        if (items.length === 0) {
            setError("Your cart is empty");
            return;
        }

        try {
            setIsInitializing(true);

            // Initialize payment on backend
            const response = await fetch("/payment/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token":
                        document.querySelector('meta[name="csrf-token"]')
                            ?.content || "",
                },
                body: JSON.stringify({
                    type: orderData.type,
                    delivery_address: orderData.delivery_address,
                    table_number: orderData.table_number,
                    notes: orderData.notes,
                    payment_method: paymentMethod,
                }),
            });

            const result = await response.json();
            console.log("Initialize response:", result);

            if (!result.status) {
                setError(result.message || "Failed to initialize payment");
                setIsInitializing(false);
                return;
            }

            const paymentData = result.data;

            // Open Paystack payment modal
            console.log("Setting up Paystack with payment data:", paymentData);
            // const handler = window.PaystackPop.setup({
            //     key: publicKey,
            //     email: userEmail,
            //     amount: Math.round(finalTotal * 100), // Convert to kobo
            //     ref: paymentData.reference,
            //     onClose: () => {
            //         setIsInitializing(false);
            //         setError("Payment was cancelled");

            //         // Notify backend that payment was cancelled (fire and forget)
            //         fetch("/payment/fail", {
            //             method: "POST",
            //             headers: {
            //                 "Content-Type": "application/json",
            //                 "X-CSRF-Token":
            //                     document.querySelector(
            //                         'meta[name="csrf-token"]',
            //                     )?.content || "",
            //             },
            //             body: JSON.stringify({
            //                 reference: paymentData.reference,
            //                 order_id: paymentData.order_id,
            //                 reason: "User cancelled payment",
            //             }),
            //         }).catch((err) =>
            //             console.error(
            //                 "Error notifying payment cancellation:",
            //                 err,
            //             ),
            //         );
            //     },
            //     onSuccess: async (response) => {
            //         // Verify payment on backend
            //         console.log("🎉 onSuccess callback triggered!", response);
            //         console.log("Payment successful from Paystack:", response);
            //         try {
            //             const verifyResponse = await fetch("/payment/verify", {
            //                 method: "POST",
            //                 headers: {
            //                     "Content-Type": "application/json",
            //                     "X-CSRF-Token":
            //                         document.querySelector(
            //                             'meta[name="csrf-token"]',
            //                         )?.content || "",
            //                 },
            //                 body: JSON.stringify({
            //                     reference: response.reference,
            //                     order_id: paymentData.order_id,
            //                 }),
            //             });

            //             const verifyResult = await verifyResponse.json();
            //             console.log("Verification result:", verifyResult);

            //             if (verifyResult.status) {
            //                 // Payment successful - redirect to confirmation
            //                 console.log(
            //                     "Payment verified, redirecting to:",
            //                     `/orders/${paymentData.order_id}/confirmation`,
            //                 );
            //                 // Use setTimeout to ensure redirect happens after modal closes
            //                 setTimeout(() => {
            //                     console.log("Executing redirect...");
            //                     window.location.href = `/orders/${paymentData.order_id}/confirmation`;
            //                 }, 500);
            //             } else {
            //                 console.log("Verification failed:", verifyResult);
            //                 setError(
            //                     verifyResult.message ||
            //                         "Payment verification failed",
            //                 );
            //                 setIsInitializing(false);

            //                 // Notify backend of failed verification (fire and forget)
            //                 fetch("/payment/fail", {
            //                     method: "POST",
            //                     headers: {
            //                         "Content-Type": "application/json",
            //                         "X-CSRF-Token":
            //                             document.querySelector(
            //                                 'meta[name="csrf-token"]',
            //                             )?.content || "",
            //                     },
            //                     body: JSON.stringify({
            //                         reference: response.reference,
            //                         order_id: paymentData.order_id,
            //                         reason:
            //                             verifyResult.message ||
            //                             "Payment verification failed",
            //                     }),
            //                 }).catch((err) =>
            //                     console.error(
            //                         "Error notifying payment failure:",
            //                         err,
            //                     ),
            //                 );
            //             }
            //         } catch (err) {
            //             console.error("Error during verification:", err);
            //             setError("Error verifying payment: " + err.message);
            //             setIsInitializing(false);
            //         }
            //     },
            // });

            const handler = window.PaystackPop.setup({
                key: publicKey,
                email: userEmail,
                amount: Math.round(finalTotal * 100),
                ref: paymentData.reference,

                callback: async function (response) {
                    console.log("SUCCESS CALLBACK FIRED");
                    console.log(response);
                    console.log("🎉 PAYMENT SUCCESS", response);

                    const verifyResponse = await fetch("/payment/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token":
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                )?.content || "",
                        },
                        body: JSON.stringify({
                            reference: response.reference,
                            order_id: paymentData.order_id,
                        }),
                    });

                    const verifyResult = await verifyResponse.json();

                    console.log("VERIFY RESULT", verifyResult);

                    if (verifyResult.status) {
                        window.location.href = `/orders/${paymentData.order_id}/confirmation`;
                    }
                },

                onClose: function () {
                    console.log("Modal closed");
                },
            });
            handler.openIframe();
            console.log("Paystack iframe opened");
        } catch (err) {
            console.error("Error in handlePayment:", err);
            setIsInitializing(false);
        }
    };

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
                    <AlertCircle
                        size={64}
                        className="mx-auto text-gray-300 mb-4"
                    />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Add some items before proceeding to payment
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
                {/* Order Items */}
                <div className="lg:col-span-2">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.visit("/cart")}
                        className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Cart</span>
                    </motion.button>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Secure Payment
                        </h1>
                        <p className="text-gray-600">
                            {items.length} item{items.length !== 1 ? "s" : ""}{" "}
                            in your order
                        </p>
                    </motion.div>

                    {/* Items List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4 mb-8"
                    >
                        {items.map((item) => (
                            <motion.div key={item.id} variants={itemVariants}>
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
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">
                                                Qty: {item.quantity}
                                            </p>
                                            <p className="font-bold text-orange-500">
                                                ₦
                                                {(
                                                    item.menu_item_price *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Payment Method Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                    <CreditCard
                                        size={20}
                                        className="text-orange-500"
                                    />
                                    <span>Payment Method</span>
                                </h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Paystack securely processes all payment
                                    methods
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        {
                                            id: "card",
                                            label: "Card",
                                            icon: "💳",
                                        },
                                        {
                                            id: "bank_transfer",
                                            label: "Bank Transfer",
                                            icon: "🏦",
                                        },
                                        {
                                            id: "mobile_money",
                                            label: "Mobile Money",
                                            icon: "📱",
                                        },
                                    ].map((method) => (
                                        <motion.button
                                            key={method.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setPaymentMethod(method.id)
                                            }
                                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                                                paymentMethod === method.id
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="text-2xl mb-2">
                                                {method.icon}
                                            </div>
                                            <p
                                                className={`text-sm font-semibold ${
                                                    paymentMethod === method.id
                                                        ? "text-orange-600"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {method.label}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>

                    {/* Security Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <CheckCircle
                            size={20}
                            className="text-blue-600 flex-shrink-0 mt-1"
                        />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">
                                Secure Payment
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                Your payment information is encrypted and
                                processed securely by Paystack
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="sticky top-24"
                    >
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Order Total
                                </h2>
                            </CardHeader>

                            <CardBody className="space-y-6">
                                {/* Price Breakdown */}
                                <div className="space-y-3 pb-4 border-b border-gray-200">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₦{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (10%)</span>
                                        <span>₦{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                                        <span>Total</span>
                                        <span className="text-orange-500">
                                            ₦{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2"
                                    >
                                        <AlertCircle
                                            size={18}
                                            className="text-red-600 flex-shrink-0 mt-0.5"
                                        />
                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Loading State */}
                                {isInitializing && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
                                    >
                                        <Loader
                                            size={24}
                                            className="mx-auto text-blue-600 animate-spin mb-2"
                                        />
                                        <p className="text-sm text-blue-700">
                                            Initializing secure payment...
                                        </p>
                                    </motion.div>
                                )}

                                {/* Pay Button */}
                                <motion.button
                                    whileHover={{
                                        scale: isInitializing ? 1 : 1.02,
                                    }}
                                    whileTap={{
                                        scale: isInitializing ? 1 : 0.98,
                                    }}
                                    onClick={handlePayment}
                                    disabled={isInitializing || !paystackLoaded}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                                        isInitializing || !paystackLoaded
                                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                    }`}
                                >
                                    {isInitializing ? (
                                        <>
                                            <Loader
                                                size={18}
                                                className="animate-spin"
                                            />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={18} />
                                            <span>
                                                Pay ₦{finalTotal.toFixed(2)}
                                            </span>
                                        </>
                                    )}
                                </motion.button>

                                {/* Security Badges */}
                                <div className="flex items-center justify-center space-x-3 pt-4 border-t border-gray-200">
                                    <div className="text-center text-xs text-gray-600">
                                        <div className="text-lg mb-1">🔒</div>
                                        <p>SSL Secure</p>
                                    </div>
                                    <div className="text-center text-xs text-gray-600">
                                        <div className="text-lg mb-1">✓</div>
                                        <p>Verified</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </CustomerLayout>
    );
}
