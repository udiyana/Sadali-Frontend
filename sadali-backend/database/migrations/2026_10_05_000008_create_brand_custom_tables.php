<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL DDL is not transactional: resume without dropping existing data.
        if (! Schema::hasTable('brand_content_blocks')) {
            Schema::create('brand_content_blocks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->string('page', 80);
                $table->string('section', 80);
                foreach (['label' => 120, 'eyebrow' => 160, 'title' => 255, 'subtitle' => 1000, 'image' => 500, 'cta_label' => 160, 'cta_url' => 500] as $key => $length) {
                    $table->string($key, $length)->nullable();
                }
                $table->text('body')->nullable();
                $table->json('metadata')->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_published')->default(false);
                $table->timestamps();
                $table->unique(['company_id', 'page', 'section']);
            });
        }
        if (! Schema::hasIndex('brand_content_blocks', 'brand_blocks_page_public_order_idx')) {
            Schema::table('brand_content_blocks', function (Blueprint $table) {
                $table->index(['company_id', 'page', 'is_published', 'sort_order'], 'brand_blocks_page_public_order_idx');
            });
        }
        if (! Schema::hasTable('brand_datasets')) {
            Schema::create('brand_datasets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->string('key', 100);
                $table->string('label', 160);
                $table->string('description', 1000)->nullable();
                $table->json('data')->nullable();
                $table->unsignedInteger('sort_order')->default(0);
                $table->boolean('is_published')->default(false);
                $table->timestamps();
                $table->unique(['company_id', 'key']);
                $table->index(['company_id', 'is_published', 'sort_order']);
            });
        }
        if (! Schema::hasTable('brand_image_slots')) {
            Schema::create('brand_image_slots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->string('key', 100);
                $table->string('group', 100);
                $table->string('label', 160);
                $table->string('path', 500);
                $table->string('alt', 500)->nullable();
                $table->timestamps();
                $table->unique(['company_id', 'key']);
                $table->index(['company_id', 'group']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_image_slots');
        Schema::dropIfExists('brand_datasets');
        Schema::dropIfExists('brand_content_blocks');
    }
};
