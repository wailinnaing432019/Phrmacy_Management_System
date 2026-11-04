<?php

namespace App\Http\Controllers;

use App\Services\Order\OrderService;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
    ) {}

    /**
     * Preview an order invoice in the browser.
     */
    public function preview($orderId)
    {
        $order = $this->orders->findForShow((int) $orderId);

        $pdf = Pdf::loadView('emails.orders.invoice', compact('order'))
            ->setPaper('A4', 'portrait');

        return $pdf->stream("invoice-{$order->id}.pdf");
    }

    /**
     * Download an order invoice directly.
     */
    public function download($orderId)
    {
        $order = $this->orders->findForShow((int) $orderId);

        $pdf = Pdf::loadView('emails.orders.invoice', compact('order'))
            ->setPaper('A4', 'portrait');

        return $pdf->download("invoice-{$order->order_no}.pdf");
    }
}
