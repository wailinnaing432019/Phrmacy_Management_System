<!DOCTYPE html>
<html>

<head>
    <title>Invoice - HelixPharma</title>
    <style>
        body {
            font-family: monospace;
            font-size: 11px;
            width: 280px;
            padding: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 2px 0;
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

        hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 4px 0;
        }

        .truncate {
            max-width: 120px;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: top;
        }
    </style>
</head>

<body>
    <div style="text-align:center;">
        <h2>HelixPharma</h2>
        <p>Invoice #: {{ $sale->id }}</p>
        <p>{{ $sale->created_at->format('d-m-Y H:i') }}</p>
    </div>

    <hr>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Sub</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($sale->items as $item)
                <tr>
                    <td class="truncate">{{ $item->medicine->name }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <hr>

    <div class="text-right font-bold">
        <p>Total: {{ number_format($sale->total, 2) }}</p>
        <p>Received: {{ number_format($sale->received_amount, 2) }}</p>
        <p>Refund: {{ number_format($sale->refund_amount, 2) }}</p>
    </div>

    <div style="text-align:center; margin-top:10px;">
        <p>Thank you for your purchase!</p>
    </div>
</body>

</html>
