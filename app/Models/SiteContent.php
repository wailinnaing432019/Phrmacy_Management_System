<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * Retrieve all site contents formatted as an associative array.
     */
    public static function getFormattedContents(): array
    {
        return static::query()
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Update or create content for a given key.
     */
    public static function setContent(string $key, array $value): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}
