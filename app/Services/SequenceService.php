<?php

namespace App\Services;

use App\Models\Sequence;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class SequenceService
{
    /**
     * Atomically increment and return the next number for a named sequence
     * in the given year.
     */
    public function next(string $name, ?int $year = null): int
    {
        $year ??= (int) now()->year;

        return DB::transaction(function () use ($name, $year) {
            $sequence = Sequence::query()
                ->where('name', $name)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                try {
                    $sequence = Sequence::create([
                        'name' => $name,
                        'year' => $year,
                        'value' => 0,
                    ]);
                } catch (UniqueConstraintViolationException) {
                    // Another request created it between our SELECT and INSERT.
                    $sequence = Sequence::query()
                        ->where('name', $name)
                        ->where('year', $year)
                        ->lockForUpdate()
                        ->firstOrFail();
                }
            }

            $sequence->value++;
            $sequence->save();

            return $sequence->value;
        });
    }

    public function invoiceNumber(): string
    {
        return sprintf('INV-%d-%06d', now()->year, $this->next('invoice'));
    }

    public function orderNumber(): string
    {
        return sprintf('ORD-%d-%06d', now()->year, $this->next('order'));
    }

    public function returnNumber(): string
    {
        return sprintf('RET-%d-%06d', now()->year, $this->next('return'));
    }
}
