<?php

namespace App\Console\Commands;

use App\Services\OrderReservationService;
use Illuminate\Console\Command;

class ReleaseExpiredOrderReservations extends Command
{
    protected $signature = 'orders:release-expired';

    protected $description = 'Cancel pending online orders whose stock reservation has expired';

    public function handle(OrderReservationService $reservations): int
    {
        $expired = $reservations->expirePending();

        $this->info("Released {$expired} expired order reservation(s).");

        return self::SUCCESS;
    }
}
