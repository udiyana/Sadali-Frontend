<?php

namespace App\Http\Controllers\Cms;

use App\Cms\CompanyContext;
use App\Http\Controllers\Controller;
use App\Http\Resources\Cms\BrandCustomCollection;
use App\Models\BrandContentBlock;
use App\Models\Company;
use Illuminate\Http\Request;

class AcalaCompatibilityController extends Controller
{
    public function __invoke(Request $request): BrandCustomCollection
    {
        $request->validate([
            'page' => ['sometimes', 'required', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
            'per_page' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
            'page_number' => ['sometimes', 'required', 'integer', 'min:1'],
        ]);

        $company = Company::query()->publiclyVisible()->where('slug', 'acala')->where('cms_driver', 'acala')->firstOrFail();
        $context = app(CompanyContext::class);
        $previous = $context->id;
        $context->id = $company->id;

        try {
            $query = BrandContentBlock::query()->published();
            if ($request->filled('page')) {
                $query->where('page', $request->input('page'));
            }

            // Explicit source fields: never serialize internal tenant ownership.
            $columns = ['id', 'page', 'section', 'label', 'eyebrow', 'title', 'subtitle', 'body', 'image', 'cta_label', 'cta_url', 'metadata', 'sort_order', 'is_published', 'created_at', 'updated_at'];

            return new BrandCustomCollection($query->orderBy('page')->orderBy('sort_order')->orderBy('section')->paginate($request->integer('per_page', 20), $columns, 'page_number')->withQueryString());
        } finally {
            $context->id = $previous;
        }
    }
}
