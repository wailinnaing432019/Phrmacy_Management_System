<?php

namespace App\Providers;

use App\Repositories\Category\CategoryRepository;
use App\Repositories\Category\CategoryRepositoryInterface;
use App\Repositories\Dashboard\DashboardRepository;
use App\Repositories\Dashboard\DashboardRepositoryInterface;
use App\Repositories\Medicine\MedicineRepository;
use App\Repositories\Medicine\MedicineRepositoryInterface;
use App\Repositories\MedicineSupplier\MedicineSupplierRepository;
use App\Repositories\MedicineSupplier\MedicineSupplierRepositoryInterface;
use App\Repositories\Order\OrderRepository;
use App\Repositories\Order\OrderRepositoryInterface;
use App\Repositories\PurchasedItem\PurchasedItemRepository;
use App\Repositories\PurchasedItem\PurchasedItemRepositoryInterface;
use App\Repositories\Sale\SaleRepository;
use App\Repositories\Sale\SaleRepositoryInterface;
use App\Repositories\SaleReturn\SaleReturnRepository;
use App\Repositories\SaleReturn\SaleReturnRepositoryInterface;
use App\Repositories\Supplier\SupplierRepository;
use App\Repositories\Supplier\SupplierRepositoryInterface;
use App\Repositories\User\UserRepository;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Repository interface bindings.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        CategoryRepositoryInterface::class => CategoryRepository::class,
        DashboardRepositoryInterface::class => DashboardRepository::class,
        MedicineRepositoryInterface::class => MedicineRepository::class,
        MedicineSupplierRepositoryInterface::class => MedicineSupplierRepository::class,
        OrderRepositoryInterface::class => OrderRepository::class,
        PurchasedItemRepositoryInterface::class => PurchasedItemRepository::class,
        SaleRepositoryInterface::class => SaleRepository::class,
        SaleReturnRepositoryInterface::class => SaleReturnRepository::class,
        SupplierRepositoryInterface::class => SupplierRepository::class,
        UserRepositoryInterface::class => UserRepository::class,
    ];
}
