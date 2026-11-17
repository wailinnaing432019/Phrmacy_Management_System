<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MedicineResource;
use App\Models\Medicine;
use App\Repositories\Storefront\StorefrontRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly StorefrontRepositoryInterface $storefrontRepository,
    ) {}

    /**
     * Paginated list of available products with optional search, category, and sorting.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(50, max(1, (int) $request->input('per_page', 12)));
        $medicines = $this->storefrontRepository->paginateMedicines($request->all(), $perPage);

        return MedicineResource::collection($medicines);
    }

    /**
     * Single product detail.
     */
    public function show(Medicine $medicine): JsonResponse
    {
        $loaded = $this->storefrontRepository->loadProductDetail($medicine);

        return response()->json([
            'data' => new MedicineResource($loaded),
        ]);
    }
}

