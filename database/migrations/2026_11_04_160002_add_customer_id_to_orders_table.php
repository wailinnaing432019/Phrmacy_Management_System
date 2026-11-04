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
     * C1 adds and backfills the customer foreign key. The legacy
     * orders.user_id column is kept until the customer guard owns
     * authentication in C2, otherwise registration followed by checkout
     * would reference a customer row that does not exist yet.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_id')
                ->nullable()
                ->after('id')
                ->constrained('customers')
                ->nullOnDelete();
        });

        // Copy legacy customer accounts into the new table, keeping their IDs
        // so existing order history can be linked without any data loss.
        $customers = DB::table('users')
            ->where('role', 'user')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => null,
                'email_verified_at' => $user->email_verified_at,
                'password' => $user->password,
                'google_id' => $user->google_id ?? null,
                'remember_token' => $user->remember_token,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'deleted_at' => null,
            ]);

        foreach ($customers->chunk(200) as $chunk) {
            DB::table('customers')->insertOrIgnore($chunk->all());
        }

        // Point existing orders at the copied customer row.
        DB::table('orders')
            ->whereIn('user_id', DB::table('customers')->select('id'))
            ->update(['customer_id' => DB::raw('user_id')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
        });
    }
};
