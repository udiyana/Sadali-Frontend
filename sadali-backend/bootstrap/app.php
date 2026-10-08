<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetTeamUrlDefaults;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetTeamUrlDefaults::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/v1/*')) {
                return null;
            }
            $status = match (true) {
                $e instanceof ValidationException => 422,
                $e instanceof AuthenticationException => 401,
                $e instanceof AuthorizationException => 403,
                $e instanceof ModelNotFoundException => 404,
                $e instanceof HttpExceptionInterface => $e->getStatusCode(),
                default => 500,
            };
            $message = match ($status) {
                401 => 'Silakan masuk untuk melanjutkan.', 403 => 'Anda tidak memiliki hak akses.',
                404 => 'Data tidak ditemukan.', 419 => 'Sesi kedaluwarsa. Muat ulang halaman.',
                422 => 'Periksa kembali data yang diisi.', 429 => 'Terlalu banyak permintaan. Coba lagi nanti.',
                409 => 'Data masih digunakan oleh konten.', default => 'Permintaan tidak dapat diproses.',
            };
            $headers = $e instanceof HttpExceptionInterface ? $e->getHeaders() : [];

            return response()->json(['message' => $message, 'errors' => $e instanceof ValidationException ? $e->errors() : (object) []], $status, $headers);
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
