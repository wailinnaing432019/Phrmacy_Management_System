<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('reserved_at')->nullable()->after('status');
            $table->timestamp('reservation_expires_at')->nullable()->after('reserved_at');
            $table->timestamp('cancelled_at')->nullable()->after('reservation_expires_at');
            $table->string('cancellation_reason')->nullable()->after('cancelled_at');

            $table->index(['status', 'reservation_expires_at'], 'orders_status_reservation_expires_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_reservation_expires_at_index');
            $table->dropColumn([
                'reserved_at',
                'reservation_expires_at',
                'cancelled_at',
                'cancellation_reason',
            ]);
        });
    }
};
