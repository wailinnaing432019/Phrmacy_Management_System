<?php

use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\MedicineSupplierController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\PurchasedItemController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleReturnController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('auth/google', [GoogleController::class, 'redirect'])->middleware('throttle:20,1')->name('google.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])->middleware('throttle:20,1')->name('google.callback');
Route::get('/', function () {
    // return Inertia::render('welcome');
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('/medicines', MedicineController::class);

    Route::patch('/medicines/{medicine}/add-qty', [MedicineController::class, 'addQty'])->name('medicines.addQty');

    Route::resource('/categories', CategoryController::class);
    Route::resource('/suppliers', SupplierController::class);
    Route::resource('/medicine-supply', MedicineSupplierController::class);
    Route::put('/purchased-items/{id}', [PurchasedItemController::class, 'update'])->name('purchased-items.update');
    // Route::get('/pos/lookup/{barcode}', [POSController::class, 'lookup']);
    Route::get('/pos/invoice/{id}', [PosController::class, 'invoice']);

    // Route::get('/pos',[POSController::class,'index'])->name('pos.index');
    // Route::post('/pos/complete-sale', [SaleController::class, 'store'])->name('pos.sale');

    Route::controller(SaleController::class)->group(function () {
        Route::get('/sales', 'index')->name('sales.index');
        Route::get('/sales/{id}', 'show')->name('sales.show');

    });

    Route::get('/sales/export/{format}', [SaleController::class, 'export'])->name('sales.export');

    Route::resource('/orders', OrderController::class);
    Route::resource('/users', UserController::class);

    Route::get('/invoice/{order}/preview', [InvoiceController::class, 'preview'])->name('invoice.preview');
    Route::get('/invoice/{order}/download', [InvoiceController::class, 'download'])->name('invoice.download');

    Route::get('/print-barcodes/{id}', [MedicineController::class, 'printBarcodes'])->name('medicines.printBarcodes');

    Route::get('/site-content', [SiteContentController::class, 'index'])->name('site-content.index');
    Route::put('/site-content', [SiteContentController::class, 'update'])->name('site-content.update');
});

Route::prefix('cashier')->middleware(['auth', 'verified', 'role:cashier'])->controller(CashierController::class)->group(function () {
    Route::get('/pos', 'index')->name('cashier.pos');
    Route::get('/sale', 'sale')->name('cashier.sale');
    Route::get('/sale/{sale}', 'show')->name('cashier.sale.show');
    Route::get('/dashboard', 'dashboard')->name('cashier.dashboard');

    Route::post('/pos/complete-sale', [SaleController::class, 'store'])->name('pos.sale');

    Route::get('/pos/invoice/{id}', [PosController::class, 'invoice'])->name('cashier.invoice');
    Route::get('/pos/lookup/{barcode}', [POSController::class, 'lookup'])
        ->where('barcode', '[A-Za-z0-9._-]{1,64}')
        ->middleware('throttle:120,1');
});

Route::middleware(['auth', 'verified', 'role:admin,cashier', 'throttle:120,1'])
    ->get('/barcode/{code}', BarcodeController::class)
    ->where('code', '[A-Za-z0-9._-]{1,64}')
    ->name('barcode.png');

Route::middleware(['auth', 'verified', 'role:admin,cashier'])->controller(SaleReturnController::class)->group(function () {
    Route::get('/returns', 'index')->name('returns.index');
    Route::get('/sales/{sale}/return', 'create')->name('returns.create');
    Route::post('/sales/{sale}/return', 'store')->name('returns.store');
    Route::get('/returns/{saleReturn}', 'show')->name('returns.show');
    Route::get('/returns/{saleReturn}/pdf', 'pdf')->name('returns.pdf');
});

// Customer-authenticated routes (customer guard + email verified)
Route::middleware(['customer', 'customer.verified'])->group(function () {
    Route::post('/checkout', [CustomerOrderController::class, 'checkout'])
        ->middleware('throttle:20,1')
        ->name('checkout');
    Route::get('/my-orders', [CustomerOrderController::class, 'myOrders'])->name('customers.myorders');
    Route::get('/my-orders/{order}', [CustomerOrderController::class, 'myOrderItems'])->name('customers.myorderitems');
    Route::get('/customers/checkout', [CustomerOrderController::class, 'showCheckout'])->name('customer.checkout');
    Route::get('/customers/orders', [CustomerOrderController::class, 'orders'])->name('customer.orders');
});

// Public storefront routes
Route::get('/customers', [StorefrontController::class, 'index'])->name('customer.index');
Route::get('/customers/products', [StorefrontController::class, 'products'])->name('customers.products');
Route::get('/customers/product/{medicine}', [StorefrontController::class, 'product'])->name('customers.product');
Route::get('/customers/cart', [StorefrontController::class, 'cart'])->name('customer.cart');
Route::post('/customers/contact', [ContactController::class, 'send'])
    ->middleware('throttle:5,1')
    ->name('contact');

// Customer SPA Storefront (powered by /api/v1)
Route::get('/spa', fn () => Inertia::render('customers/SpaApp'))->name('customer.spa');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
