<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // No users are seeded on purpose: shipping default credentials is a
        // security risk. Create the first admin with:
        //
        //     php artisan app:create-admin
        $this->call(Userfactory::class);
    }
}
