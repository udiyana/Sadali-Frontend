<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\Cms\CmsResource;
use App\Models\CompanyProfile;
use App\Models\Page;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageDeliveryController extends Controller
{
    public function editor(Request $request, string $company, string $record): JsonResponse
    {
        $request->validate(['per_page' => 'sometimes|integer|min:1|max:100', 'page' => 'sometimes|integer|min:1']);
        $page = Page::findOrFail($record);
        $sections = Section::where('page_id', $page->id)->orderBy('position')->orderBy('id')
            ->paginate($request->integer('per_page', 24));

        return response()->json(['data' => [
            'page' => (new CmsResource($page))->resolve($request),
            'sections' => CmsResource::collection($sections->getCollection())->resolve($request),
        ], 'meta' => [
            'current_page' => $sections->currentPage(), 'per_page' => $sections->perPage(),
            'total' => $sections->total(), 'last_page' => $sections->lastPage(), 'has_more' => $sections->hasMorePages(),
        ], 'links' => [
            'next' => $sections->withQueryString()->nextPageUrl(), 'prev' => $sections->previousPageUrl(),
        ]]);
    }

    public function render(Request $request, string $company, string $slug): JsonResponse
    {
        $request->validate(['per_page' => 'sometimes|integer|min:1|max:100', 'page' => 'sometimes|integer|min:1']);
        $page = Page::published()->where('slug', $slug)->firstOrFail();
        $sections = Section::where('page_id', $page->id)->where('visible', true)
            ->orderBy('position')->orderBy('id')->paginate($request->integer('per_page', 24));

        return response()->json(['data' => [
            'company' => (new CmsResource($request->attributes->get('cmsCompany')))->resolve($request),
            'profile' => (new CmsResource(CompanyProfile::firstOrNew()))->resolve($request),
            'page' => (new CmsResource($page))->resolve($request),
            'sections' => CmsResource::collection($sections->getCollection())->resolve($request),
        ], 'meta' => [
            'current_page' => $sections->currentPage(), 'per_page' => $sections->perPage(),
            'total' => $sections->total(), 'last_page' => $sections->lastPage(),
            'has_more' => $sections->hasMorePages(),
        ], 'links' => [
            'next' => $sections->withQueryString()->nextPageUrl(),
            'prev' => $sections->previousPageUrl(),
        ]]);
    }
}
