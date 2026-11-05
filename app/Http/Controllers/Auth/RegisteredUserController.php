<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class RegisteredUserController extends Controller
{
    /**
     * Staff self-registration is disabled; redirect to the customer registration page.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('customer.register');
    }

    /**
     * Staff self-registration is disabled.
     */
    public function store(): RedirectResponse
    {
        return redirect()->route('customer.register');
    }
}
