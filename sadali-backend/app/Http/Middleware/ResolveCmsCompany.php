<?php

namespace App\Http\Middleware;

use App\Cms\CompanyContext;
use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveCmsCompany
{
    public function handle(Request $request, Closure $next, string $mode = 'cms'): Response
    {
        $context = app(CompanyContext::class);
        try {
            $query = Company::query();
            $company = $mode === 'public'
             ? $query->publiclyVisible()->where('slug', $request->route('company'))->firstOrFail()
             : $query->accessibleTo($request->user())->whereKey((int) $request->route('company'))->firstOrFail();
            $context->id = $company->id;
            $request->attributes->set('cmsCompany', $company);

            return $next($request);
        } finally {
            $context->id = null;
        }
    }
}
