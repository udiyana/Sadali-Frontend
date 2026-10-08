<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Cms\ContentTypes;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\ContentRequest;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\Company;
use App\Models\CompanyRecord;
use App\Models\Page;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ContentController extends Controller
{
    public function index(ListRequest $request, string $company, string $type): AnonymousResourceCollection
    {
        $query = ContentTypes::model($type)::query();
        if ($type !== 'sections') {
            $query->select(['id', 'company_id', 'title', 'slug', 'status', 'published_at', 'meta_title', 'meta_description', 'image_media_id', 'created_at', 'updated_at']);
            if ($type === 'products') {
                $query->addSelect(['kind', 'category', 'price', 'visible']);
            }
        }
        if ($type !== 'sections' && $request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($type === 'sections' && $request->filled('page_id')) {
            $query->where('page_id', $request->integer('page_id'));
        }
        if ($type !== 'sections' && $request->filled('search')) {
            $query->where('title', 'like', '%'.$request->input('search').'%');
        }

        return CmsResource::collection($query->orderBy($type === 'sections' ? 'position' : 'id')->orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function store(ContentRequest $request, string $company, string $type): JsonResponse
    {
        $model = ContentTypes::model($type);
        $record = DB::transaction(function () use ($request, $model, $type): CompanyRecord {
            $company = $request->attributes->get('cmsCompany');
            // Serialize quota checks for concurrent writers.
            $company = Company::whereKey($company->id)->lockForUpdate()->firstOrFail();
            $limit = $company->feature_limits[$type] ?? null;
            if ($limit !== null && $model::count() >= $limit) {
                throw ValidationException::withMessages(['limit' => 'Batas konten paket telah tercapai.']);
            }
            if ($type === 'sections') {
                $this->authorizePage($request, null);
            }
            $record = $model::create($request->validated());
            Audit::record('content.created', $record, array_keys($request->validated()));

            return $record;
        });

        return (new CmsResource($record->refresh()))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $company, string $type, string $record): CmsResource
    {
        return new CmsResource(ContentTypes::model($type)::findOrFail($record));
    }

    public function update(ContentRequest $request, string $company, string $type, string $record): CmsResource
    {
        $model = ContentTypes::model($type);
        $item = DB::transaction(function () use ($request, $model, $type, $record) {
            $item = $model::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            if ($type === 'sections') { /** @var Section $item */
                $this->authorizePage($request, $item);
            }
            $item->update($request->validated());
            Audit::record('content.updated', $item, array_keys($request->validated()));

            return $item;
        });

        return new CmsResource($item);
    }

    public function destroy(Request $request, string $company, string $type, string $record): Response
    {
        DB::transaction(function () use ($request, $type, $record) {
            Gate::authorize('editContent', $request->attributes->get('cmsCompany'));
            $item = ContentTypes::model($type)::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            if ($type === 'sections') { /** @var Section $item */
                $this->authorizePage($request, $item);
            }
            Audit::record('content.deleted', $item);
            $item->delete();
        });

        return response()->noContent();
    }

    private function authorizeExisting(Request $request, CompanyRecord $item): void
    {
        if ($item->getAttribute('status') === 'published') {
            Gate::authorize('publish', $request->attributes->get('cmsCompany'));
        }
    }

    private function authorizePage(Request $request, ?Section $item): void
    {
        $ids = array_filter([$item?->page_id, $request->input('page_id')]);
        foreach (array_unique($ids) as $id) {
            $page = Page::lockForUpdate()->whereKey((int) $id)->firstOrFail();
            $this->authorizeExisting($request, $page);
        }
    }
}
