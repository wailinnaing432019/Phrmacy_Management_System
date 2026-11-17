<?php

use App\Mail\ContactConfirmation;
use App\Mail\ContactMessage;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeSecuritySale(User $cashier, string $invoiceNo, float $total): Sale
{
    return Sale::create([
        'invoice_no' => $invoiceNo,
        'sale_by' => $cashier->id,
        'total' => $total,
        'received_amount' => $total,
        'refund_amount' => 0,
    ]);
}

it('requires staff authentication to render barcode images', function () {
    $this->get('/barcode/MED123456')->assertRedirect(route('login'));

    $customer = User::factory()->create();
    $this->actingAs($customer)->get('/barcode/MED123456')->assertForbidden();

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)
        ->get('/barcode/MED123456')
        ->assertOk()
        ->assertHeader('content-type', 'image/png');
});

it('rejects oversized or malformed barcode codes', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/barcode/'.str_repeat('A', 65))
        ->assertNotFound();

    $this->actingAs($admin)
        ->get('/barcode/MED%20123')
        ->assertNotFound();
});

it('ignores sort columns that are not whitelisted', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();

    $this->actingAs($admin)
        ->get('/sales?col=not_a_column&dir=sideways')
        ->assertOk();

    $this->actingAs($admin)
        ->get('/sales?col=total&dir=asc')
        ->assertOk();

    $this->actingAs($cashier)
        ->get('/cashier/sale?col=not_a_column&dir=sideways')
        ->assertOk();
});

it('does not let a cashier search other cashiers sales', function () {
    $cashierA = User::factory()->cashier()->create();
    $cashierB = User::factory()->cashier()->create();

    makeSecuritySale($cashierA, 'INV-2026-000001', 100);
    makeSecuritySale($cashierB, 'INV-2026-000002', 999);

    $this->actingAs($cashierA)
        ->get('/cashier/sale?search=999')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('sales.data', 0));

    $this->actingAs($cashierA)
        ->get('/cashier/sale?search=INV-2026-000001')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('sales.data', 1));
});

it('keeps cashiers from opening another cashiers sale or invoice', function () {
    $cashierA = User::factory()->cashier()->create();
    $cashierB = User::factory()->cashier()->create();
    $sale = makeSecuritySale($cashierA, 'INV-2026-000003', 250);

    $this->actingAs($cashierB)
        ->get("/cashier/sale/{$sale->id}")
        ->assertForbidden();

    $this->actingAs($cashierB)
        ->get("/cashier/pos/invoice/{$sale->id}")
        ->assertForbidden();

    $this->actingAs($cashierA)
        ->get("/cashier/sale/{$sale->id}")
        ->assertOk();

    $this->actingAs($cashierA)
        ->get("/cashier/pos/invoice/{$sale->id}")
        ->assertOk();

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)
        ->get("/pos/invoice/{$sale->id}")
        ->assertOk();
});

it('validates POS barcode lookups', function () {
    $cashier = User::factory()->cashier()->create();
    $medicine = Medicine::factory()->create(['medicine_barcode' => 'MED123456']);

    $this->actingAs($cashier)
        ->get('/cashier/pos/lookup/MED123456')
        ->assertOk()
        ->assertJsonPath('id', $medicine->id)
        ->assertJsonPath('medicine_barcode', 'MED123456')
        ->assertJsonPath('available_qty', $medicine->qty);

    $this->actingAs($cashier)
        ->get('/cashier/pos/lookup/'.str_repeat('A', 65))
        ->assertNotFound();
});

it('routes contact messages to the configured address', function () {
    Mail::fake();
    config(['mail.contact_address' => 'security@example.test']);

    $this->post('/customers/contact', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'customer@example.test',
        'subject' => 'Hello',
        'user_message' => 'Testing the contact form.',
    ])->assertRedirect();

    Mail::assertSent(ContactMessage::class, fn (ContactMessage $mail) => $mail->hasTo('security@example.test')
        && str_contains($mail->render(), 'Testing the contact form.'));
    Mail::assertSent(ContactConfirmation::class, fn (ContactConfirmation $mail) => $mail->hasTo('customer@example.test')
        && str_contains($mail->render(), 'Hello Test'));
});

it('rejects newlines in the contact subject', function () {
    $this->post('/customers/contact', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'customer@example.test',
        'subject' => "Hello\r\nBcc: attacker@example.test",
        'user_message' => 'Testing header injection.',
    ])->assertSessionHasErrors('subject');
});

it('rate limits the public contact form', function () {
    Mail::fake();

    $payload = [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'customer@example.test',
        'subject' => 'Hello',
        'user_message' => 'Testing the contact form.',
    ];

    foreach (range(1, 5) as $attempt) {
        $this->post('/customers/contact', $payload)->assertRedirect();
    }

    $this->post('/customers/contact', $payload)->assertStatus(429);
});
