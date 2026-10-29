<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Batch cost must be exact money, not a floating point approximation.
        Schema::table('purchased_items', function (Blueprint $table) {
            $table->decimal('unit_price', 10, 2)->change();
        });

        // Reconcile the cached stock column with the batch ledger.
        DB::statement('
            UPDATE medicines m
            SET qty = (
                SELECT COALESCE(SUM(p.qty - p.sold_qty), 0)
                FROM purchased_items p
                WHERE p.medicine_id = m.id
            )
        ');
    }

    public function down(): void
    {
        Schema::table('purchased_items', function (Blueprint $table) {
            $table->float('unit_price')->change();
        });
    }
};
