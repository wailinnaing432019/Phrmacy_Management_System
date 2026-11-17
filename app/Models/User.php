<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Concerns\HasActivityLog;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasActivityLog, HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_CASHIER = 'cashier';

    /**
     * The named route a user should land on after login or registration.
     */
    public function homeRouteName(): string
    {
        return match ($this->role) {
            self::ROLE_ADMIN => 'dashboard',
            self::ROLE_CASHIER => 'cashier.pos',
            default => 'dashboard',
        };
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_super_admin',
        'google_id', // Added for Google authentication
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    /**
     * Check if the user is a super administrator.
     */
    public function isSuperAdmin(): bool
    {
        $superAdminEmail = config('auth.super_admin_email', env('SUPER_ADMIN_EMAIL', 'admin@gmail.com'));

        return (bool) $this->is_super_admin
            || $this->email === $superAdminEmail
            || strtolower($this->name) === 'super admin';
    }

    /**
     * Scope a query to only include regular staff (excluding super admins).
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithoutSuperAdmin($query)
    {
        $superAdminEmail = config('auth.super_admin_email', env('SUPER_ADMIN_EMAIL', 'admin@gmail.com'));

        return $query->where('is_super_admin', false)
            ->where('email', '!=', $superAdminEmail)
            ->where('name', '!=', 'Super Admin');
    }
}
