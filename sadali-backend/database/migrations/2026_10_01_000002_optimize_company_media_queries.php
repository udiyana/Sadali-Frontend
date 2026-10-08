<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $t) {
            $t->unsignedInteger('width')->nullable();
            $t->unsignedInteger('height')->nullable();
        });
        foreach (['pages', 'articles'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->index(['company_id', 'image_media_id', 'status', 'published_at'], $table.'_media_public_idx'));
        }
        Schema::table('products', function (Blueprint $t) {
            $t->index(['company_id', 'image_media_id', 'status', 'visible', 'published_at'], 'products_media_public_idx');
            $t->index(['company_id', 'status', 'visible', 'published_at', 'id'], 'products_catalog_idx');
        });
        Schema::table('sections', function (Blueprint $t) {
            $t->index(['company_id', 'image_media_id', 'visible', 'page_id'], 'sections_media_public_idx');
            $t->index(['company_id', 'page_id', 'visible', 'position', 'id'], 'sections_public_order_idx');
        });
    }

    public function down(): void
    {
        Schema::table('media', fn (Blueprint $t) => $t->dropColumn(['width', 'height']));
        foreach (['pages', 'articles'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropIndex($table.'_media_public_idx'));
        }
        Schema::table('products', function (Blueprint $t) {
            $t->dropIndex('products_media_public_idx');
            $t->dropIndex('products_catalog_idx');
        });
        Schema::table('sections', function (Blueprint $t) {
            $t->dropIndex('sections_media_public_idx');
            $t->dropIndex('sections_public_order_idx');
        });
    }
};
