<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('redirects guests away from the dashboard', function () {
    $this->get('/dashboard')->assertRedirect(route('login'));
});

it('lets admins open the dashboard', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/dashboard')
        ->assertOk();
});

it('blocks cashiers from the admin dashboard', function () {
    $this->actingAs(User::factory()->cashier()->create())
        ->get('/dashboard')
        ->assertForbidden();
});

it('blocks customers from the admin dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get('/dashboard')
        ->assertForbidden();
});

it('lets cashiers open the POS', function () {
    $this->actingAs(User::factory()->cashier()->create())
        ->get('/cashier/pos')
        ->assertOk();
});

it('blocks admins from the cashier POS', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/cashier/pos')
        ->assertForbidden();
});

it('lets customers browse the storefront', function () {
    $this->get('/customers')->assertOk();
});

it('blocks unverified users from the dashboard', function () {
    $this->actingAs(User::factory()->admin()->unverified()->create())
        ->get('/dashboard')
        ->assertRedirect(route('verification.notice'));
});
