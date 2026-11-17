<?php

use App\Http\Middleware\EnsureCustomerEmailIsVerified;
use App\Http\Middleware\EnsureCustomerIsAuthenticated;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'customer' => EnsureCustomerIsAuthenticated::class,
            'customer.verified' => EnsureCustomerEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // 1. All API endpoints (/api/*) must ALWAYS render clean JSON error responses, never HTML
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // 2. Inertia web requests render clean Inertia Error page instead of Inertia modal iframe
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if ($request->header('X-Inertia') && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                if (! config('app.debug') || ! app()->environment(['local', 'testing'])) {
                    return Inertia::render('error/Error', [
                        'status' => $response->getStatusCode(),
                    ])
                        ->toResponse($request)
                        ->setStatusCode($response->getStatusCode());
                }
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'error' => 'Your session has expired. Please try again.',
                ]);
            }

            return $response;
        });
    })->create();
