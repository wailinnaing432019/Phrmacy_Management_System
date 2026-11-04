<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Online Order Reservation Window
    |--------------------------------------------------------------------------
    |
    | How many hours a pending online order holds its stock before the
    | scheduled `orders:release-expired` command cancels it and restores
    | the reserved batches.
    |
    */

    'reservation_hours' => (int) env('ORDER_RESERVATION_HOURS', 24),

];
