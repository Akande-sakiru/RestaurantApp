<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->enum('type', ['dine-in', 'takeaway', 'delivery']);
            $table->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['card', 'bank_transfer', 'mobile_money', 'other'])->nullable();
            $table->string('transaction_reference')->nullable()->unique();
            $table->decimal('amount_paid', 8, 2)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('delivery_phone')->nullable();
            $table->string('table_number')->nullable();
            $table->decimal('subtotal', 8, 2);
            $table->decimal('total', 8, 2);
            $table->text('notes')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
