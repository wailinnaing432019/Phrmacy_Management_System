{{-- <x-mail::message>
# Introduction

The body of your message.

<x-mail::button :url="''">
Button Text
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message> --}}
@component('mail::message')
    # Hi {{ $order->name }},

    Your order **#{{ $order->order_no }}** status has changed to **{{ ucfirst($order->status) }}**.

    @component('mail::panel')
        **Placed on:** {{ \Carbon\Carbon::parse($order->created_at)->format('M d, Y H:i') }}
        **Customer:** {{ $order->name }} ({{ $order->email }})
        **Phone:** {{ $order->phone }}
        **Address:** {{ $order->address }}
    @endcomponent

    ### Items
    | Medicine | Qty | Unit Price | Line Total |
    |:--|:--:|--:|--:|
    @foreach ($order->items as $it)
        | {{ $it->medicine->name ?? '—' }} | {{ $it->qty }} | Ks{{ number_format((float) $it->price, 2) }} |
        Ks{{ number_format((float) $it->qty * (float) $it->price, 2) }} |
    @endforeach

    **Order Total:** Ks{{ number_format((float) $order->total, 2) }}

    @if ($order->status === 'completed')
        @component('mail::button', ['url' => url('/orders/' . $order->id)])
            View Order
        @endcomponent
    @endif

    Thanks,<br>
    {{ config('app.name') }}
@endcomponent
