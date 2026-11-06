<?php

namespace App\Services\Storefront;

use App\Http\Resources\Storefront\CategoryOptionResource;
use App\Http\Resources\Storefront\MedicineCardResource;
use App\Http\Resources\Storefront\ProductDetailResource;
use App\Models\Medicine;
use App\Repositories\Dashboard\DashboardRepositoryInterface;
use App\Repositories\Storefront\StorefrontRepositoryInterface;

class StorefrontService
{
    public function __construct(
        private readonly StorefrontRepositoryInterface $storefrontRepository,
        private readonly DashboardRepositoryInterface $dashboardRepository,
    ) {}

    /**
     * Get data payload for the storefront homepage.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getHomepageData(array $filters): array
    {
        $medicines = $this->storefrontRepository->getFeaturedMedicines($filters, 12);
        $categories = $this->storefrontRepository->getCategories();

        return [
            'medicines' => MedicineCardResource::collection($medicines)->resolve(),
            'filters' => array_intersect_key($filters, array_flip(['search', 'category_id'])),
            'categories' => CategoryOptionResource::collection($categories)->resolve(),
        ];
    }

    /**
     * Get data payload for the storefront products catalog.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getProductsData(array $filters): array
    {
        $sort = $filters['sort'] ?? null;
        $categories = $this->storefrontRepository->getCategories();

        if ($sort === 'top-selling') {
            $topIds = $this->dashboardRepository->topSellingMedicineIds(9);
            $medicines = $this->storefrontRepository->getTopSellingMedicines($topIds, $filters);

            $medicinesData = [
                'data' => MedicineCardResource::collection($medicines)->resolve(),
                'links' => [],
                'meta' => [],
            ];
        } elseif ($sort === 'new-arrivals') {
            $medicines = $this->storefrontRepository->getNewArrivals($filters, 9);

            $medicinesData = [
                'data' => MedicineCardResource::collection($medicines)->resolve(),
                'links' => [],
                'meta' => [],
            ];
        } else {
            $paginated = $this->storefrontRepository->paginateMedicines($filters, 6);

            $medicinesData = $paginated->through(
                fn (Medicine $medicine) => (new MedicineCardResource($medicine))->resolve()
            );
        }

        return [
            'medicines' => $medicinesData,
            'filters' => array_intersect_key($filters, array_flip(['search', 'category_id', 'sort'])),
            'categories' => CategoryOptionResource::collection($categories)->resolve(),
        ];
    }

    /**
     * Get data payload for a single product detail view.
     *
     * @return array<string, mixed>
     */
    public function getProductDetailData(Medicine $medicine): array
    {
        $loaded = $this->storefrontRepository->loadProductDetail($medicine);
        $categories = $this->storefrontRepository->getCategories();

        return [
            'medicine' => (new ProductDetailResource($loaded))->resolve(),
            'categories' => CategoryOptionResource::collection($categories)->resolve(),
            'filters' => [
                'category_id' => $loaded->category_id,
            ],
        ];
    }
}
