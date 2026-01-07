<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Barryvdh\DomPDF\Facade\Pdf; 
use App\Models\Order;

class InvoiceController extends Controller
{
    // Preview invoice in browser
    public function preview($orderId)
    {
        $order = Order::with('items.medicine')->findOrFail($orderId);

        $pdf = Pdf::loadView('emails.orders.invoice', compact('order'))
                  ->setPaper('A4', 'portrait');

        return $pdf->stream("invoice-{$order->id}.pdf"); // open in browser
    }

    // Download invoice directly
    public function download($orderId)
    {
        $order = Order::with('items.medicine')->findOrFail($orderId);

        $pdf = Pdf::loadView('emails.orders.invoice', compact('order'))
                  ->setPaper('A4', 'portrait');

        return $pdf->download("invoice-{$order->order_no}.pdf");
    }
}
