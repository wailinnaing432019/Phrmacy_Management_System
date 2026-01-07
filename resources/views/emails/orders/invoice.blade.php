{{-- <x-mail::message>
# Introduction

The body of your message.

<x-mail::button :url="''">
Button Text
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message> --}}
{{-- 
@component('mail::message')
    # Invoice for Order #{{ $order->id }}

    Hello {{ $order->name }},

    Your order status has been updated to **{{ ucfirst($order->status) }}**.

    ### Order Details:
    @foreach ($order->items as $item)
        - {{ $item->medicine->name }} (x{{ $item->quantity }}) - ${{ $item->price }}
    @endforeach

    **Total: ${{ $order->total }}**

    @component('mail::button', ['url' => url('/orders/' . $order->id)])
        View Order
    @endcomponent

    Thanks,
    {{ config('app.name') }}
@endcomponent --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->order_no }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 20px;
        }

        .header {
            text-align: center;
        }

        .logo {
            width: 200px;
            height: auto
        }

        .shop-info {
            margin-top: 10px;
            font-size: 12px;
        }

        .customer-info,
        .footer {
            margin-top: 20px;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
        }

        th {
            background: #f4f4f4;
        }

        .total {
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <!-- Shop Header -->
    <div class="header">
        <img src="{{ public_path('logo.webp') }}" class="logo" alt="Shop Logo">
        {{-- <img src="https://api.logo.com/api/v2/images?design=lg_g2I8I6vfS4uoshqtWb&u=a5bfc8b4cc130aaa56385ffbed2abff6692d63122e516c89fa7a00f072e68bb8&width=1600&height=900&margins=300&fit=contain&format=webp&quality=60&tightBounds=true"
            alt="" className="h-[80px] w-52 logo" /> --}}
        <h2>Medical Supply Store</h2>
        <div class="shop-info">
            No.123, Main Road, Yangon, Myanmar <br>
            Phone: +95 9 123456789 | Email: support@medstore.com
        </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
        <strong>Invoice #: </strong> {{ $order->order_no }} <br>
        <strong>Date: </strong> {{ now()->format('d M Y') }} <br>
        <strong>Customer: </strong> {{ $order->name }} ({{ $order->email }})
    </div>

    <!-- Order Items -->
    <table>
        <thead>
            <tr>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Price (MMK)</th>
                <th>Total (MMK)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->medicine->name }}</td>
                    <td>{{ $item->qty }}</td>
                    <td>{{ number_format($item->price, 2) }}</td>
                    <td>{{ number_format($item->qty * $item->price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Total -->
    <p class="total">
        Grand Total: {{ number_format($order->items->sum(fn($i) => $i->qty * $i->price), 2) }} MMK
    </p>

    <!-- Footer -->
    <div class="footer">
        Thank you for shopping with us! <br>
        <em>This is a computer-generated invoice and does not require a signature.</em>
    </div>
</body>

</html>
