<?php

namespace App\Http\Controllers\Auth\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CustomerVerifyEmailController extends Controller
{
    /**
     * Mark the customer's email address as verified.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $customer = $request->user('customer');

        if (! $customer) {
            return redirect()->route('customer.login');
        }

        if (! hash_equals((string) $request->route('id'), (string) $customer->getKey())) {
            throw new AuthorizationException;
        }

        if (! hash_equals((string) $request->route('hash'), sha1($customer->getEmailForVerification()))) {
            throw new AuthorizationException;
        }

        if ($customer->hasVerifiedEmail()) {
            return redirect()->route('customer.index');
        }

        if ($customer->markEmailAsVerified()) {
            event(new Verified($customer));
        }

        return redirect()->route('customer.index');
    }
}
