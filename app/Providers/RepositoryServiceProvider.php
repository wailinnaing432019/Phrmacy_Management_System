<?php

namespace App\Providers;

use App\Repositories\Category\CategoryRepository;
use App\Repositories\Category\CategoryRepositoryInterface;
use App\Repositories\Medicine\MedicineRepository;
use App\Repositories\Medicine\MedicineRepositoryInterface;
use App\Repositories\MedicineSupplier\MedicineSupplierRepository;
use App\Repositories\MedicineSupplier\MedicineSupplierRepositoryInterface;
use App\Repositories\Supplier\SupplierRepository;
use App\Repositories\Supplier\SupplierRepositoryInterface;
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
        SupplierRepositoryInterface::class => SupplierRepository::class,
        MedicineRepositoryInterface::class => MedicineRepository::class,
        MedicineSupplierRepositoryInterface::class => MedicineSupplierRepository::class,
    ];
}
