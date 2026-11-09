<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\JsonResponse;

class SiteContentController extends Controller
{
    /**
     * Return public storefront website content.
     */
    public function index(): JsonResponse
    {
        $content = SiteContent::getFormattedContents();

        return response()->json([
            'status' => 'success',
            'data' => $content,
        ]);
    }
}
