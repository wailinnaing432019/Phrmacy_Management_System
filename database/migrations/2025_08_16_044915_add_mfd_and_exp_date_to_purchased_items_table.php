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
        Schema::table('purchased_items', function (Blueprint $table) {
            $table->integer('sold_qty')->default(0); 
            $table->date('mfd_date')->nullable();
            $table->date('exp_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchased_items', function (Blueprint $table) {
            $table->dropColumn(['sold_qty','mfd_date', 'exp_date']);
        });
    }
};
