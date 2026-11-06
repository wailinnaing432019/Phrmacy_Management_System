<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Services\Storefront\StorefrontService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function __construct(
        private readonly StorefrontService $storefrontService,
    ) {}

    /**
     * Storefront homepage.
     */
    public function index(Request $request): Response
    {
        $data = $this->storefrontService->getHomepageData($request->all());

        return Inertia::render('customers/Index', $data);
    }

    /**
     * Storefront products catalog.
     */
    public function products(Request $request): Response
    {
        $data = $this->storefrontService->getProductsData($request->all());

        return Inertia::render('customers/Product', $data);
    }

    /**
     * Product detail page.
     */
    public function product(Medicine $medicine): Response
    {
        $data = $this->storefrontService->getProductDetailData($medicine);

        return Inertia::render('customers/Show', $data);
    }

    /**
     * Cart page.
     */
    public function cart(): Response
    {
        return Inertia::render('customers/Cart');
    }
}
