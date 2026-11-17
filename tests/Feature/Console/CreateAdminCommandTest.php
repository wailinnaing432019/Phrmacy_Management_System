<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('creates a verified administrator', function () {
    $this->artisan('app:create-admin', [
        '--name' => 'Test Admin',
        '--email' => 'admin@example.test',
        '--password' => 'Secret-123',
    ])->assertExitCode(0);

    $user = User::where('email', 'admin@example.test')->firstOrFail();

    expect($user->role)->toBe(User::ROLE_ADMIN)
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->hasVerifiedEmail())->toBeTrue()
        ->and(Hash::check('Secret-123', $user->password))->toBeTrue();
});
