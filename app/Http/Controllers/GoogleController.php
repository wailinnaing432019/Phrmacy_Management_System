<?php

namespace App\Http\Controllers;

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

        $user = User::firstOrNew([
            'email' => $googleUser->getEmail(),
        ]);

        if (! $user->exists) {
            $user->role = User::ROLE_USER;
            $user->password = bcrypt(str()->random(16));
        }

        $user->name = $googleUser->getName();
        $user->google_id = $googleUser->getId();
        // Google has already verified this address, so skip the email loop.
        $user->email_verified_at ??= now();
        $user->save();

        Auth::login($user);

        return redirect()->route($user->homeRouteName());
    }
}
