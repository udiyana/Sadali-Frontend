<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\ActivityLog;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityController extends Controller
{
    public function index(ListRequest $request): AnonymousResourceCollection
    {
        $query = ActivityLog::query();
        if (! $request->attributes->get('cmsCompany')) {
            abort_unless($request->user()->is_super_admin, 403);
            $query->withoutGlobalScope('company');
        }

        return CmsResource::collection($query->orderByDesc('id')->paginate($request->integer('per_page', 20)));
    }
}
