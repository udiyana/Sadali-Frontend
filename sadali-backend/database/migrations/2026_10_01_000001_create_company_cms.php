<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->boolean('is_super_admin')->default(false);
        });
        Schema::create('companies', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->boolean('active')->default(false);
            $t->string('status')->default('draft');
            $t->string('plan_key')->default('starter');
            $t->json('feature_limits')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('company_user', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('role');
            $t->timestamps();
            $t->unique(['company_id', 'user_id']);
        });
        Schema::create('media', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->string('disk');
            $t->string('path');
            $t->string('mime');
            $t->unsignedBigInteger('size');
            $t->string('alt')->nullable();
            $t->timestamps();
            $t->unique(['company_id', 'id']);
        });
        Schema::create('company_profiles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->unique()->constrained()->cascadeOnDelete();
            $t->text('description')->nullable();
            $t->text('address')->nullable();
            $t->string('email')->nullable();
            $t->string('phone', 30)->nullable();
            $t->string('whatsapp', 20)->nullable();
            $t->json('opening_hours')->nullable();
            $t->json('social_links')->nullable();
            $t->json('legal')->nullable();
            $t->json('theme')->nullable();
            $t->string('meta_title', 160)->nullable();
            $t->string('meta_description', 320)->nullable();
            foreach (['logo', 'cover', 'share'] as $key) {
                $t->unsignedBigInteger($key.'_media_id')->nullable();
                $t->foreign(['company_id', $key.'_media_id'])->references(['company_id', 'id'])->on('media')->restrictOnDelete();
            }
            $t->timestamps();
        });
        foreach (['pages', 'products', 'articles'] as $name) {
            Schema::create($name, function (Blueprint $t) use ($name) {
                $t->id();
                $t->foreignId('company_id')->constrained()->cascadeOnDelete();
                $t->string('title');
                $t->string('slug');
                $t->longText('body')->nullable();
                $t->string('status')->default('draft');
                $t->dateTime('published_at')->nullable();
                $t->string('meta_title', 160)->nullable();
                $t->string('meta_description', 320)->nullable();
                $t->unsignedBigInteger('image_media_id')->nullable();
                $t->foreign(['company_id', 'image_media_id'])->references(['company_id', 'id'])->on('media')->restrictOnDelete();
                if ($name === 'products') {
                    $t->string('kind')->default('product');
                    $t->string('category')->nullable();
                    $t->decimal('price', 15, 2)->nullable();
                    $t->boolean('visible')->default(true);
                }
                $t->timestamps();
                $t->unique(['company_id', 'slug']);
                $t->unique(['company_id', 'id']);
                $t->index(['company_id', 'status', 'published_at']);
            });
        }
        Schema::create('sections', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->unsignedBigInteger('page_id');
            $t->foreign(['company_id', 'page_id'])->references(['company_id', 'id'])->on('pages')->cascadeOnDelete();
            $t->string('type');
            $t->unsignedInteger('position')->default(0);
            $t->boolean('visible')->default(true);
            $t->json('config');
            $t->unsignedBigInteger('image_media_id')->nullable();
            $t->foreign(['company_id', 'image_media_id'])->references(['company_id', 'id'])->on('media')->restrictOnDelete();
            $t->timestamps();
            $t->index(['company_id', 'page_id', 'position']);
        });
        Schema::create('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('action');
            $t->string('subject_type');
            $t->unsignedBigInteger('subject_id')->nullable();
            $t->json('changes')->nullable();
            $t->timestamps();
            $t->index(['company_id', 'created_at']);
        });
    }

    public function down(): void
    {
        foreach (['activity_logs', 'sections', 'articles', 'products', 'pages', 'company_profiles', 'media', 'company_user', 'companies'] as $name) {
            Schema::dropIfExists($name);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('is_super_admin'));
    }
};
