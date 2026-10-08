<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PanelController extends Controller
{
    public function show(Request $request, ?string $brandSlug = null): Response
    {
        $user = $request->user();
        $brand = $brandSlug === null ? null : Company::query()->accessibleTo($user)->where('slug', $brandSlug)->firstOrFail();

        return Inertia::render('cms/index', [
            'demo' => false,
            'cmsBrandSlug' => $brand?->slug,
            'cmsBrand' => $brand?->only(['id', 'name', 'slug', 'active', 'status', 'domain', 'logo_url', 'settings', 'cms_driver']),
            'cmsUser' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'is_super_admin' => (bool) $user->is_super_admin],
            'cmsRoles' => (object) $user->companies()->pluck('company_user.role', 'companies.id')->all(),
        ]);
    }

    public function demo(?string $brandSlug = null): Response
    {
        abort_unless($brandSlug === null || in_array($brandSlug, ['nusa-stay', 'sora-kitchen', 'aruna-wellness'], true), 404);

        return Inertia::render('cms/index', [
            'demo' => true,
            'cmsBrandSlug' => $brandSlug,
            'cmsBrand' => null,
            'cmsUser' => ['id' => 0, 'name' => 'Admin demo', 'email' => 'demo@example.test', 'is_super_admin' => true],
            'cmsRoles' => (object) [],
        ]);
    }
}
