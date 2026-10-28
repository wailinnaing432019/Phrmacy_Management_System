<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_change_user_role_to_cashier(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($admin)->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'cashier',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('cashier', $user->fresh()->role);
    }

    public function test_admin_can_change_user_role_to_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($admin)->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'admin',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('admin', $user->fresh()->role);
    }

    public function test_invalid_role_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($admin)->put("/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'superadmin',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertSame('user', $user->fresh()->role);
    }

    public function test_changing_another_admin_password_keeps_current_admin_logged_in(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherAdmin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->put("/users/{$otherAdmin->id}", [
            'name' => $otherAdmin->name,
            'email' => $otherAdmin->email,
            'role' => 'admin',
            'password' => 'new-password',
        ]);

        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_changing_own_role_is_logged_out(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->put("/users/{$admin->id}", [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'cashier',
            ])
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertSame('cashier', $admin->fresh()->role);
    }
}
