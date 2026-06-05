<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Payment-related columns
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending')->after('status');
            $table->enum('payment_method', ['card', 'bank_transfer', 'mobile_money', 'other'])->nullable()->after('payment_status');
            $table->string('transaction_reference')->nullable()->unique()->after('payment_method');
            $table->decimal('amount_paid', 8, 2)->nullable()->after('transaction_reference');
            $table->timestamp('paid_at')->nullable()->after('amount_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'payment_method',
                'transaction_reference',
                'amount_paid',
                'paid_at',
            ]);
        });
    }
};
