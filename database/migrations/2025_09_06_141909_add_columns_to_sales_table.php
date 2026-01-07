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
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('received_amount', 10, 2)->after('total')->nullable();
        $table->decimal('refund_amount', 10, 2)->after('received_amount')->nullable();
        $table->string('payment_method', 50)->after('refund_amount')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
             $table->dropColumn(['received_amount', 'refund_amount', 'payment_method']);
        });
    }
};
