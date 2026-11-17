<?php

namespace App\Http\Controllers\Auth\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CustomerLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedCustomerSessionController extends Controller
{
    /**
     * Show the customer login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('customers/LoginForm', [
            'canResetPassword' => true,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming customer authentication request.
     */
    public function store(CustomerLoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->route('customer.index');
    }

    /**
     * Destroy an authenticated customer session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('customer')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('customer.index');
    }
}
