<?php

namespace App\Exports;

use App\Models\Sale;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class SalesExport implements FromCollection
{
    protected $sales;

    public function __construct(Collection $sales)
    {
        $this->sales = $sales;
    }

    public function collection()
    {
        return $this->sales->map(function($sale) {
            return [
                'Invoice No' => $sale->invoice_no,
                'Sale By' => $sale->user ? $sale->user->name : 'N/A',
                'Total' => $sale->total,
                'Created At' => $sale->created_at->format('Y-m-d'),
            ];
        });
    }
}
