<?php

namespace App\Http\Controllers\Cms;

use App\Cms\BrandDrivers;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandDefinitionController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json(['data' => BrandDrivers::definition($request->attributes->get('cmsCompany'))]);
    }
}
