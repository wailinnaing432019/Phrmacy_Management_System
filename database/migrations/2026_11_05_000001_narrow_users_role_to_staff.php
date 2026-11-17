<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * IMPORTANT: This migration must only be run after all orders with a user_id
     * that belongs to a legacy customer have customer_id set (done in C1 backfill).
     * Order: drop FK → drop column → delete legacy users → narrow enum.
     */
    public function up(): void
    {
        // 1. Abort unless every order that had a legacy customer user has customer_id set.
        //    Orders without customer_id may be staff-initiated (admin orders), which is acceptable.
        //    We only care about orders where user_id pointed to a role='user' account.
        $unlinked = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.role', 'user')
            ->whereNull('orders.customer_id')
            ->count();

        if ($unlinked > 0) {
            throw new \RuntimeException(
                "Cannot migrate: {$unlinked} order(s) are still linked to legacy customer users without a customer_id. Run the C1 backfill first."
            );
        }

        // 2. Drop orders.user_id FK and column.
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        // 3. Delete legacy role='user' rows from users.
        DB::table('users')->where('role', 'user')->delete();

        // 4. Narrow the users.role enum to ('admin','cashier'), default 'cashier'.
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','cashier') NOT NULL DEFAULT 'cashier'");
    }

    /**
     * Reverse the migrations.
     *
     * NOTE: Deleted legacy customer rows are NOT restored. Only the schema is reversed.
     */
    public function down(): void
    {
        // Re-widen the enum to include 'user'.
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','cashier','user') NOT NULL DEFAULT 'cashier'");

        // Re-add nullable user_id column without FK (FK to deleted rows cannot be restored).
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
        });
    }
};
