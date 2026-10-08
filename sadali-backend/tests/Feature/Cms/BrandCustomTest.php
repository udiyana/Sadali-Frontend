<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Models\BrandContentBlock;
use App\Models\BrandDataset;
use App\Models\BrandImageSlot;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandCustomTest extends TestCase
{
    use RefreshDatabase;

    private function tenant(string $driver = 'generic', string $slug = 'acala'): Company
    {
        return Company::create(['name' => 'Acala', 'slug' => $slug, 'active' => true, 'status' => 'published', 'cms_driver' => $driver]);
    }

    private function admin(Company $company, string $role = 'company_admin'): User
    {
        $user = User::factory()->create();
        $company->users()->attach($user, ['role' => $role]);

        return $user;
    }

    public function test_admin_creates_reads_updates_and_deletes_acala_content_blocks(): void
    {
        $company = $this->tenant('acala');
        $url = '/api/v1/cms/brands/'.$company->id.'/content-blocks';
        $this->actingAs($this->admin($company));
        $created = $this->postJson($url, ['page' => 'home', 'section' => 'hero', 'title' => 'Welcome', 'body' => 'Original copy', 'metadata' => ['variant' => 'acala'], 'is_published' => true])
            ->assertCreated()->assertJsonPath('data.page', 'home')->assertJsonPath('data.is_published', true);
        $id = $created->json('data.id');
        $this->getJson($url.'/'.$id)->assertOk()->assertJsonPath('data.body', 'Original copy');
        $this->patchJson($url.'/'.$id, ['title' => 'Updated'])->assertOk()->assertJsonPath('data.title', 'Updated');
        $this->getJson($url.'?page_key=home')->assertOk()->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.body')->assertJsonMissingPath('data.0.metadata');
        $this->deleteJson($url.'/'.$id)->assertNoContent();
        $this->getJson($url.'/'.$id)->assertNotFound();
        $this->assertDatabaseHas('activity_logs', ['company_id' => $company->id, 'action' => 'brand-custom.created']);
    }

    private function record(string $class, Company $company, array $data)
    {
        app(CompanyContext::class)->id = $company->id;
        try {
            return $class::create($data);
        } finally {
            app(CompanyContext::class)->id = null;
        }
    }

    public function test_public_page_is_selected_published_scoped_and_paginated(): void
    {
        $company = $this->tenant('acala');
        for ($i = 0; $i < 23; $i++) {
            $this->record(BrandContentBlock::class, $company, ['page' => 'home', 'section' => 'section_'.$i, 'sort_order' => $i, 'title' => 'Section '.$i, 'body' => 'Full copy', 'is_published' => true]);
        }
        $this->record(BrandContentBlock::class, $company, ['page' => 'home', 'section' => 'draft', 'title' => 'DRAFT']);
        $this->record(BrandContentBlock::class, $company, ['page' => 'about', 'section' => 'hero', 'title' => 'OTHER PAGE', 'is_published' => true]);
        $other = $this->tenant('acala', 'other');
        $foreign = $this->record(BrandContentBlock::class, $other, ['page' => 'home', 'section' => 'foreign', 'title' => 'FOREIGN', 'is_published' => true]);
        $url = '/api/v1/public/brands/acala/content/home';
        $this->getJson($url)->assertOk()->assertJsonCount(20, 'data')->assertJsonPath('meta.total', 23)->assertJsonPath('meta.has_more', true)->assertJsonPath('data.0.body', 'Full copy')->assertJsonMissing(['title' => 'DRAFT'])->assertJsonMissing(['title' => 'FOREIGN'])->assertJsonMissing(['title' => 'OTHER PAGE'])->assertJsonMissingPath('data.0.company_id');
        $this->getJson($url.'?page=2')->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('data.0.title', 'Section 20');
        $this->getJson($url.'?per_page=101')->assertUnprocessable();
        $this->getJson($url.'?page=0')->assertUnprocessable();
        $this->actingAs($this->admin($company))->getJson('/api/v1/cms/brands/'.$company->id.'/content-blocks/'.$foreign->id)->assertNotFound();
        $company->update(['active' => false]);
        $this->getJson($url)->assertNotFound();
        $other->update(['cms_driver' => 'generic']);
        $this->getJson('/api/v1/public/brands/other/content/home')->assertNotFound();
        $this->actingAs($this->admin($other))->getJson('/api/v1/cms/brands/'.$other->id.'/content-blocks')->assertNotFound();
    }

    public function test_datasets_crud_preserves_selected_json_without_bulk_payloads(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id.'/datasets';
        $json = ['nested' => ['cards' => [['name' => 'Original', 'enabled' => true]]]];
        $id = $this->postJson($url, ['key' => 'branches', 'label' => 'Cabang', 'data' => $json, 'is_published' => true])->assertCreated()->assertJsonPath('data.data', $json)->json('data.id');
        $this->getJson($url)->assertOk()->assertJsonPath('data.0.key', 'branches')->assertJsonMissingPath('data.0.data');
        $this->getJson($url.'/'.$id)->assertOk()->assertJsonPath('data.data', $json);
        $this->patchJson($url.'/'.$id, ['data' => ['updated' => [1, 2, 3]]])->assertOk();
        $this->postJson($url, ['key' => 'draft', 'label' => 'Draft', 'data' => ['secret' => 'DRAFT']])->assertCreated();
        $this->getJson('/api/v1/public/brands/acala/datasets/branches')->assertOk()->assertExactJson(['data' => ['updated' => [1, 2, 3]]]);
        $this->getJson('/api/v1/public/brands/acala/datasets/draft')->assertNotFound();
        $this->getJson('/api/v1/public/brands/acala/datasets')->assertOk()->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.data');
        $other = $this->tenant('acala', 'other');
        $foreign = $this->record(BrandDataset::class, $other, ['key' => 'foreign', 'label' => 'Foreign', 'data' => ['private' => 'Foreign'], 'is_published' => true]);
        $this->getJson($url.'/'.$foreign->id)->assertNotFound();
        $this->patchJson($url.'/'.$foreign->id, ['label' => 'Intrusion'])->assertNotFound();
        $this->deleteJson($url.'/'.$foreign->id)->assertNotFound();
        $this->getJson('/api/v1/public/brands/acala/datasets/foreign')->assertNotFound();
        $this->deleteJson($url.'/'.$id)->assertNoContent();
    }

    public function test_image_slots_crud_and_filtered_public_paths(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id.'/image-slots';
        $id = $this->postJson($url, ['key' => 'home_hero', 'group' => 'home', 'label' => 'Hero', 'path' => 'https://images.example.com/hero.jpg', 'alt' => 'Acala hero'])->assertCreated()->assertJsonPath('data.path', 'https://images.example.com/hero.jpg')->json('data.id');
        $this->getJson($url.'/'.$id)->assertOk();
        $this->patchJson($url.'/'.$id, ['alt' => 'Updated alt'])->assertOk()->assertJsonPath('data.alt', 'Updated alt');
        $this->postJson($url, ['key' => 'about_hero', 'group' => 'about', 'label' => 'About', 'path' => 'https://images.example.com/about.jpg'])->assertCreated();
        $this->getJson($url)->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.path', 'https://images.example.com/hero.jpg');
        $public = '/api/v1/public/brands/acala/image-slots';
        $this->getJson($public.'?group=home')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.key', 'home_hero')->assertJsonPath('data.0.path', 'https://images.example.com/hero.jpg')->assertJsonMissingPath('data.0.company_id');
        $this->getJson($public.'?keys[]=about_hero')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.key', 'about_hero');
        $other = $this->tenant('acala', 'other');
        $foreign = $this->record(BrandImageSlot::class, $other, ['key' => 'foreign', 'group' => 'home', 'label' => 'Foreign', 'path' => 'https://images.example.com/foreign.jpg']);
        foreach (['get', 'patch', 'delete'] as $method) {
            $this->{$method.'Json'}($url.'/'.$foreign->id)->assertNotFound();
        }
        $this->deleteJson($url.'/'.$id)->assertNoContent();
        $this->actingAs($this->admin($company, 'editor'))->postJson($url, ['key' => 'editor', 'group' => 'home', 'label' => 'Editor', 'path' => 'https://images.example.com/x.jpg'])->assertForbidden();
    }

    public function test_acala_definition_describes_independent_modules_and_page_dependencies(): void
    {
        $company = $this->tenant('acala');
        $definition = $this->actingAs($this->admin($company))->getJson('/api/v1/cms/brands/'.$company->id.'/definition')->assertOk();
        $definition->assertJsonCount(3, 'data.modules')->assertJsonPath('data.modules.1.key', 'datasets')->assertJsonPath('data.modules.2.key', 'image-slots');
        $fields = array_column($definition->json('data.modules.0.fields'), 'key');
        $this->assertContains('page', $fields);
        $this->assertContains('metadata', $fields);
        $this->assertNotContains('page_key', $fields);
        $this->assertContains(['key' => 'data', 'type' => 'json', 'label' => 'Data JSON', 'required' => true, 'max' => 1048576], $definition->json('data.modules.1.fields'));
        $definition->assertJsonCount(15, 'data.datasets');
        $this->assertContains('branches', $definition->json('data.dependencies.home'));
        $this->assertNotContains('site_scripts', array_column($definition->json('data.datasets'), 'key'));
        $this->assertSame(['text', 'textarea', 'number', 'checkbox', 'json'], array_values(array_unique(array_column(array_merge(...array_column($definition->json('data.modules'), 'fields')), 'type'))));
    }

    public function test_executable_dataset_keys_are_unavailable_even_for_admins(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id.'/datasets';
        $payload = ['key' => 'site_scripts', 'label' => 'Scripts', 'data' => ['script' => 'alert(1)'], 'is_published' => true];
        $this->postJson($url, $payload)->assertUnprocessable()->assertJsonValidationErrors('key');
        $legacy = $this->record(BrandDataset::class, $company, $payload);
        $safe = $this->record(BrandDataset::class, $company, ['key' => 'safe', 'label' => 'Safe', 'data' => []]);
        $this->patchJson($url.'/'.$safe->id, ['key' => 'site_scripts'])->assertUnprocessable();
        $this->getJson($url.'/'.$legacy->id)->assertNotFound();
        $this->patchJson($url.'/'.$legacy->id, ['key' => 'renamed'])->assertNotFound();
        $this->deleteJson($url.'/'.$legacy->id)->assertNotFound();
        $this->getJson($url)->assertOk()->assertJsonCount(1, 'data')->assertJsonMissing(['key' => 'site_scripts']);
        $this->getJson('/api/v1/public/brands/acala/datasets/site_scripts')->assertNotFound();
        $this->getJson('/api/v1/public/brands/acala/datasets')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_unique_keys_and_page_section_pairs_are_tenant_scoped_on_partial_updates(): void
    {
        $company = $this->tenant('acala');
        $other = $this->tenant('acala', 'other');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id;
        $block = ['page' => 'home', 'section' => 'hero'];
        $id = $this->postJson($url.'/content-blocks', $block)->assertCreated()->json('data.id');
        $this->postJson($url.'/content-blocks', $block)->assertUnprocessable()->assertJsonValidationErrors('section');
        $about = $this->postJson($url.'/content-blocks', ['page' => 'about', 'section' => 'hero'])->assertCreated()->json('data.id');
        $this->patchJson($url.'/content-blocks/'.$about, ['page' => 'home'])->assertUnprocessable()->assertJsonValidationErrors('section');
        $this->patchJson($url.'/content-blocks/'.$id, ['title' => 'Same key'])->assertOk();
        foreach (['datasets' => ['key' => 'shared', 'label' => 'Shared', 'data' => ['a' => 1]], 'image-slots' => ['key' => 'shared', 'label' => 'Shared', 'group' => 'home', 'path' => 'https://example.com/a.jpg']] as $module => $payload) {
            $row = $this->postJson($url.'/'.$module, $payload)->assertCreated()->json('data.id');
            $this->postJson($url.'/'.$module, $payload)->assertUnprocessable()->assertJsonValidationErrors('key');
            $this->patchJson($url.'/'.$module.'/'.$row, ['label' => 'Same key'])->assertOk();
            $this->actingAs($this->admin($other))->postJson('/api/v1/cms/brands/'.$other->id.'/'.$module, $payload)->assertCreated();
            $this->actingAs($this->admin($company));
        }
        $this->postJson($url.'/content-blocks', ['page' => 'home', 'section' => 'owned', 'company_id' => $other->id])->assertUnprocessable();
    }

    public function test_content_body_utf8_bytes_are_bounded_before_create_and_update(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id.'/content-blocks';
        $tooLarge = str_repeat('漢', 25000);
        $this->postJson($url, ['page' => 'home', 'section' => 'too_large', 'body' => $tooLarge])->assertUnprocessable()->assertJsonValidationErrors('body');
        $this->assertDatabaseMissing('brand_content_blocks', ['company_id' => $company->id, 'section' => 'too_large']);
        $boundary = str_repeat('漢', 21845);
        $this->assertSame(65535, strlen($boundary));
        $id = $this->postJson($url, ['page' => 'home', 'section' => 'boundary', 'body' => $boundary])->assertCreated()->json('data.id');
        $this->patchJson($url.'/'.$id, ['body' => $boundary.'a'])->assertUnprocessable()->assertJsonValidationErrors('body');
        $this->getJson($url.'/'.$id)->assertOk()->assertJsonPath('data.body', $boundary);
        $this->patchJson($url.'/'.$id, ['body' => null])->assertOk()->assertJsonPath('data.body', null);
    }

    public function test_json_payloads_are_bounded_but_remain_opaque_inert_data(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id;
        $deep = ['leaf' => 'x'];
        for ($i = 0; $i < 20; $i++) {
            $deep = ['child' => $deep];
        }
        $this->postJson($url.'/datasets', ['key' => 'deep', 'label' => 'Deep', 'data' => $deep])->assertUnprocessable()->assertJsonValidationErrors('data');
        $this->postJson($url.'/datasets', ['key' => 'big', 'label' => 'Big', 'data' => ['text' => str_repeat('x', 1048577)]])->assertUnprocessable();
        $this->postJson($url.'/content-blocks', ['page' => 'home', 'section' => 'big', 'metadata' => $deep])->assertUnprocessable()->assertJsonValidationErrors('metadata');
        $opaque = ['html' => '<script>alert(1)</script>', 'nested' => ['value' => true]];
        $this->postJson($url.'/datasets', ['key' => 'opaque', 'label' => 'Opaque', 'data' => $opaque, 'is_published' => true])->assertCreated()->assertJsonPath('data.data', $opaque);
        $this->getJson('/api/v1/public/brands/acala/datasets/opaque')->assertOk()->assertExactJson(['data' => $opaque]);
        $this->postJson($url.'/datasets', ['key' => 'empty', 'label' => 'Empty', 'data' => []])->assertCreated()->assertJsonPath('data.data', []);
        $this->postJson($url.'/datasets', ['key' => 'scalar', 'label' => 'Scalar', 'data' => 42, 'is_published' => true])->assertCreated();
        $this->getJson('/api/v1/public/brands/acala/datasets/scalar')->assertOk()->assertExactJson(['data' => 42]);
    }

    public function test_image_and_cta_paths_reject_active_schemes_and_traversal(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id;
        foreach (['javascript:alert(1)', 'data:image/svg+xml,test', '//evil.example/x.jpg', '/../.env', '/%252e%252e/.env', '/missing-image.jpg', 'https://user:password@example.com/a.jpg', '/index.php', 'https://example.com/../private.jpg'] as $path) {
            $this->postJson($url.'/image-slots', ['key' => 'unsafe', 'group' => 'home', 'label' => 'Unsafe', 'path' => $path])->assertUnprocessable()->assertJsonValidationErrors('path');
            $this->postJson($url.'/content-blocks', ['page' => 'home', 'section' => 'unsafe', 'image' => $path])->assertUnprocessable()->assertJsonValidationErrors('image');
        }
        foreach (['javascript:alert(1)', 'data:text/html,test', '//evil.example/path', '/../private'] as $path) {
            $this->postJson($url.'/content-blocks', ['page' => 'home', 'section' => 'unsafe', 'cta_url' => $path])->assertUnprocessable()->assertJsonValidationErrors('cta_url');
        }
        $this->postJson($url.'/content-blocks', ['page' => 'home', 'section' => 'safe', 'image' => 'https://example.com/hero.jpg', 'cta_url' => '/reservation'])->assertCreated();
        $this->postJson($url.'/image-slots', ['key' => 'existing', 'group' => 'home', 'label' => 'Existing', 'path' => '/favicon.ico'])->assertCreated();
    }

    public function test_editors_only_change_draft_records_and_never_publish(): void
    {
        $company = $this->tenant('acala');
        $other = $this->tenant('acala', 'other');
        $this->actingAs($this->admin($company, 'editor'));
        $url = '/api/v1/cms/brands/'.$company->id;
        foreach (['content-blocks' => [BrandContentBlock::class, ['page' => 'home', 'section' => 'hero']], 'datasets' => [BrandDataset::class, ['key' => 'branches', 'label' => 'Branches', 'data' => []]]] as $module => [$model,$payload]) {
            $draft = $this->postJson($url.'/'.$module, $payload)->assertCreated()->assertJsonPath('data.is_published', false)->json('data.id');
            $this->patchJson($url.'/'.$module.'/'.$draft, ['label' => 'Edited draft'])->assertOk();
            $this->patchJson($url.'/'.$module.'/'.$draft, ['is_published' => true])->assertForbidden();
            $this->postJson($url.'/'.$module, array_merge($payload, ['is_published' => true]))->assertForbidden();
            $this->deleteJson($url.'/'.$module.'/'.$draft)->assertNoContent();
            $published = $this->record($model, $company, array_merge($payload, ['is_published' => true]));
            $foreign = $this->record($model, $other, $payload);
            $this->patchJson($url.'/'.$module.'/'.$published->id, ['label' => 'Forbidden'])->assertForbidden();
            $this->patchJson($url.'/'.$module.'/'.$published->id, ['is_published' => false])->assertForbidden();
            $this->deleteJson($url.'/'.$module.'/'.$published->id)->assertForbidden();
            $this->patchJson($url.'/'.$module.'/'.$foreign->id, ['label' => 'Foreign'])->assertNotFound();
            $this->deleteJson($url.'/'.$module.'/'.$foreign->id)->assertNotFound();
        }
        $image = $this->record(BrandImageSlot::class, $company, ['key' => 'hero', 'group' => 'home', 'label' => 'Hero', 'path' => 'https://example.com/a.jpg']);
        $this->patchJson($url.'/image-slots/'.$image->id, ['alt' => 'Live edit'])->assertForbidden();
        $this->deleteJson($url.'/image-slots/'.$image->id)->assertForbidden();
        $this->assertNull(app(CompanyContext::class)->id);
    }

    public function test_all_collection_responses_are_bounded_with_continuation_links(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        for ($i = 0; $i < 22; $i++) {
            $this->record(BrandDataset::class, $company, ['key' => 'row_'.$i, 'label' => 'Row '.$i, 'data' => ['payload' => 'omitted'], 'sort_order' => $i, 'is_published' => true]);
            $this->record(BrandImageSlot::class, $company, ['key' => 'row_'.$i, 'label' => 'Row '.$i, 'group' => 'home', 'path' => 'https://example.com/'.$i.'.jpg']);
        }
        foreach (['/api/v1/cms/brands/'.$company->id.'/datasets', '/api/v1/cms/brands/'.$company->id.'/image-slots', '/api/v1/public/brands/acala/datasets', '/api/v1/public/brands/acala/image-slots'] as $url) {
            $result = $this->getJson($url)->assertOk()->assertJsonCount(20, 'data')->assertJsonPath('meta.total', 22)->assertJsonPath('meta.has_more', true)->assertJsonMissingPath('data.0.data');
            $this->assertNotNull($result->json('links.next'));
            $this->getJson($url.'?page=2')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.has_more', false);
            $this->getJson($url.'?per_page=101')->assertUnprocessable();
        }
        $this->getJson('/api/v1/public/brands/acala/image-slots?keys=invalid')->assertUnprocessable();
    }

    public function test_dataset_null_and_empty_object_roots_are_not_coerced(): void
    {
        $company = $this->tenant('acala');
        $this->actingAs($this->admin($company));
        $url = '/api/v1/cms/brands/'.$company->id.'/datasets';
        $this->postJson($url, ['key' => 'null_root', 'label' => 'Null', 'data' => null, 'is_published' => true])->assertCreated();
        $this->getJson('/api/v1/public/brands/acala/datasets/null_root')->assertOk()->assertExactJson(['data' => null]);
        $this->postJson($url, ['key' => 'object_root', 'label' => 'Object', 'data' => (object) [], 'is_published' => true])->assertCreated();
        $response = $this->getJson('/api/v1/public/brands/acala/datasets/object_root')->assertOk();
        $this->assertSame('{"data":{}}', $response->getContent());
    }

    public function test_definition_is_code_defined_and_tenant_authorized(): void
    {
        $company = $this->tenant();
        $url = '/api/v1/cms/brands/'.$company->id.'/definition';
        $this->getJson($url)->assertUnauthorized();
        $this->actingAs(User::factory()->create())->getJson($url)->assertNotFound();
        $this->actingAs($this->admin($company))->getJson($url)->assertOk()->assertJsonPath('data.driver', 'generic');
        $company->update(['cms_driver' => 'acala']);
        $this->getJson($url)->assertOk()->assertJsonPath('data.driver', 'acala')->assertJsonPath('data.name', 'Acala')
            ->assertJsonPath('data.modules.0.key', 'content-blocks')->assertJsonCount(10, 'data.pages');
        $this->patchJson('/api/v1/cms/brands/'.$company->id, ['cms_driver' => 'arbitrary-script'])->assertUnprocessable();
    }
}
