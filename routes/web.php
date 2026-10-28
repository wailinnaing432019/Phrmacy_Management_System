<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\MedicineSupplierController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\PurchasedItemController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Models\Category;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Picqer\Barcode\BarcodeGeneratorPNG;


Route::get('auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');
Route::get('/', function () {
    // return Inertia::render('welcome'); 
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified','role:admin' ])->group(function () {
    Route::get('dashboard', [DashboardController::class,'index'])->name('dashboard');
    Route::resource('/medicines',MedicineController::class);
 
    Route::patch('/medicines/{medicine}/add-qty', [MedicineController::class, 'addQty'])->name('medicines.addQty');

    Route::resource('/categories',CategoryController::class);
    Route::resource('/suppliers',SupplierController::class);
    Route::resource('/medicine-supply',MedicineSupplierController::class);
    Route::put('/purchased-items/{id}', [PurchasedItemController::class, 'update'])->name('purchased-items.update');
    // Route::get('/pos/lookup/{barcode}', [POSController::class, 'lookup']);
    Route::get('/pos/invoice/{id}', [PosController::class, 'invoice']);

    // Route::get('/pos',[POSController::class,'index'])->name('pos.index');
    // Route::post('/pos/complete-sale', [SaleController::class, 'store'])->name('pos.sale');
    
    Route::controller(SaleController::class)->group(function(){
        Route::get('/sales','index')->name('sales.index');
        Route::get('/sales/{id}', 'show')->name('sales.show');

    });
 
    Route::get('/sales/export/{format}', [SaleController::class, 'export'])->name('sales.export');

    Route::resource('/orders', OrderController::class);
    Route::resource('/users', UserController::class);


    Route::get('/invoice/{order}/preview', [InvoiceController::class, 'preview'])->name('invoice.preview');
    Route::get('/invoice/{order}/download', [InvoiceController::class, 'download'])->name('invoice.download');

    Route::get('/print-barcodes/{id}', [MedicineController::class, 'printBarcodes'])->name('medicines.printBarcodes');
});

Route::prefix('cashier')->middleware(['auth', 'verified','role:cashier'])->controller(CashierController::class)->group(function () {
    Route::get('/pos', 'index')->name('cashier.pos');
    Route::get('/sale','sale')->name('cashier.sale');
    Route::get('/sale/{sale}','show')->name('cashier.sale.show');
    Route::get('/dashboard','dashboard')->name('cashier.dashboard');


    Route::post('/pos/complete-sale', [SaleController::class, 'store'])->name('pos.sale');
    
    Route::get('/pos/invoice/{id}', [PosController::class, 'invoice'])->name('cashier.invoice');
    Route::get('/pos/lookup/{barcode}', [POSController::class, 'lookup']);
});
Route::get('/barcode/{code}', function ($code) {
    $generator = new BarcodeGeneratorPNG();
    $barcode = $generator->getBarcode($code, $generator::TYPE_CODE_128);
    return response($barcode)->header('Content-Type', 'image/png');
});


Route::middleware(['auth', 'verified','role:user' ])->group(function () {
    Route::post('/checkout', [CustomerController::class, 'checkout'])->name('checkout');
    Route::get('/my-orders', [CustomerController::class, 'myOrders'])->name('customers.myorders');
    Route::get('/my-orders/{order}', [CustomerController::class, 'myOrderItems'])->name('customers.myorderitems');
    Route::get('/customers/checkout', [CustomerController::class, 'showCheckout'])->name('customer.checkout');
 
Route::get('/customers/orders', [CustomerController::class, 'orders'])->name('customer.orders');
});

Route::get('/customers/login', [CustomerController::class, 'login'])->name('customer.login');
Route::get('/customers/register', [CustomerController::class, 'register'])->name('customer.register');

Route::get('/customers', [CustomerController::class, 'index'])->name('customer.index');
Route::get('/customers/products', [CustomerController::class, 'products'])->name('customers.products');
Route::get('/customers/product/{medicine}', [CustomerController::class, 'product'])->name('customers.product');
Route::get('/customers/cart', [CustomerController::class, 'cart'])->name('customer.cart');
Route::post('/customers/contact', [CustomerController::class, 'send'])->name('contact');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
