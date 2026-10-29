<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sequences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 32);
            $table->unsignedSmallInteger('year');
            $table->unsignedBigInteger('value')->default(0);
            $table->timestamps();

            $table->unique(['name', 'year']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unique('order_no');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['order_no']);
        });

        Schema::dropIfExists('sequences');
    }
};
