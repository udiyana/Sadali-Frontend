<?php

use App\Http\Controllers\Cms\BrandCustomController;
use App\Http\Controllers\Cms\BrandCustomPublicController;
use App\Http\Controllers\Cms\BrandDefinitionController;
use App\Http\Middleware\RequireAcalaDriver;
use App\Http\Middleware\ResolveCmsCompany;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/cms/brands/{company}')->whereNumber('company')->middleware(['auth', 'throttle:cms', ResolveCmsCompany::class])->group(function () {
    Route::middleware(RequireAcalaDriver::class)->group(function () {
        Route::get('{module}', [BrandCustomController::class, 'index'])->whereIn('module', ['content-blocks', 'datasets', 'image-slots']);
        Route::post('{module}', [BrandCustomController::class, 'store'])->whereIn('module', ['content-blocks', 'datasets', 'image-slots']);
        Route::get('{module}/{record}', [BrandCustomController::class, 'show'])->whereIn('module', ['content-blocks', 'datasets', 'image-slots'])->whereNumber('record');
        Route::patch('{module}/{record}', [BrandCustomController::class, 'update'])->whereIn('module', ['content-blocks', 'datasets', 'image-slots'])->whereNumber('record');
        Route::delete('{module}/{record}', [BrandCustomController::class, 'destroy'])->whereIn('module', ['content-blocks', 'datasets', 'image-slots'])->whereNumber('record');
    });
    Route::get('definition', BrandDefinitionController::class)->name('brand-custom.definition');
});
Route::prefix('api/v1/public/brands/{company}')->middleware(['throttle:cms-public', ResolveCmsCompany::class.':public', RequireAcalaDriver::class])->group(function () {
    Route::get('image-slots', [BrandCustomPublicController::class, 'images']);
    Route::get('datasets', [BrandCustomPublicController::class, 'datasets']);
    Route::get('datasets/{key}', [BrandCustomPublicController::class, 'dataset'])->where('key', '[a-z0-9_.-]+');
    Route::get('content/{pageKey}', [BrandCustomPublicController::class, 'page'])->where('pageKey', '[a-z0-9-]+');
});
