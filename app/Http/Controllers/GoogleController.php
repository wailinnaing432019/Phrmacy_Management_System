<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        // Refuse if the email belongs to a staff account.
        if (User::where('email', $googleUser->getEmail())->exists()) {
            return redirect()->route('login')
                ->withErrors(['email' => 'This email belongs to a staff account. Please use the staff login page.']);
        }

        $customer = Customer::withTrashed()->firstOrNew([
            'email' => $googleUser->getEmail(),
        ]);

        if ($customer->trashed()) {
            return redirect()->route('customer.login')
                ->withErrors(['email' => 'This account has been deactivated.']);
        }

        if (! $customer->exists) {
            $customer->password = bcrypt(str()->random(16));
        }

        $customer->name = $googleUser->getName();
        $customer->google_id = $googleUser->getId();
        // Google has already verified this address, so skip the email loop.
        $customer->email_verified_at ??= now();
        $customer->save();

        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.index');
    }
}
