<?php

use App\Http\Controllers\Cms\ActivityController;
use App\Http\Controllers\Cms\BrandController;
use App\Http\Controllers\Cms\CompanyController;
use App\Http\Controllers\Cms\ContentController;
use App\Http\Controllers\Cms\MediaController;
use App\Http\Controllers\Cms\OutletController;
use App\Http\Controllers\Cms\PublicController;
use App\Http\Controllers\Cms\UserController;
use App\Http\Middleware\ResolveCmsCompany;
use Illuminate\Support\Facades\Route;

// Web/session middleware and CSRF are intentionally inherited from routes/web.php.
Route::prefix('api/v1/cms')->middleware(['auth', 'throttle:cms'])->group(function () {
    Route::get('brands', [BrandController::class, 'index']);
    Route::post('brands', [BrandController::class, 'storeBrand']);
    Route::get('companies', [CompanyController::class, 'index']);
    Route::post('companies', [CompanyController::class, 'store']);
    Route::get('activity', [ActivityController::class, 'index']);
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show'])->whereNumber('user');
    Route::patch('users/{user}', [UserController::class, 'update'])->whereNumber('user');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->whereNumber('user');
    foreach (['companies', 'brands'] as $tenantAlias) {
        Route::prefix($tenantAlias.'/{company}')->whereNumber('company')->middleware(ResolveCmsCompany::class)->group(function () use ($tenantAlias) {
            Route::get('/', [CompanyController::class, 'show']);
            Route::patch('/', [$tenantAlias === 'brands' ? BrandController::class : CompanyController::class, $tenantAlias === 'brands' ? 'updateBrand' : 'update']);
            Route::delete('/', [CompanyController::class, 'destroy']);
            Route::get('profile', [CompanyController::class, 'profile']);
            Route::put('profile', [CompanyController::class, 'updateProfile']);
            Route::get('activity', [ActivityController::class, 'index']);
            Route::get('media', [MediaController::class, 'index']);
            Route::post('media', [MediaController::class, 'store']);
            Route::get('media/{media}/file', [MediaController::class, 'file'])->whereNumber('media');
            Route::delete('media/{media}', [MediaController::class, 'destroy'])->whereNumber('media');
            Route::get('{outletType}', [OutletController::class, 'index'])->whereIn('outletType', ['properties', 'guests', 'services', 'banners']);
            Route::post('{outletType}', [OutletController::class, 'store'])->whereIn('outletType', ['properties', 'guests', 'services', 'banners']);
            Route::get('{outletType}/{record}', [OutletController::class, 'show'])->whereIn('outletType', ['properties', 'guests', 'services', 'banners'])->whereNumber('record');
            Route::patch('{outletType}/{record}', [OutletController::class, 'update'])->whereIn('outletType', ['properties', 'guests', 'services', 'banners'])->whereNumber('record');
            Route::delete('{outletType}/{record}', [OutletController::class, 'destroy'])->whereIn('outletType', ['properties', 'guests', 'services', 'banners'])->whereNumber('record');
            Route::get('{type}', [ContentController::class, 'index'])->whereIn('type', ['pages', 'products', 'articles', 'sections']);
            Route::post('{type}', [ContentController::class, 'store'])->whereIn('type', ['pages', 'products', 'articles', 'sections']);
            Route::get('{type}/{record}', [ContentController::class, 'show'])->whereIn('type', ['pages', 'products', 'articles', 'sections'])->whereNumber('record');
            Route::patch('{type}/{record}', [ContentController::class, 'update'])->whereIn('type', ['pages', 'products', 'articles', 'sections'])->whereNumber('record');
            Route::delete('{type}/{record}', [ContentController::class, 'destroy'])->whereIn('type', ['pages', 'products', 'articles', 'sections'])->whereNumber('record');
        });
    }
});
foreach (['companies', 'brands'] as $tenantAlias) {
    Route::prefix('api/v1/public/'.$tenantAlias.'/{company}')->middleware(['throttle:cms-public', ResolveCmsCompany::class.':public'])->group(function () use ($tenantAlias) {
        Route::get('/', [$tenantAlias === 'brands' ? BrandController::class : PublicController::class, $tenantAlias === 'brands' ? 'publicBrand' : 'company']);
        Route::get('media/{media}/file', [MediaController::class, 'file'])->whereNumber('media');
        Route::get('pages/{slug}/sections', [PublicController::class, 'sections']);
        Route::get('{outletType}', [OutletController::class, 'publicIndex'])->whereIn('outletType', ['properties', 'services', 'banners']);
        Route::get('{type}', [PublicController::class, 'index'])->whereIn('type', ['pages', 'products', 'articles']);
        Route::get('{type}/{slug}', [PublicController::class, 'show'])->whereIn('type', ['pages', 'products', 'articles']);
    });
}
