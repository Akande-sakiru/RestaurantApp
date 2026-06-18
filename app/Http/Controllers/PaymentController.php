<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly OrderService $orderService,
        private readonly PaymentService $paymentService,
    ) {
    }

    /**
     * Handle form submission from cart - redirect to payment page
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:dine-in,takeaway,delivery',
            'delivery_address' => 'nullable|string',
            'delivery_phone' => 'nullable|string',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        Log::info('Payment create - form data received', $validated);
        
        $request->session()->put('pending_order_data', $validated);
        
        Log::info('Payment create - session data stored', [
            'session_key' => 'pending_order_data',
            'data' => $validated,
        ]);

        return redirect()->route('payment.show');
    }

    /**
     * Show payment initialization page with order details
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $cartItems = $this->cartService->get($user);
        $subtotal = $this->cartService->subtotal($user);

        if (empty($cartItems)) {
            return back()->withErrors(['cart' => 'Your cart is empty']);
        }

        $orderData = $request->session()->get('pending_order_data');
        
        Log::info('Payment show - retrieved session data', [
            'orderData' => $orderData,
        ]);
        
        if (!$orderData) {
            Log::info('Payment show - no session data, using default');
            $orderData = [
                'type' => 'dine-in',
                'delivery_address' => null,
                'delivery_phone' => null,
                'table_number' => null,
                'notes' => null,
            ];
        }

        $transformedItems = array_values(array_map(function ($item) {
            return [
                'id' => $item['id'],
                'menu_item_name' => $item['name'],
                'customization_notes' => $item['notes'],
                'menu_item_price' => $item['price'],
                'quantity' => $item['quantity'],
            ];
        }, $cartItems));

        $publicKey = $this->paymentService->getPublicKey();

        // Get admin user for restaurant configuration (delivery location)
        $admin = User::where('id', 1)->first();
        
        // Merge admin restaurant data with user data for frontend
        $userWithRestaurant = $user->toArray();
        if ($admin) {
            $userWithRestaurant['restaurant_id'] = $admin->id;
            $userWithRestaurant['latitude'] = $admin->latitude;
            $userWithRestaurant['longitude'] = $admin->longitude;
            $userWithRestaurant['max_delivery_radius_km'] = $admin->max_delivery_radius_km ?? 20;
        }
        // dd($userWithRestaurant);

        return Inertia::render('Payment/Index', [
            'cartItems' => $transformedItems,
            'subtotal' => $subtotal,
            'publicKey' => $publicKey,
            'orderData' => $orderData,
            'restaurantUser' => $userWithRestaurant,
        ]);
    }

    /**
     * Initialize payment with Paystack
     * Creates pending order and returns payment initialization data
     */
    public function initialize(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'type' => 'required|in:dine-in,takeaway,delivery',
                'delivery_address' => 'nullable|string',
                'delivery_phone' => 'nullable|string',
                'table_number' => 'nullable|string',
                'notes' => 'nullable|string|max:1000',
                'payment_method' => 'required|string',
                'delivery_fee' => 'nullable|integer|min:0',
                'customer_latitude' => 'nullable|numeric|between:-90,90',
                'customer_longitude' => 'nullable|numeric|between:-180,180',
                'delivery_distance_km' => 'nullable|numeric|min:0',
            ]);

            $order = $this->orderService->createPendingOrder($user, [
                'type' => $validated['type'],
                'delivery_address' => $validated['delivery_address'] ?? "",
                'delivery_phone' => $validated['delivery_phone'] ?? "",
                'table_number' => $validated['table_number'] ?? "",
                'notes' => $validated['notes'] ?? "",
                'delivery_fee' => $validated['delivery_fee'] ?? 0,
                'customer_latitude' => $validated['customer_latitude'] ?? null,
                'customer_longitude' => $validated['customer_longitude'] ?? null,
                'delivery_distance_km' => $validated['delivery_distance_km'] ?? null,
            ]);

            Log::info('Payment initialization', ['order_id' => $order->id, 'payment_method' => $validated['payment_method']]);

            $paymentData = $this->paymentService->initializePayment($user, $order, $validated['payment_method']);

            return response()->json([
                'status' => true,
                'message' => 'Payment initialized successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'amount' => $order->total,
                    'authorization_url' => $paymentData['authorization_url'],
                    'access_code' => $paymentData['access_code'],
                    'reference' => $paymentData['reference'],
                ],
            ]);
        } catch (ValidationException $e) {
            Log::error('Payment initialization validation error', ['errors' => $e->errors()]);
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment initialization exception', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle payment callback from Paystack after user completes payment
     */
    public function callback(Request $request)
    {
        try {
            $reference = $request->query('reference');

            if (!$reference) {
                return redirect()->route('payment.show')->withErrors(['payment' => 'Invalid payment reference']);
            }

            Log::info('Payment callback received', ['reference' => $reference]);

            // Extract order_id from reference (format: ORD-{order_id}-{timestamp}-{random})
            $parts = explode('-', $reference);
            if (count($parts) < 2) {
                return redirect()->route('payment.show')->withErrors(['payment' => 'Invalid reference format']);
            }

            $orderId = (int) $parts[1];
            $order = Order::findOrFail($orderId);

            // Check if order belongs to user
            if ($order->user_id !== $request->user()->id) {
                Log::warning('Payment callback - unauthorized access', ['order_id' => $orderId, 'user_id' => $request->user()->id]);
                abort(403, 'Unauthorized');
            }

            // Verify payment with Paystack
            $paymentResult = $this->paymentService->verifyPayment($reference);
            Log::info('Payment verification from callback', ['result' => $paymentResult, 'reference' => $reference]);

            if (!$paymentResult['status']) {
                Log::warning('Payment verification failed in callback', ['reference' => $reference]);
                $this->paymentService->markPaymentAsFailed(
                    $order,
                    $reference,
                    $paymentResult['message'] ?? 'Payment verification failed'
                );

                return redirect()->route('payment.show')->withErrors(['payment' => 'Payment verification failed']);
            }

            // Mark order as paid
            $this->paymentService->markOrderAsPaid(
                $order,
                $reference,
                $paymentResult['authorization']['channel'] ?? 'card',
                $paymentResult['amount']
            );

            // Clear cart after successful payment
            $this->cartService->clear($request->user());

            Log::info('Payment successful - redirecting to confirmation', ['order_id' => $order->id]);

            // Redirect to confirmation page
            return redirect()->route('orders.confirmation', $order);
        } catch (\Exception $e) {
            Log::error('Payment callback error', ['error' => $e->getMessage()]);
            return redirect()->route('payment.show')->withErrors(['payment' => 'An error occurred processing your payment']);
        }
    }

    /**
     * Verify payment after successful Paystack transaction (legacy - for API calls)
     */
    public function verify(Request $request)
    {
        try {
            Log::info('Payment verification started', ['request_data' => $request->only(['reference', 'order_id'])]);
            
            $validated = $request->validate([
                'reference' => 'required|string',
                'order_id' => 'required|integer|exists:orders,id',
            ]);

            $reference = $validated['reference'];
            $order = Order::findOrFail($validated['order_id']);

            Log::info('Payment verification - order found', ['order_id' => $order->id, 'order_status' => $order->payment_status]);

            if ($order->user_id !== $request->user()->id) {
                Log::warning('Payment verification - unauthorized user', ['order_id' => $order->id, 'user_id' => $request->user()->id]);
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            try {
                $paymentResult = $this->paymentService->verifyPayment($reference);
                Log::info('Payment verification - Paystack response', ['result' => $paymentResult]);
            } catch (\Exception $e) {
                Log::error('Payment verification - Paystack API error', ['error' => $e->getMessage()]);
                return response()->json([
                    'status' => false,
                    'message' => 'Unable to verify payment with payment provider. Please try again.',
                    'details' => $e->getMessage(),
                ], 500);
            }

            if (!$paymentResult['status']) {
                Log::warning('Payment verification failed', ['reference' => $reference, 'result' => $paymentResult]);
                $this->paymentService->markPaymentAsFailed(
                    $order,
                    $reference,
                    $paymentResult['message'] ?? 'Payment verification failed'
                );

                return response()->json([
                    'status' => false,
                    'message' => 'Payment verification failed',
                    'details' => $paymentResult['message'] ?? '',
                ], 400);
            }

            Log::info('Payment verified successfully', ['order_id' => $order->id, 'reference' => $reference]);

            $this->paymentService->markOrderAsPaid(
                $order,
                $reference,
                $paymentResult['authorization']['channel'] ?? 'card',
                $paymentResult['amount']
            );

            $this->cartService->clear($request->user());

            return response()->json([
                'status' => true,
                'message' => 'Payment verified successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'reference' => $reference,
                ],
            ]);
        } catch (ValidationException $e) {
            Log::error('Payment verification validation error', ['errors' => $e->errors()]);
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment verification exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => false,
                'message' => 'An error occurred during payment verification',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle payment failure/cancellation
     */
    public function fail(Request $request)
    {
        try {
            $validated = $request->validate([
                'reference' => 'required|string',
                'order_id' => 'required|integer|exists:orders,id',
                'reason' => 'nullable|string',
            ]);

            $order = Order::findOrFail($validated['order_id']);

            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $this->paymentService->markPaymentAsFailed(
                $order,
                $validated['reference'],
                $validated['reason'] ?? 'User cancelled payment'
            );

            return response()->json([
                'status' => true,
                'message' => 'Payment cancelled',
            ]);
        } catch (\Exception $e) {
            Log::error('Payment fail error', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Webhook handler for Paystack events
     */
    public function webhook(Request $request)
    {
        $signature = $request->header('X-Paystack-Signature');
        $body = $request->getContent();

        if ($signature !== hash('sha512', $body . config('services.paystack.secret_key'))) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = json_decode($body, true);

        if ($event['event'] === 'charge.success') {
            $reference = $event['data']['reference'];
            $metadata = $event['data']['metadata'];

            if (isset($metadata['order_id'])) {
                $order = Order::find($metadata['order_id']);

                if ($order && $order->payment_status !== 'paid') {
                    $this->paymentService->markOrderAsPaid(
                        $order,
                        $reference,
                        $event['data']['authorization']['channel'] ?? 'card',
                        $event['data']['amount'] / 100
                    );
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
