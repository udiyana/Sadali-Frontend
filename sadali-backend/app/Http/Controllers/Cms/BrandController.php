<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Http\Requests\Cms\BrandRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\Company;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BrandController extends CompanyController
{
    public function storeBrand(BrandRequest $request): JsonResponse
    {
        $brand = DB::transaction(function () use ($request) {
            $brand = Company::create($request->validated());
            Audit::record('brand.created', $brand);

            return $brand;
        });

        return (new CmsResource($brand->refresh()))->response()->setStatusCode(201);
    }

    public function updateBrand(BrandRequest $request): CmsResource
    {
        $brand = $request->attributes->get('cmsCompany');
        DB::transaction(function () use ($brand, $request) {
            $brand->update($request->validated());
            Audit::record('brand.updated', $brand, array_keys($request->validated()));
        });

        return new CmsResource($brand->refresh());
    }

    public function publicBrand(Request $request): JsonResponse
    {
        return response()->json(['data' => ['brand' => (new CmsResource($request->attributes->get('cmsCompany')))->resolve($request), 'profile' => (new CmsResource(CompanyProfile::firstOrNew()))->resolve($request)]]);
    }
}
