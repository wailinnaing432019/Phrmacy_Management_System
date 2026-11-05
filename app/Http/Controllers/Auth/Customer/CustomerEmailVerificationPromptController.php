<?php

namespace App\Http\Controllers\Auth\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerEmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt for customers.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $customer = auth('customer')->user();

        return $customer->hasVerifiedEmail()
            ? redirect()->route('customer.index')
            : Inertia::render('auth/verify-email', ['status' => $request->session()->get('status')]);
    }
}
