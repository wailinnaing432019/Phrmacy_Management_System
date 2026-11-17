<?php

namespace App\Http\Controllers\Auth\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CustomerEmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification to the customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $customer = auth('customer')->user();

        if ($customer->hasVerifiedEmail()) {
            return redirect()->route('customer.index');
        }

        $customer->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
