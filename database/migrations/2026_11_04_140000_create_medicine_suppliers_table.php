<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Restores the medicine_suppliers table that was previously parked under
 * database/migrations/backupdbs and therefore missing from fresh installs.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('medicine_suppliers')) {
            Schema::create('medicine_suppliers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
                $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
                $table->decimal('supplier_price', 10, 2);
                $table->boolean('is_preferred')->default(false);
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('medicine_suppliers');
    }
};
