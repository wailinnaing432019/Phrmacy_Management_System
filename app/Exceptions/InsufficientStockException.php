<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(
        public readonly string $medicineName,
        public readonly int $requested,
        public readonly int $available,
    ) {
        parent::__construct(
            "Insufficient stock for {$medicineName}: requested {$requested}, available {$available}."
        );
    }
}
