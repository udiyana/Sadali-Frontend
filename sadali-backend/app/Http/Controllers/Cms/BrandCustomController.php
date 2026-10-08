<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Cms\BrandCustomModules;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\BrandCustomListRequest;
use App\Http\Requests\Cms\BrandCustomRequest;
use App\Http\Resources\Cms\BrandCustomCollection;
use App\Models\BrandImageSlot;
use App\Models\CompanyRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class BrandCustomController extends Controller
{
    public function index(BrandCustomListRequest $request, string $company, string $module): BrandCustomCollection
    {
        $query = BrandCustomModules::model($module)::query()->select(BrandCustomModules::summaryColumns($module));
        if ($module === 'image-slots' && $request->filled('group')) {
            $query->where('group', $request->input('group'));
        }
        if ($module === 'content-blocks' && $request->filled('page_key')) {
            $query->where('page', $request->input('page_key'));
        }

        return new BrandCustomCollection($query->orderBy($module === 'image-slots' ? 'id' : 'sort_order')->orderBy('id')->paginate($request->integer('per_page', 20))->withQueryString());
    }

    public function show(Request $request, string $company, string $module, string $record): JsonResponse
    {
        return response()->json(['data' => BrandCustomModules::model($module)::findOrFail($record)]);
    }

    public function store(BrandCustomRequest $request, string $company, string $module): JsonResponse
    {
        $item = DB::transaction(function () use ($request, $module) {
            $item = BrandCustomModules::model($module)::create($request->validated());
            Audit::record('brand-custom.created', $item, array_keys($request->validated()));

            return $item;
        });

        return response()->json(['data' => $item->refresh()], 201);
    }

    public function update(BrandCustomRequest $request, string $company, string $module, string $record): JsonResponse
    {
        $item = DB::transaction(function () use ($request, $module, $record) {
            $item = BrandCustomModules::model($module)::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            $item->update($request->validated());
            Audit::record('brand-custom.updated', $item, array_keys($request->validated()));

            return $item;
        });

        return response()->json(['data' => $item]);
    }

    public function destroy(Request $request, string $company, string $module, string $record): Response
    {
        DB::transaction(function () use ($request, $module, $record) {
            Gate::authorize('editContent', $request->attributes->get('cmsCompany'));
            $item = BrandCustomModules::model($module)::lockForUpdate()->findOrFail($record);
            $this->authorizeExisting($request, $item);
            Audit::record('brand-custom.deleted', $item);
            $item->delete();
        });

        return response()->noContent();
    }

    private function authorizeExisting(Request $request, CompanyRecord $item): void
    {
        if ($item instanceof BrandImageSlot || $item->getAttribute('is_published')) {
            Gate::authorize('publish', $request->attributes->get('cmsCompany'));
        }
    }
}
