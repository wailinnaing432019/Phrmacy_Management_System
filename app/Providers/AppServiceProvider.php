<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
         Inertia::share([
        'lastCategories' => function () {
    return Category::orderBy('id', 'desc')->where('trending','1')->take(5)->get(['id', 'name']);
},
        
    ]);
    }
}
