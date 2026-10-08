<?php

use App\Http\Controllers\Cms\AcalaCompatibilityController;
use Illuminate\Support\Facades\Route;

Route::get('api/cms/public-contents', AcalaCompatibilityController::class)
    ->middleware('throttle:cms-public')
    ->name('acala-compat.public-contents');
