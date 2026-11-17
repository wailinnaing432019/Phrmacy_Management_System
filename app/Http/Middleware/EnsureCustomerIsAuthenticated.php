<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerIsAuthenticated
{
    /**
     * Handle an incoming request.
     * Redirects unauthenticated customers to the customer login page,
     * not the default staff login route.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth('customer')->check()) {
            return redirect()->route('customer.login');
        }

        return $next($request);
    }
}
