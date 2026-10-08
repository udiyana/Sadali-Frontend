<?php

use App\Http\Controllers\Cms\PageDeliveryController;
use App\Http\Middleware\ResolveCmsCompany;
use Illuminate\Support\Facades\Route;

foreach (['companies', 'brands'] as $tenantPath) {
    Route::prefix('api/v1/cms/'.$tenantPath.'/{company}')->whereNumber('company')
        ->middleware(['auth', 'throttle:cms', ResolveCmsCompany::class])
        ->group(function () {
            Route::get('pages/{record}/editor', [PageDeliveryController::class, 'editor'])->whereNumber('record');
        });
    Route::prefix('api/v1/public/'.$tenantPath.'/{company}')
        ->middleware(['throttle:cms-public', ResolveCmsCompany::class.':public'])
        ->group(function () {
            Route::get('pages/{slug}/render', [PageDeliveryController::class, 'render']);
        });
}
