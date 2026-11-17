<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('refunded_total', 10, 2)->default(0)->after('total');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->integer('returned_qty')->default(0)->after('quantity');
        });

        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->string('return_no')->unique();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('total', 10, 2)->default(0);
            $table->string('refund_method', 32)->default('cash');
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('sale_id');
        });

        Schema::create('sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sale_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained();
            $table->foreignId('purchased_item_id')->nullable()->constrained('purchased_items')->nullOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->boolean('restocked')->default(true);
            $table->timestamps();

            $table->index('sale_return_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_return_items');
        Schema::dropIfExists('sale_returns');

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('returned_qty');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('refunded_total');
        });
    }
};
