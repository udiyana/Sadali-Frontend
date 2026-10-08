<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\BrandCustomListRequest;
use App\Http\Resources\Cms\BrandCustomCollection;
use App\Models\BrandContentBlock;
use App\Models\BrandDataset;
use App\Models\BrandImageSlot;
use Illuminate\Http\JsonResponse;

class BrandCustomPublicController extends Controller
{
    public function images(BrandCustomListRequest $request): BrandCustomCollection
    {
        $query = BrandImageSlot::query();
        if ($request->filled('group')) {
            $query->where('group', $request->input('group'));
        }
        if ($request->has('keys')) {
            $query->whereIn('key', $request->input('keys', []));
        }

        return new BrandCustomCollection($query->orderBy('id')->paginate($request->integer('per_page', 20), ['key', 'path', 'alt'])->withQueryString());
    }

    public function dataset(BrandCustomListRequest $request, string $company, string $key): JsonResponse
    {
        return response()->json(['data' => json_decode(BrandDataset::query()->published()->where('key', $key)->firstOrFail(['data'])->getRawOriginal('data') ?? 'null')]);
    }

    public function datasets(BrandCustomListRequest $request): BrandCustomCollection
    {
        return new BrandCustomCollection(BrandDataset::query()->published()->orderBy('sort_order')->orderBy('id')->paginate($request->integer('per_page', 20), ['key', 'label', 'description', 'sort_order'])->withQueryString());
    }

    public function page(BrandCustomListRequest $request, string $company, string $pageKey): BrandCustomCollection
    {
        return new BrandCustomCollection(BrandContentBlock::query()->published()->where('page', $pageKey)->orderBy('sort_order')->orderBy('section')->paginate($request->integer('per_page', 20), ['section', 'label', 'eyebrow', 'title', 'subtitle', 'body', 'image', 'cta_label', 'cta_url', 'metadata'])->withQueryString());
    }
}
