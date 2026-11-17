<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Credit Note {{ $return->return_no }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 0;
            padding: 32px;
        }

        h1 {
            font-size: 22px;
            margin: 0;
            color: #111827;
        }

        .muted {
            color: #6b7280;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .header td {
            vertical-align: top;
        }

        .text-right {
            text-align: right;
        }

        .meta {
            width: 100%;
            margin-bottom: 20px;
        }

        .meta td {
            padding: 2px 0;
            vertical-align: top;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        table.items th {
            background: #f3f4f6;
            border-bottom: 1px solid #d1d5db;
            padding: 8px 6px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        table.items td {
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 6px;
        }

        .totals {
            width: 45%;
            margin-left: 55%;
        }

        .totals td {
            padding: 4px 0;
        }

        .totals .grand td {
            border-top: 1px solid #111827;
            font-size: 14px;
            font-weight: bold;
            padding-top: 8px;
        }

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            background: #e5e7eb;
            color: #374151;
        }

        .badge.yes {
            background: #dcfce7;
            color: #166534;
        }

        .notes {
            margin-top: 20px;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
        }

        .footer {
            margin-top: 40px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>

<body>
    <table class="header">
        <tr>
            <td>
                <h1>{{ config('app.name') }}</h1>
                <div class="muted">Credit Note / Return Receipt</div>
            </td>
            <td class="text-right">
                <div><strong>{{ $return->return_no }}</strong></div>
                <div class="muted">{{ $return->created_at->format('d-m-Y H:i') }}</div>
            </td>
        </tr>
    </table>

    <table class="meta">
        <tr>
            <td>
                <div class="muted">Original invoice</div>
                <div><strong>{{ $return->sale->invoice_no }}</strong></div>
            </td>
            <td>
                <div class="muted">Original sale date</div>
                <div>{{ $return->sale->created_at->format('d-m-Y H:i') }}</div>
            </td>
            <td>
                <div class="muted">Processed by</div>
                <div>{{ $return->processor->name ?? 'N/A' }}</div>
            </td>
            <td>
                <div class="muted">Refund method</div>
                <div>{{ ucfirst($return->refund_method) }}</div>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Medicine</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit price</th>
                <th class="text-right">Refund</th>
                <th>Restocked</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($return->items as $item)
                <tr>
                    <td>{{ $item->medicine->name ?? 'Unknown' }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($item->subtotal, 2) }}</td>
                    <td>
                        <span class="badge {{ $item->restocked ? 'yes' : '' }}">
                            {{ $item->restocked ? 'Yes' : 'No' }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Original sale total</td>
            <td class="text-right">{{ number_format($return->sale->total, 2) }} MMK</td>
        </tr>
        <tr>
            <td>Total refunded on this sale</td>
            <td class="text-right">{{ number_format($return->sale->refunded_total, 2) }} MMK</td>
        </tr>
        <tr class="grand">
            <td>Refunded now</td>
            <td class="text-right">{{ number_format($return->total, 2) }} MMK</td>
        </tr>
    </table>

    @if ($return->reason || $return->notes)
        <div class="notes">
            @if ($return->reason)
                <div><strong>Reason:</strong> {{ $return->reason }}</div>
            @endif
            @if ($return->notes)
                <div style="margin-top:4px"><strong>Notes:</strong> {{ $return->notes }}</div>
            @endif
        </div>
    @endif

    <div class="footer">
        This credit note confirms the goods listed above were returned and the refund was issued.
    </div>
</body>

</html>
