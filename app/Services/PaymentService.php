<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    private Client $httpClient;
    private string $publicKey;
    private string $secretKey;
    private string $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');

        if (!$this->secretKey || !$this->publicKey) {
            throw new \Exception('Paystack API keys not configured');
        }

        $this->httpClient = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Initialize a payment transaction with Paystack
     * Returns reference code for payment modal
     */
    public function initializePayment(User $user, Order $order, string $paymentMethod = 'card'): array
    {
        try {
            $response = $this->httpClient->post('/transaction/initialize', [
                'json' => [
                    'email' => $user->email,
                    'amount' => (int) ($order->total * 100), // Paystack uses kobo (cents)
                    'reference' => $this->generateReference($order->id),
                    'callback_url' => route('payment.callback'),
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'user_phone' => $user->phone,
                        'user_email' => $user->email,
                    ],
                    'channels' => $this->getPaymentChannels($paymentMethod),
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            if ($data['status'] !== true) {
                Log::error('Paystack initialization failed', [
                    'order_id' => $order->id,
                    'response' => $data,
                ]);
                throw new \Exception('Failed to initialize payment');
            }

            return [
                'status' => true,
                'authorization_url' => $data['data']['authorization_url'],
                'access_code' => $data['data']['access_code'],
                'reference' => $data['data']['reference'],
            ];
        } catch (GuzzleException $e) {
            Log::error('Paystack API error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Payment service temporarily unavailable');
        }
    }

    /**
     * Verify a payment transaction with Paystack
     */
    public function verifyPayment(string $reference): array
    {
        try {
            $response = $this->httpClient->get("/transaction/verify/{$reference}");

            $data = json_decode($response->getBody(), true);

            if ($data['status'] !== true) {
                Log::warning('Paystack verification failed', [
                    'reference' => $reference,
                    'response' => $data,
                ]);
                return [
                    'status' => false,
                    'message' => 'Payment verification failed',
                ];
            }

            $transaction = $data['data'];

            // Check if payment was successful
            if ($transaction['status'] === 'success') {
                // Order::where('id', $order_id)->update([
                //     'payment_status' => 'paid',
                //     'transaction_reference' => $transaction['reference'],
                //     'paid_at' => now()
                // ]);
                return [
                    'status' => true,
                    'message' => 'Payment successful',
                    'reference' => $transaction['reference'],
                    'amount' => $transaction['amount'] / 100, // Convert back to Naira
                    'metadata' => $transaction['metadata'],
                    'authorization' => $transaction['authorization'],
                ];

            }

            return [
                'status' => false,
                'message' => 'Payment was not successful',
                'transaction_status' => $transaction['status'],
            ];
        } catch (GuzzleException $e) {
            Log::error('Paystack verification error', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Payment verification failed');
        }
    }

    /**
     * Charge authorization for recurring payments
     */
    public function chargeAuthorization(
        Order $order,
        string $authorizationCode,
        string $email
    ): array {
        try {
            $response = $this->httpClient->post('/transaction/charge_authorization', [
                'json' => [
                    'authorization_code' => $authorizationCode,
                    'email' => $email,
                    'amount' => (int) ($order->total * 100),
                    'reference' => $this->generateReference($order->id),
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                ],
            ]);

            $data = json_decode($response->getBody(), true);

            if ($data['status'] === true && $data['data']['status'] === 'success') {
                return [
                    'status' => true,
                    'reference' => $data['data']['reference'],
                    'amount' => $data['data']['amount'] / 100,
                ];
            }

            return [
                'status' => false,
                'message' => $data['data']['gateway_response'] ?? 'Charge failed',
            ];
        } catch (GuzzleException $e) {
            Log::error('Paystack charge authorization error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Charge authorization failed');
        }
    }

    /**
     * Get customer details from Paystack
     */
    public function getCustomer(string $code): array
    {
        try {
            $response = $this->httpClient->get("/customer/{$code}");
            $data = json_decode($response->getBody(), true);

            if ($data['status'] === true) {
                return $data['data'];
            }

            throw new \Exception('Customer not found');
        } catch (GuzzleException $e) {
            Log::error('Paystack get customer error', ['error' => $e->getMessage()]);
            throw new \Exception('Failed to fetch customer details');
        }
    }

    /**
     * Mark order as paid
     */
    public function markOrderAsPaid(
        Order $order,
        string $reference,
        string $paymentMethod,
        float $amountPaid
    ): bool {
        try {
            $order->update([
                'payment_status' => 'paid',
                'payment_method' => $paymentMethod,
                'transaction_reference' => $reference,
                'amount_paid' => $amountPaid,
                'paid_at' => now(),
                'status' => 'confirmed', // Auto-confirm order after payment
            ]);

            Log::info('Order marked as paid', [
                'order_id' => $order->id,
                'reference' => $reference,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error marking order as paid', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Mark order payment as failed
     */
    public function markPaymentAsFailed(Order $order, string $reference, string $reason = ''): bool
    {
        try {
            $order->update([
                'payment_status' => 'failed',
                'transaction_reference' => $reference,
                'status' => 'cancelled',
            ]);

            Log::warning('Order payment failed', [
                'order_id' => $order->id,
                'reference' => $reference,
                'reason' => $reason,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error marking payment as failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get payment channels based on payment method
     */
    private function getPaymentChannels(string $paymentMethod): array
    {
        $channelMapping = [
            'card' => ['card'],
            'bank_transfer' => ['bank_transfer'],
            'mobile_money' => ['mobile_money'],
            'all' => ['card', 'bank_transfer', 'mobile_money', 'ussd', 'qr'],
        ];

        return $channelMapping[$paymentMethod] ?? ['card', 'bank_transfer', 'mobile_money'];
    }

    /**
     * Generate unique transaction reference
     */
    private function generateReference(int $orderId): string
    {
        return 'ORD-' . $orderId . '-' . time() . '-' . random_int(1000, 9999);
    }

    /**
     * Get public key for frontend
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }
}
