<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAcalaDriver
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->attributes->get('cmsCompany')->cms_driver === 'acala', 404);

        return $next($request);
    }
}
