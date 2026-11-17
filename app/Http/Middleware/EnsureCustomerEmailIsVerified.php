<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerEmailIsVerified
{
    /**
     * Handle an incoming request.
     * Guard-aware email verification check for the customer guard.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $customer = auth('customer')->user();

        if (! $customer?->hasVerifiedEmail()) {
            return redirect()->route('customer.verification.notice');
        }

        return $next($request);
    }
}
