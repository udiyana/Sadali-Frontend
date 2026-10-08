<?php

namespace App\Http\Controllers\Cms;

use App\Cms\ContentTypes;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\CompanyProfile;
use App\Models\Page;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicController extends Controller
{
    public function company(Request $request): JsonResponse
    {
        return response()->json(['data' => ['company' => (new CmsResource($request->attributes->get('cmsCompany')))->resolve($request), 'profile' => (new CmsResource(CompanyProfile::firstOrNew()))->resolve($request)]]);
    }

    public function index(ListRequest $request, string $company, string $type): AnonymousResourceCollection
    {
        $query = ContentTypes::model($type)::published();
        if ($type !== 'sections') {
            $query->select(['id', 'company_id', 'title', 'slug', 'status', 'published_at', 'meta_title', 'meta_description', 'image_media_id', 'created_at', 'updated_at']);
            if ($type === 'products') {
                $query->addSelect(['kind', 'category', 'price', 'visible']);
            }
        }
        if ($type === 'products') {
            $query->where('visible', true);
        }

        return CmsResource::collection($query->orderByDesc('published_at')->orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function show(Request $request, string $company, string $type, string $slug): CmsResource
    {
        $query = ContentTypes::model($type)::published();
        if ($type === 'products') {
            $query->where('visible', true);
        }
        $item = $query->where('slug', $slug)->firstOrFail();

        return new CmsResource($item);
    }

    public function sections(ListRequest $request, string $company, string $slug): AnonymousResourceCollection
    {
        $page = Page::published()->where('slug', $slug)->firstOrFail();

        return CmsResource::collection(Section::where('page_id', $page->id)->where('visible', true)->orderBy('position')->orderBy('id')->paginate($request->integer('per_page', 20)));
    }
}
