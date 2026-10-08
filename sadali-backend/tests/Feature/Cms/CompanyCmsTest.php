<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Cms\PublicMedia;
use App\Models\Article;
use App\Models\Company;
use App\Models\Media;
use App\Models\Page;
use App\Models\Product;
use App\Models\Section;
use App\Models\User;
use Database\Seeders\CompanyDemoSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyCmsTest extends TestCase
{
    use RefreshDatabase;

    private Company $a;

    private Company $b;

    private User $admin;

    private User $editor;

    private User $super;

    protected function setUp(): void
    {
        parent::setUp();
        $this->a = Company::create(['name' => 'Usaha A', 'slug' => 'usaha-a', 'active' => true, 'status' => 'published']);
        $this->b = Company::create(['name' => 'Usaha B', 'slug' => 'usaha-b', 'active' => true, 'status' => 'published']);
        $this->admin = User::factory()->create();
        $this->editor = User::factory()->create();
        $this->super = User::factory()->create();
        $this->super->forceFill(['is_super_admin' => true])->save();
        $this->a->users()->attach($this->admin, ['role' => 'company_admin']);
        $this->a->users()->attach($this->editor, ['role' => 'company_editor']);
    }

    private function url(string $path = '', ?Company $company = null): string
    {
        return '/api/v1/cms/companies/'.($company ?? $this->a)->id.($path ? '/'.$path : '');
    }

    private function make(string $model, Company $company, array $data)
    {
        $context = app(CompanyContext::class);
        $context->id = $company->id;
        try {
            return $model::create($data);
        } finally {
            $context->id = null;
        }
    }

    public function test_cms_requires_authentication_and_membership(): void
    {
        $this->getJson($this->url('pages'))->assertUnauthorized();
        $this->actingAs(User::factory()->create())->getJson($this->url('pages'))->assertNotFound();
        $this->actingAs($this->admin)->getJson('/api/v1/cms/companies')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson($this->url('profile', $this->b))->assertNotFound();
    }

    public function test_cross_company_urls_body_and_foreign_keys_are_rejected(): void
    {
        $foreign = $this->make(Page::class, $this->b, ['title' => 'B', 'slug' => 'b']);
        $media = $this->make(Media::class, $this->b, ['disk' => 'cms', 'path' => 'b.png', 'mime' => 'image/png', 'size' => 12]);
        $this->actingAs($this->admin);
        foreach (['pages', 'products', 'articles', 'sections', 'media', 'activity'] as $type) {
            $this->getJson($this->url($type, $this->b))->assertNotFound();
        }
        $this->getJson($this->url('pages/'.$foreign->id))->assertNotFound();
        $this->patchJson($this->url('pages/'.$foreign->id), ['title' => 'Attack'])->assertNotFound();
        $this->deleteJson($this->url('pages/'.$foreign->id))->assertNotFound();
        $this->postJson($this->url('pages'), ['title' => 'X', 'slug' => 'x', 'company_id' => $this->b->id])->assertUnprocessable()->assertJsonValidationErrors('company_id');
        $this->postJson($this->url('pages'), ['title' => 'X', 'slug' => 'x', 'image_media_id' => $media->id])->assertUnprocessable();
        $this->putJson($this->url('profile'), ['logo_media_id' => $media->id])->assertUnprocessable();
        $this->postJson($this->url('sections'), ['page_id' => $foreign->id, 'type' => 'text', 'config' => ['text' => 'X']])->assertUnprocessable();
        $this->getJson($this->url('media/'.$media->id.'/file'))->assertNotFound();
    }

    public function test_global_scope_is_closed_without_context_and_database_rejects_foreign_references(): void
    {
        $page = $this->make(Page::class, $this->b, ['title' => 'B', 'slug' => 'b']);
        $this->assertSame(0, Page::count());
        $context = app(CompanyContext::class);
        $context->id = $this->a->id;
        try {
            $this->expectException(QueryException::class);
            Section::create(['page_id' => $page->id, 'type' => 'text', 'config' => []]);
        } finally {
            $context->id = null;
        }
    }

    public function test_editor_can_crud_drafts_but_cannot_publish_or_change_profile_or_roles(): void
    {
        $this->actingAs($this->editor);
        $id = $this->postJson($this->url('articles'), ['title' => 'Draft', 'slug' => 'draft', 'body' => 'Teks'])->assertCreated()->json('data.id');
        $this->patchJson($this->url('articles/'.$id), ['body' => 'Baru'])->assertOk();
        $this->patchJson($this->url('articles/'.$id), ['status' => 'published'])->assertForbidden();
        $this->patchJson($this->url('articles/'.$id), ['published_at' => now()->addDay()->toISOString()])->assertForbidden();
        $this->putJson($this->url('profile'), ['description' => 'X'])->assertForbidden();
        $this->postJson('/api/v1/cms/users', ['name' => 'X'])->assertForbidden();
        $this->deleteJson($this->url('articles/'.$id))->assertNoContent();
    }

    public function test_main_content_crud_slug_uniqueness_pagination_and_audit(): void
    {
        $this->actingAs($this->admin);
        foreach (['pages', 'products', 'articles'] as $type) {
            $id = $this->postJson($this->url($type), ['title' => 'Item', 'slug' => 'item', 'status' => 'draft'])->assertCreated()->json('data.id');
            $this->getJson($this->url($type.'/'.$id))->assertOk()->assertJsonPath('data.title', 'Item');
            $this->postJson($this->url($type), ['title' => 'Duplicate', 'slug' => 'item'])->assertUnprocessable();
            $this->patchJson($this->url($type.'/'.$id), ['title' => 'Updated', 'status' => 'published'])->assertOk();
            $this->getJson($this->url($type).'?per_page=1')->assertOk()->assertJsonPath('meta.per_page', 1);
            $this->deleteJson($this->url($type.'/'.$id))->assertNoContent();
        }
        $this->getJson($this->url('activity'))->assertOk()->assertJsonCount(9, 'data');
        $this->getJson($this->url('pages').'?per_page=999')->assertUnprocessable();
    }

    public function test_publication_schedule_archive_and_company_visibility(): void
    {
        $article = $this->make(Article::class, $this->a, ['title' => 'Scheduled', 'slug' => 'scheduled', 'status' => 'published', 'published_at' => now()->addDay()]);
        $prefix = '/api/v1/public/companies/usaha-a/articles';
        $this->getJson($prefix)->assertOk()->assertJsonCount(0, 'data');
        $this->getJson($prefix.'/scheduled')->assertNotFound();
        $this->travel(2)->days();
        $this->getJson($prefix.'/scheduled')->assertOk();
        $this->actingAs($this->admin)->patchJson($this->url('articles/'.$article->id), ['status' => 'archived'])->assertOk();
        $this->getJson($prefix.'/scheduled')->assertNotFound();
        $this->a->update(['active' => false]);
        $this->getJson('/api/v1/public/companies/usaha-a')->assertNotFound();
        $this->a->update(['active' => true, 'status' => 'draft']);
        $this->getJson('/api/v1/public/companies/usaha-a')->assertNotFound();
    }

    public function test_safe_profile_theme_and_optional_price_legal_fields(): void
    {
        $this->actingAs($this->admin);
        $this->putJson($this->url('profile'), ['description' => 'UMKM', 'whatsapp' => '6281234567890', 'theme' => ['primary' => '#abcdef', 'font' => 'system', 'template' => 'simple'], 'legal' => ['nib' => 'DEMO']])->assertOk()->assertJsonPath('data.whatsapp_url', 'https://wa.me/6281234567890');
        $this->getJson('/api/v1/public/companies/usaha-a')->assertOk()->assertJsonMissingPath('data.profile.legal');
        foreach ([['theme' => ['font' => 'custom']], ['theme' => ['html' => '<script>bad()</script>']], ['description' => '<img src=x onerror=alert(1)>'], ['social_links' => ['website' => 'javascript:alert(1)']], ['whatsapp' => '081234']] as $data) {
            $this->putJson($this->url('profile'), $data)->assertUnprocessable();
        }
        $this->postJson($this->url('products'), ['title' => 'Gratis', 'slug' => 'gratis'])->assertCreated()->assertJsonPath('data.price', null);
    }

    public function test_sections_cannot_bypass_publication_permissions(): void
    {
        $page = $this->make(Page::class, $this->a, ['title' => 'Home', 'slug' => 'home', 'status' => 'published']);
        $section = $this->make(Section::class, $this->a, ['page_id' => $page->id, 'type' => 'text', 'config' => ['text' => 'Public'], 'visible' => true]);
        $this->actingAs($this->editor)->patchJson($this->url('sections/'.$section->id), ['config' => ['text' => 'Attack']])->assertForbidden();
        $this->deleteJson($this->url('sections/'.$section->id))->assertForbidden();
        $this->postJson($this->url('sections'), ['page_id' => $page->id, 'type' => 'text', 'config' => ['text' => 'X']])->assertForbidden();
        $this->actingAs($this->admin)->patchJson($this->url('sections/'.$section->id), ['visible' => false])->assertOk();
        $this->getJson('/api/v1/public/companies/usaha-a/pages/home/sections')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_editor_cannot_change_or_remove_published_content(): void
    {
        $page = $this->make(Page::class, $this->a, ['title' => 'Published', 'slug' => 'published', 'status' => 'published']);
        $this->actingAs($this->editor)->patchJson($this->url('pages/'.$page->id), ['body' => 'X'])->assertForbidden();
        $this->deleteJson($this->url('pages/'.$page->id))->assertForbidden();
    }

    public function test_private_upload_validation_and_public_media_gating(): void
    {
        Storage::fake('cms');
        $this->actingAs($this->admin);
        // PNG fixture avoids requiring GD in the test runner.
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=');
        $file = UploadedFile::fake()->createWithContent('demo.png', $bytes);
        $id = $this->postJson($this->url('media'), ['file' => $file, 'alt' => 'Demo'])->assertCreated()->assertJsonMissingPath('data.path')->json('data.id');
        $this->get($this->url('media/'.$id.'/file'))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $public = '/api/v1/public/companies/usaha-a/media/'.$id.'/file';
        $this->getJson($public)->assertNotFound();
        $page = $this->postJson($this->url('pages'), ['title' => 'Home', 'slug' => 'home', 'image_media_id' => $id, 'status' => 'published'])->assertCreated()->json('data.id');
        $this->get($public)->assertOk();
        $this->deleteJson($this->url('media/'.$id))->assertConflict();
        $this->patchJson($this->url('pages/'.$page), ['status' => 'draft'])->assertOk();
        $this->getJson($public)->assertNotFound();
        $this->deleteJson($this->url('pages/'.$page))->assertNoContent();
        $this->deleteJson($this->url('media/'.$id))->assertNoContent();
        $this->postJson($this->url('media'), ['file' => UploadedFile::fake()->create('bad.svg', 2, 'image/svg+xml')])->assertUnprocessable();
        $this->postJson($this->url('media'), ['file' => UploadedFile::fake()->create('big.png', 6000, 'image/png')])->assertUnprocessable();
    }

    public function test_central_company_and_user_management_and_quota(): void
    {
        $this->actingAs($this->admin)->postJson('/api/v1/cms/companies', ['name' => 'X', 'slug' => 'x'])->assertForbidden();
        $this->deleteJson($this->url())->assertForbidden();
        $this->actingAs($this->super);
        $id = $this->postJson('/api/v1/cms/companies', ['name' => 'New', 'slug' => 'new', 'feature_limits' => ['pages' => 1]])->assertCreated()->json('data.id');
        $base = '/api/v1/cms/companies/'.$id;
        $this->postJson($base.'/pages', ['title' => 'One', 'slug' => 'one'])->assertCreated();
        $this->postJson($base.'/pages', ['title' => 'Two', 'slug' => 'two'])->assertUnprocessable();
        $user = $this->postJson('/api/v1/cms/users', ['name' => 'Demo', 'email' => 'demo@example.test', 'password' => 'DemoOnly!123456', 'password_confirmation' => 'DemoOnly!123456', 'memberships' => [['company_id' => $id, 'role' => 'company_editor']]])->assertCreated()->json('data.id');
        $this->patchJson('/api/v1/cms/users/'.$user, ['memberships' => []])->assertOk();
        $this->deleteJson('/api/v1/cms/users/'.$user)->assertNoContent();
        $this->patchJson('/api/v1/cms/users/'.$this->super->id, ['is_super_admin' => false])->assertUnprocessable();
        $this->getJson('/api/v1/cms/activity')->assertOk();
        $this->deleteJson($base)->assertNoContent();
        $this->getJson($base)->assertNotFound();
    }

    public function test_demo_seeder_is_repeatable_and_clears_company_context(): void
    {
        $this->seed(CompanyDemoSeeder::class);
        $this->seed(CompanyDemoSeeder::class);
        $this->assertSame(5, Company::count());
        $this->assertNull(app(CompanyContext::class)->id);
        $this->assertSame(15, Page::withoutGlobalScope('company')->count());
    }

    public function test_login_uses_existing_fortify_and_invalid_password_is_rejected(): void
    {
        $user = User::factory()->create(['password' => 'DemoOnly!123456']);
        $this->postJson('/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/login', ['email' => $user->email, 'password' => 'DemoOnly!123456'])->assertOk();
        $this->getJson('/api/v1/cms/companies')->assertOk();
        $this->postJson('/logout')->assertNoContent();
        $this->getJson('/api/v1/cms/companies')->assertUnauthorized();
    }

    public function test_cross_company_resource_operations_and_role_per_membership(): void
    {
        $this->actingAs($this->admin);
        foreach ([Product::class => 'products', Article::class => 'articles'] as $model => $type) {
            $foreign = $this->make($model, $this->b, ['title' => 'Foreign', 'slug' => 'shared']);
            $this->getJson($this->url($type.'/'.$foreign->id))->assertNotFound();
            $this->patchJson($this->url($type.'/'.$foreign->id), ['title' => 'Attack'])->assertNotFound();
            $this->deleteJson($this->url($type.'/'.$foreign->id))->assertNotFound();
            $this->postJson($this->url($type), ['title' => 'Own', 'slug' => 'shared'])->assertCreated();
            $this->postJson($this->url($type, $this->b), ['title' => 'Attack', 'slug' => 'attack'])->assertNotFound();
        }
        $page = $this->make(Page::class, $this->b, ['title' => 'B', 'slug' => 'b']);
        $section = $this->make(Section::class, $this->b, ['page_id' => $page->id, 'type' => 'text', 'config' => ['text' => 'B']]);
        $this->getJson($this->url('sections/'.$section->id))->assertNotFound();
        $this->patchJson($this->url('sections/'.$section->id), ['position' => 2])->assertNotFound();
        $this->deleteJson($this->url('sections/'.$section->id))->assertNotFound();
        $this->b->users()->attach($this->admin, ['role' => 'company_editor']);
        $this->getJson($this->url('pages', $this->b))->assertOk();
        $this->putJson($this->url('profile', $this->b), ['description' => 'X'])->assertForbidden();
        $this->patchJson($this->url('pages/'.$page->id, $this->b), ['status' => 'published'])->assertForbidden();
        $this->getJson('/api/v1/cms/users/'.$this->super->id)->assertForbidden();
    }

    public function test_csrf_is_required_for_cms_mutations(): void
    {
        $this->actingAs($this->admin);
        // Laravel skips CSRF under the testing environment; enable it for this request.
        $this->app['env'] = 'local';
        try {
            $this->postJson($this->url('pages'), ['title' => 'X', 'slug' => 'x'])->assertStatus(419);
            $this->getJson($this->url('pages'))->assertOk();
            $token = str_repeat('x', 40);
            $this->withSession(['_token' => $token])->withHeader('X-CSRF-TOKEN', $token)
                ->postJson($this->url('pages'), ['title' => 'X', 'slug' => 'x'])->assertCreated();
        } finally {
            $this->app['env'] = 'testing';
        }
    }

    public function test_publication_timezone_and_hidden_product_section_media(): void
    {
        $this->actingAs($this->admin);
        $this->postJson($this->url('articles'), [
            'title' => 'UTC', 'slug' => 'utc', 'status' => 'published',
            'published_at' => '2099-10-02T09:00:00+08:00',
        ])->assertCreated()->assertJsonPath('data.published_at', '2099-10-02T01:00:00.000000Z');
        $product = $this->make(Product::class, $this->a, ['title' => 'Hidden', 'slug' => 'hidden', 'status' => 'published', 'visible' => false]);
        $this->getJson('/api/v1/public/companies/usaha-a/products')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/public/companies/usaha-a/products/hidden')->assertNotFound();
        $media = $this->make(Media::class, $this->a, ['disk' => 'cms', 'path' => 'image.png', 'mime' => 'image/png', 'size' => 12]);
        $page = $this->make(Page::class, $this->a, ['title' => 'Draft', 'slug' => 'draft']);
        $this->make(Section::class, $this->a, ['page_id' => $page->id, 'type' => 'gallery', 'config' => ['text' => 'X'], 'image_media_id' => $media->id]);
        $this->getJson('/api/v1/public/companies/usaha-a/pages/draft/sections')->assertNotFound();
        $this->getJson('/api/v1/public/companies/usaha-a/media/'.$media->id.'/file')->assertNotFound();
    }

    public function test_rate_limit_and_console_bootstrap(): void
    {
        $this->artisan('cms:promote', ['email' => $this->admin->email])->assertSuccessful();
        $this->assertTrue($this->admin->refresh()->is_super_admin);
        $this->artisan('cms:promote', ['email' => 'missing@example.test'])->assertFailed();
        RateLimiter::clear('cms-public'.$this->app['request']->ip());
        // Use an isolated IP so prior requests cannot influence this throttle assertion.
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.55']);
        for ($i = 0; $i < 60; $i++) {
            $this->getJson('/api/v1/public/companies/usaha-a')->assertOk();
        }
        $this->getJson('/api/v1/public/companies/usaha-a')->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_cloud_delivery_signs_only_after_access_checks(): void
    {
        config(['filesystems.disks.cloud_test' => ['driver' => 's3', 'visibility' => 'private', 'cms_delivery' => 'temporary_url']]);
        $disk = Storage::fake('cloud_test');
        $calls = [];
        $disk->buildTemporaryUrlsUsing(function ($path, $expires, $options) use (&$calls) {
            $calls[] = [$path, $expires, $options];

            return 'https://objects.example.test/signed-object?signature=demo';
        });
        $media = $this->make(Media::class, $this->a, ['disk' => 'cloud_test', 'path' => 'companies/'.$this->a->id.'/originals/demo.png', 'mime' => 'image/png', 'size' => 12]);
        $public = '/api/v1/public/companies/usaha-a/media/'.$media->id.'/file';
        $this->getJson($public)->assertNotFound();
        $this->actingAs(User::factory()->create())->getJson($this->url('media/'.$media->id.'/file'))->assertNotFound();
        $this->assertCount(0, $calls);
        $this->actingAs($this->admin)->get($this->url('media/'.$media->id.'/file'))
            ->assertRedirect('https://objects.example.test/signed-object?signature=demo')
            ->assertHeader('Cache-Control', 'no-store, private');
        $this->assertCount(1, $calls);
        $this->assertSame('image/png', $calls[0][2]['ResponseContentType']);
        $this->assertEqualsWithDelta(60, $calls[0][1]->getTimestamp() - now()->getTimestamp(), 2);
        $page = $this->make(Page::class, $this->a, ['title' => 'Public', 'slug' => 'public', 'status' => 'published', 'image_media_id' => $media->id]);
        $this->get($public)->assertRedirect();
        $this->patchJson($this->url('pages/'.$page->id), ['status' => 'draft'])->assertOk();
        $this->getJson($public)->assertNotFound();
        $this->assertCount(2, $calls);
    }

    public function test_public_media_visibility_uses_one_scoped_query(): void
    {
        $media = $this->make(Media::class, $this->a, ['disk' => 'cms', 'path' => 'image.png', 'mime' => 'image/png', 'size' => 12]);
        $this->make(Article::class, $this->a, ['title' => 'A', 'slug' => 'a', 'status' => 'published', 'image_media_id' => $media->id]);
        $context = app(CompanyContext::class);
        DB::enableQueryLog();
        try {
            $context->id = $this->a->id;
            DB::flushQueryLog();
            $this->assertTrue(PublicMedia::isVisible($media->id));
            $this->assertCount(1, DB::getQueryLog());
            $context->id = $this->b->id;
            $this->assertFalse(PublicMedia::isVisible($media->id));
            $context->id = null;
            $this->assertFalse(PublicMedia::isVisible($media->id));
        } finally {
            $context->id = null;
            DB::disableQueryLog();
        }
    }

    public function test_list_payloads_are_small_and_details_keep_full_content(): void
    {
        $this->actingAs($this->admin);
        foreach (['pages', 'products', 'articles'] as $type) {
            $id = $this->postJson($this->url($type), ['title' => 'Long', 'slug' => 'long', 'body' => str_repeat('Contoh.', 1000), 'status' => 'published'])->assertCreated()->json('data.id');
            $this->getJson($this->url($type))->assertOk()->assertJsonMissingPath('data.0.body');
            $this->getJson('/api/v1/public/companies/usaha-a/'.$type)->assertOk()->assertJsonMissingPath('data.0.body');
            $this->getJson($this->url($type.'/'.$id))->assertOk()->assertJsonPath('data.body', str_repeat('Contoh.', 1000));
            $this->getJson('/api/v1/public/companies/usaha-a/'.$type.'/long')->assertOk()->assertJsonPath('data.body', str_repeat('Contoh.', 1000));
        }
    }

    public function test_upload_does_not_hold_transaction_and_failed_quota_cleans_file(): void
    {
        $disk = Storage::fake('cms');
        $baseline = DB::transactionLevel();
        $spy = \Mockery::mock(FilesystemAdapter::class);
        $spy->shouldReceive('putFileAs')->andReturnUsing(function ($path, $file, $name, $options) use ($baseline, $disk) {
            $this->assertSame($baseline, DB::transactionLevel());

            return $disk->putFileAs($path, $file, $name, $options);
        });
        $spy->shouldReceive('delete')->andReturnUsing(fn ($path) => $disk->delete($path));
        Storage::set('cms', $spy);
        $this->actingAs($this->admin);
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=');
        $this->postJson($this->url('media'), ['file' => UploadedFile::fake()->createWithContent('demo.png', $bytes)])
            ->assertCreated()->assertJsonPath('data.width', 1)->assertJsonPath('data.height', 1);
        $this->a->update(['feature_limits' => ['media' => 1]]);
        $this->postJson($this->url('media'), ['file' => UploadedFile::fake()->createWithContent('over.png', $bytes)])->assertUnprocessable();
        $this->assertCount(1, $disk->allFiles('companies/'.$this->a->id));
        $this->assertDatabaseCount('media', 1);
    }

    public function test_s3_adapter_generates_https_signed_url_without_cloud_request(): void
    {
        config(['filesystems.disks.cms_cloud' => [
            'driver' => 's3', 'key' => 'demo-key', 'secret' => 'demo-secret',
            'region' => 'auto', 'bucket' => 'cms-demo', 'endpoint' => 'https://objects.example.test',
            'use_path_style_endpoint' => true, 'visibility' => 'private', 'throw' => true,
            'cms_delivery' => 'temporary_url',
        ]]);
        $media = $this->make(Media::class, $this->a, ['disk' => 'cms_cloud', 'path' => 'companies/'.$this->a->id.'/originals/demo.png', 'mime' => 'image/png', 'size' => 12]);
        $response = $this->actingAs($this->admin)->get($this->url('media/'.$media->id.'/file'))->assertRedirect();
        $url = $response->headers->get('Location');
        $this->assertSame('https', parse_url($url, PHP_URL_SCHEME));
        $this->assertSame('objects.example.test', parse_url($url, PHP_URL_HOST));
        parse_str(parse_url($url, PHP_URL_QUERY), $query);
        $this->assertSame('60', $query['X-Amz-Expires']);
        $this->assertArrayHasKey('X-Amz-Signature', $query);
    }
}
