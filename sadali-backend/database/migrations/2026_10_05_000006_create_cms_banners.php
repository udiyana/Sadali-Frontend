<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_banners', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->unsignedBigInteger('page_id');
            $t->foreign(['company_id', 'page_id'])->references(['company_id', 'id'])->on('pages')->cascadeOnDelete();
            $t->string('image_url', 500);
            $t->string('title', 160)->nullable();
            $t->string('link_url', 500)->nullable();
            $t->unsignedInteger('position')->default(0);
            $t->string('status')->default('draft');
            $t->timestamps();
            $t->index(['company_id', 'page_id', 'status', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_banners');
    }
};
