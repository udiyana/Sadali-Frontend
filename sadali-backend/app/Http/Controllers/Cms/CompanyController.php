<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\CompanyRequest;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Requests\Cms\ProfileRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\Company;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CompanyController extends Controller
{
    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return CmsResource::collection(Company::accessibleTo($request->user())->orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function store(CompanyRequest $request): JsonResponse
    {
        $company = DB::transaction(function () use ($request) {
            $c = Company::create($request->validated());
            Audit::record('company.created', $c);

            return $c;
        });

        return (new CmsResource($company->refresh()))->response()->setStatusCode(201);
    }

    public function show(Request $request): CmsResource
    {
        return new CmsResource($request->attributes->get('cmsCompany'));
    }

    public function update(CompanyRequest $request): CmsResource
    {
        $company = $request->attributes->get('cmsCompany');
        DB::transaction(function () use ($company, $request) {
            $company->update($request->validated());
            Audit::record('company.updated', $company, array_keys($request->validated()));
        });

        return new CmsResource($company->refresh());
    }

    public function destroy(Request $request): Response
    {
        $company = $request->attributes->get('cmsCompany');
        Gate::authorize('delete', $company);
        DB::transaction(function () use ($company) {
            Audit::record('company.deleted', $company);
            $company->delete();
        });

        return response()->noContent();
    }

    public function profile(Request $request): CmsResource
    {
        return new CmsResource(CompanyProfile::firstOrNew());
    }

    public function updateProfile(ProfileRequest $request): JsonResponse
    {
        $profile = DB::transaction(function () use ($request) {
            Company::whereKey($request->attributes->get('cmsCompany')->id)->lockForUpdate()->firstOrFail();
            $p = CompanyProfile::firstOrCreate();
            $p->update($request->validated());
            Audit::record('profile.updated', $p, array_keys($request->validated()));

            return $p;
        });

        return (new CmsResource($profile->refresh()))->response()->setStatusCode(200);
    }
}
