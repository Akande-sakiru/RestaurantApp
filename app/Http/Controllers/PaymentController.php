<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
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
        // POST request - validate and store in session
        $validated = $request->validate([
            'type' => 'required|in:dine-in,takeaway,delivery',
            'delivery_address' => 'nullable|string',
            'table_number' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Store in session temporarily
        $request->session()->put('pending_order_data', $validated);

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

        // Get order data from session
        $orderData = $request->session()->get('pending_order_data');
        if (!$orderData) {
            // Default to dine-in if no order data
            $orderData = [
                'type' => 'dine-in',
                'delivery_address' => null,
                'table_number' => null,
                'notes' => null,
            ];
        }

        // Transform cart items to match frontend expectations
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

        return Inertia::render('Payment/Index', [
            'cartItems' => $transformedItems,
            'subtotal' => $subtotal,
            'publicKey' => $publicKey,
            'orderData' => $orderData,
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

            // Validate the order data from frontend
            $validated = $request->validate([
                'type' => 'required|in:dine-in,takeaway,delivery',
                'delivery_address' => 'nullable|string',
                'table_number' => 'nullable|string',
                'notes' => 'nullable|string|max:1000',
                'payment_method' => 'required|string',
            ]);

            // Create pending order (not confirmed yet)
            $order = $this->orderService->createPendingOrder($user, [
                'type' => $validated['type'],
                'delivery_address' => $validated['delivery_address'],
                'table_number' => $validated['table_number'],
                'notes' => $validated['notes'],
            ]);

            // Initialize payment with Paystack
            $paymentData = $this->paymentService->initializePayment(
                $user,
                $order,
                $validated['payment_method'] ?? 'all'
            );

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
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify payment after successful Paystack transaction
     */
    public function verify(Request $request)
    {
        try {
            $validated = $request->validate([
                'reference' => 'required|string',
                'order_id' => 'required|integer|exists:orders,id',
            ]);

            $reference = $validated['reference'];
            $order = Order::findOrFail($validated['order_id']);

            // Check if order belongs to user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Verify payment with Paystack
            $paymentResult = $this->paymentService->verifyPayment($reference);

            if (!$paymentResult['status']) {
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

            // Mark order as paid
            $this->paymentService->markOrderAsPaid(
                $order,
                $reference,
                $paymentResult['metadata']['payment_method'] ?? 'card',
                $paymentResult['amount']
            );

            // Clear cart after successful payment
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
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
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

            // Check if order belongs to user
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Mark payment as failed
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

        // Verify webhook signature
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
