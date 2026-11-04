<?php

namespace App\Http\Controllers;

use Picqer\Barcode\BarcodeGeneratorPNG;

class BarcodeController extends Controller
{
    /**
     * Render a Code-128 barcode as a PNG for staff-only screens.
     *
     * The route constrains the code to 1-64 safe characters, so this never
     * receives control characters or unbounded input.
     */
    public function __invoke(string $code)
    {
        $generator = new BarcodeGeneratorPNG;
        $barcode = $generator->getBarcode($code, $generator::TYPE_CODE_128);

        return response($barcode)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'private, max-age=86400');
    }
}
