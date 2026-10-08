<?php

use App\Http\Controllers\Cms\PanelController;
use Illuminate\Support\Facades\Route;

Route::get('cms/demo', [PanelController::class, 'demo'])->name('cms.demo');
Route::get('cms/demo/{brandSlug}', [PanelController::class, 'demo'])->name('cms.demo.brand');
Route::get('cms', [PanelController::class, 'show'])->middleware('auth')->name('cms.panel');
Route::get('cms/{brandSlug}', [PanelController::class, 'show'])->middleware('auth')->name('cms.brand');
