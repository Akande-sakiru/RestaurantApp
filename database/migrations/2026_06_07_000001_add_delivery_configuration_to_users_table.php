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
        Schema::table('users', function (Blueprint $table) {
            // Restaurant location and delivery configuration
            $table->decimal('latitude', 10, 8)->nullable()->after('is_active');
            $table->decimal('longitude', 10, 8)->nullable()->after('latitude');
            $table->integer('max_delivery_radius_km')->default(20)->after('longitude');
        });

        Schema::table('orders', function (Blueprint $table) {
            // Customer delivery location and calculated fees
            $table->decimal('customer_latitude', 10, 8)->nullable()->after('delivery_address');
            $table->decimal('customer_longitude', 10, 8)->nullable()->after('customer_latitude');
            $table->decimal('delivery_distance_km', 8, 2)->nullable()->after('customer_longitude');
            $table->integer('delivery_fee')->default(0)->after('delivery_distance_km');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'max_delivery_radius_km']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['customer_latitude', 'customer_longitude', 'delivery_distance_km', 'delivery_fee']);
        });
    }
};
