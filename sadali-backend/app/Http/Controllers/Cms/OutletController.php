<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\OutletListRequest;
use App\Http\Requests\Cms\OutletRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\CmsBanner;
use App\Models\CompanyRecord;
use App\Models\Guest;
use App\Models\Page;
use App\Models\Property;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class OutletController extends Controller
{
    /** @return class-string<CompanyRecord> */
    private function model(string $outletType): string
    {
        return match ($outletType) {
            'properties' => Property::class, 'guests' => Guest::class, 'services' => Service::class, 'banners' => CmsBanner::class, default => abort(404)
        };
    }

    public function index(OutletListRequest $request, string $company, string $outletType): AnonymousResourceCollection
    {
        if ($outletType === 'guests') {
            Gate::authorize('update', $request->attributes->get('cmsCompany'));
        }

        $query = $this->model($outletType)::query();
        if ($outletType === 'banners' && $request->filled('page_id')) {
            $page = Page::findOrFail($request->integer('page_id'));
            $query->where('page_id', $page->getKey())->orderBy('position');
        }

        return CmsResource::collection($query->orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function publicIndex(OutletListRequest $request, string $company, string $outletType): AnonymousResourceCollection
    {
        $query = $this->model($outletType)::query()->where('status', 'published');
        if ($outletType === 'banners') {
            $page = Page::published()->findOrFail($request->integer('page_id'));
            $query->where('page_id', $page->getKey())->orderBy('position');
        }

        return CmsResource::collection($query->orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function show(Request $request, string $company, string $outletType, string $record): CmsResource
    {
        if ($outletType === 'guests') {
            Gate::authorize('update', $request->attributes->get('cmsCompany'));
        }

        return new CmsResource($this->model($outletType)::findOrFail($record));
    }

    public function store(OutletRequest $request, string $company, string $outletType): JsonResponse
    {
        $item = DB::transaction(function () use ($request, $outletType) {
            if ($outletType === 'banners') {
                $this->authorizeBannerPages($request, null);
            } $item = $this->model($outletType)::create($request->validated());
            Audit::record('outlet.created', $item, array_keys($request->validated()));

            return $item;
        });

        return (new CmsResource($item->refresh()))->response()->setStatusCode(201);
    }

    public function update(OutletRequest $request, string $company, string $outletType, string $record): CmsResource
    {
        $item = DB::transaction(function () use ($request, $outletType, $record) {
            $item = $this->model($outletType)::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            if ($outletType === 'banners') {
                $this->authorizeBannerPages($request, $item);
            } $item->update($request->validated());
            Audit::record('outlet.updated', $item, array_keys($request->validated()));

            return $item;
        });

        return new CmsResource($item);
    }

    public function destroy(Request $request, string $company, string $outletType, string $record): Response
    {
        if ($outletType === 'guests') {
            Gate::authorize('update', $request->attributes->get('cmsCompany'));
        } DB::transaction(function () use ($request, $outletType, $record) {
            Gate::authorize('editContent', $request->attributes->get('cmsCompany'));
            $item = $this->model($outletType)::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            if ($outletType === 'banners') {
                $this->authorizeBannerPages($request, $item);
            } Audit::record('outlet.deleted', $item);
            $item->delete();
        });

        return response()->noContent();
    }

    private function authorizeBannerPages(Request $request, ?CompanyRecord $item): void
    {
        $ids = array_filter([$item?->getAttribute('page_id'), $request->input('page_id')]);
        foreach (array_unique($ids) as $id) {
            $page = Page::lockForUpdate()->findOrFail((int) $id);
            $this->authorizeExisting($request, $page);
        }
    }

    private function authorizeExisting(Request $request, CompanyRecord $item): void
    {
        if ($item->getAttribute('status') === 'published') {
            Gate::authorize('publish', $request->attributes->get('cmsCompany'));
        }
    }
}
