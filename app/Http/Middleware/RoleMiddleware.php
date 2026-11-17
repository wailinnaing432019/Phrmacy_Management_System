<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            if ($request->expectsJson()) {
                abort(403, 'You do not have permission to access this page.');
            }

            return Inertia::render('error/403Forbidden')
                ->toResponse($request)
                ->setStatusCode(Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
