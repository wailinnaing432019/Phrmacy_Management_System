<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Repositories\Storefront\StorefrontRepositoryInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(
        private readonly StorefrontRepositoryInterface $storefrontRepository,
    ) {}

    /**
     * List all product categories.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = $this->storefrontRepository->getCategories();

        return CategoryResource::collection($categories);
    }
}

