<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Models\CmsBanner;
use App\Models\Company;
use App\Models\Guest;
use App\Models\Page;
use App\Models\Property;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\BrandDemoSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandOutletTest extends TestCase
{
    use RefreshDatabase;

    private Company $brand;

    private User $admin;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->brand = Company::create(['name' => 'Brand', 'slug' => 'brand', 'active' => true, 'status' => 'published']);
        $this->admin = User::factory()->create();
        $this->editor = User::factory()->create();
        $this->brand->users()->attach($this->admin, ['role' => 'company_admin']);
        $this->brand->users()->attach($this->editor, ['role' => 'company_editor']);
    }

    private function cms(string $path = ''): string
    {
        return '/api/v1/cms/brands/'.$this->brand->id.($path ? '/'.$path : '');
    }

    public function test_brand_metadata_validation_and_permissions_regression(): void
    {
        $this->actingAs($this->admin);
        foreach (['https://example.com', 'example.com/path', 'example.com:443', '*.example.com', 'bad_host.com'] as $domain) {
            $this->patchJson($this->cms(), ['domain' => $domain])->assertUnprocessable();
        }
        foreach ([['settings' => ['html' => 'code']], ['settings' => ['primary' => 'red']], ['settings' => ['font' => 'custom']], ['logo_url' => 'http://example.com/a.png']] as $payload) {
            $this->patchJson($this->cms(), $payload)->assertUnprocessable();
        }
        Company::create(['name' => 'Other', 'slug' => 'other', 'domain' => 'taken.example.com']);
        $this->patchJson($this->cms(), ['domain' => 'TAKEN.EXAMPLE.COM'])->assertUnprocessable();
        $this->postJson('/api/v1/cms/brands', ['name' => 'Forbidden', 'slug' => 'forbidden'])->assertForbidden();
        $this->actingAs($this->editor)->patchJson($this->cms(), ['settings' => ['font' => 'system']])->assertForbidden();
        $super = User::factory()->create();
        $super->forceFill(['is_super_admin' => true])->save();
        $this->actingAs($super)->postJson('/api/v1/cms/brands', ['name' => 'New', 'slug' => 'new', 'domain' => 'NEW.EXAMPLE.COM'])->assertCreated()->assertJsonPath('data.domain', 'new.example.com');
    }

    public function test_outlet_records_reject_cross_tenant_access_and_injected_ownership(): void
    {
        $other = Company::create(['name' => 'Other', 'slug' => 'other']);
        app(CompanyContext::class)->id = $other->id;
        $page = Page::create(['title' => 'Other', 'slug' => 'other']);
        $records = [
            'properties' => Property::create(['name' => 'Other']),
            'services' => Service::create(['name' => 'Other']),
            'guests' => Guest::create(['first_name' => 'Secret']),
            'banners' => CmsBanner::create(['page_id' => $page->id, 'image_url' => 'https://example.com/a.png']),
        ];
        app(CompanyContext::class)->id = null;
        $this->actingAs($this->admin);
        foreach ($records as $type => $item) {
            $this->getJson($this->cms($type.'/'.$item->id))->assertNotFound();
            $this->patchJson($this->cms($type.'/'.$item->id), [])->assertNotFound();
            $this->deleteJson($this->cms($type.'/'.$item->id))->assertNotFound();
            $this->getJson('/api/v1/cms/brands/'.$other->id.'/'.$type)->assertNotFound();
        }
        $this->postJson($this->cms('properties'), ['name' => 'Attack', 'company_id' => $other->id])->assertUnprocessable();
        $this->getJson('/api/v1/public/brands/brand/banners?page_id='.$page->id)->assertNotFound();
        $this->getJson('/api/v1/public/brands/brand/services?per_page=999')->assertUnprocessable();
        $this->getJson('/api/v1/public/brands/brand/properties?per_page=0')->assertUnprocessable();
    }

    public function test_banner_database_constraint_rejects_foreign_page(): void
    {
        $other = Company::create(['name' => 'Other', 'slug' => 'other']);
        app(CompanyContext::class)->id = $other->id;
        $page = Page::create(['title' => 'Other', 'slug' => 'other']);
        app(CompanyContext::class)->id = $this->brand->id;
        try {
            $this->expectException(QueryException::class);
            CmsBanner::create(['page_id' => $page->id, 'image_url' => 'https://example.com/a.png']);
        } finally {
            app(CompanyContext::class)->id = null;
        }
    }

    public function test_cms_banners_list_filters_selected_page(): void
    {
        $this->actingAs($this->admin);
        $page = $this->postJson($this->cms('pages'), ['title' => 'One', 'slug' => 'one'])->assertCreated()->json('data.id');
        $other = $this->postJson($this->cms('pages'), ['title' => 'Two', 'slug' => 'two'])->assertCreated()->json('data.id');
        foreach ([$page, $other] as $pageId) {
            $this->postJson($this->cms('banners'), ['page_id' => $pageId, 'image_url' => 'https://example.com/a.png'])->assertCreated();
        }
        $this->getJson($this->cms('banners').'?page_id='.$page)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.page_id', $page);
    }

    public function test_public_brand_metadata_filters_unknown_legacy_settings(): void
    {
        $this->brand->update(['settings' => ['primary' => '#abcdef', 'secret' => 'private', 'font' => 'unsafe-font']]);
        $this->getJson('/api/v1/public/brands/brand')->assertOk()->assertJsonPath('data.brand.settings.primary', '#abcdef')->assertJsonMissingPath('data.brand.settings.secret')->assertJsonMissingPath('data.brand.settings.font');
        $this->getJson('/api/v1/public/companies/brand')->assertOk()->assertJsonMissingPath('data.company.settings.secret');
    }

    public function test_six_demo_brands_are_idempotent_inactive_and_have_no_users(): void
    {
        $users = User::count();
        $this->seed(BrandDemoSeeder::class);
        $this->seed(BrandDemoSeeder::class);
        $this->assertSame(6, Company::where('slug', 'like', 'outlet-%')->count());
        $this->assertSame(0, Company::where('slug', 'like', 'outlet-%')->where('active', true)->count());
        $this->assertSame(0, Company::where('slug', 'like', 'outlet-%')->where('status', '!=', 'draft')->count());
        $this->assertSame($users, User::count());
        $this->assertNull(app(CompanyContext::class)->id);
    }

    public function test_banners_belong_to_same_brand_page_and_only_publish_with_page(): void
    {
        $this->actingAs($this->admin);
        $page = $this->postJson($this->cms('pages'), ['title' => 'Home', 'slug' => 'home'])->assertCreated()->json('data.id');
        $id = $this->postJson($this->cms('banners'), ['page_id' => $page, 'image_url' => 'https://example.com/banner.png', 'title' => 'Offer', 'link_url' => 'https://example.com/offer', 'position' => 2, 'status' => 'published'])->assertCreated()->json('data.id');
        $public = '/api/v1/public/brands/brand/banners?page_id='.$page;
        $this->getJson($public)->assertNotFound();
        $this->patchJson($this->cms('pages/'.$page), ['status' => 'published'])->assertOk();
        $this->getJson($public)->assertOk()->assertJsonPath('data.0.id', $id);
        $this->getJson('/api/v1/public/brands/brand/banners')->assertUnprocessable();
        $this->actingAs($this->editor)->patchJson($this->cms('banners/'.$id), ['title' => 'Attack'])->assertForbidden();
        $this->postJson($this->cms('banners'), ['page_id' => $page, 'image_url' => 'https://example.com/a.png'])->assertForbidden();
        $other = Company::create(['name' => 'Other', 'slug' => 'other']);
        app(CompanyContext::class)->id = $other->id;
        $foreign = Page::create(['title' => 'Foreign', 'slug' => 'foreign']);
        app(CompanyContext::class)->id = null;
        $this->actingAs($this->admin)->postJson($this->cms('banners'), ['page_id' => $foreign->id, 'image_url' => 'https://example.com/a.png'])->assertUnprocessable();
        $this->deleteJson($this->cms('banners/'.$id))->assertNoContent();
    }

    public function test_services_publish_with_safe_icons_and_paginated_public_lists(): void
    {
        $this->actingAs($this->editor);
        $id = $this->postJson($this->cms('services'), ['name' => 'Laundry', 'icon' => 'washing-machine', 'description' => 'Clean clothes'])->assertCreated()->json('data.id');
        $this->patchJson($this->cms('services/'.$id), ['status' => 'published'])->assertForbidden();
        $this->actingAs($this->admin)->patchJson($this->cms('services/'.$id), ['status' => 'published'])->assertOk();
        $this->getJson('/api/v1/public/brands/brand/services?per_page=1')->assertOk()->assertJsonPath('data.0.name', 'Laundry')->assertJsonPath('meta.per_page', 1);
        $this->postJson($this->cms('services'), ['name' => 'Bad', 'icon' => '<svg>'])->assertUnprocessable();
        $this->deleteJson($this->cms('services/'.$id))->assertNoContent();
    }

    public function test_guests_are_private_admin_only_crud(): void
    {
        $this->actingAs($this->admin);
        $id = $this->postJson($this->cms('guests'), ['first_name' => 'Private', 'last_name' => 'Guest', 'email' => 'guest@example.test', 'phone' => '+62123'])->assertCreated()->json('data.id');
        $this->getJson($this->cms('guests/'.$id))->assertOk()->assertJsonPath('data.email', 'guest@example.test');
        $this->patchJson($this->cms('guests/'.$id), ['first_name' => 'Changed'])->assertOk();
        $this->actingAs($this->editor);
        $this->getJson($this->cms('guests'))->assertForbidden();
        $this->getJson($this->cms('guests/'.$id))->assertForbidden();
        $this->postJson($this->cms('guests'), ['first_name' => 'Attack'])->assertForbidden();
        $this->patchJson($this->cms('guests/'.$id), ['first_name' => 'Attack'])->assertForbidden();
        $this->deleteJson($this->cms('guests/'.$id))->assertForbidden();
        $this->getJson('/api/v1/public/brands/brand/guests')->assertNotFound();
        $this->actingAs($this->admin)->deleteJson($this->cms('guests/'.$id))->assertNoContent();
    }

    public function test_property_crud_is_scoped_soft_deleted_and_publication_gated(): void
    {
        $this->actingAs($this->admin);
        $id = $this->postJson($this->cms('properties'), ['name' => 'Outlet', 'address' => 'Street', 'phone' => '+628123'])->assertCreated()->json('data.id');
        $this->getJson('/api/v1/public/brands/brand/properties')->assertOk()->assertJsonCount(0, 'data');
        $this->patchJson($this->cms('properties/'.$id), ['status' => 'published'])->assertOk();
        $this->getJson('/api/v1/public/brands/brand/properties?per_page=1')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.per_page', 1);
        $this->actingAs($this->editor)->patchJson($this->cms('properties/'.$id), ['name' => 'Attack'])->assertForbidden();
        $this->actingAs($this->admin)->deleteJson($this->cms('properties/'.$id))->assertNoContent();
        $this->assertSoftDeleted('properties', ['id' => $id]);
        $this->getJson($this->cms('properties/'.$id))->assertNotFound();
        $this->assertSame(0, Property::count());
    }

    public function test_brand_alias_updates_metadata_without_duplicate_tenants(): void
    {
        $this->actingAs($this->admin)->patchJson($this->cms(), ['domain' => 'SHOP.Example.COM', 'logo_url' => 'https://example.com/logo.png', 'settings' => ['template' => 'simple', 'font' => 'system', 'primary' => '#abcdef']])
            ->assertOk()->assertJsonPath('data.domain', 'shop.example.com');
        $this->getJson('/api/v1/cms/brands')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/public/brands/brand')->assertOk()->assertJsonPath('data.brand.id', $this->brand->id)->assertJsonMissingPath('data.brand.feature_limits');
        $this->getJson('/api/v1/cms/companies/'.$this->brand->id)->assertOk()->assertJsonPath('data.domain', 'shop.example.com');
        $this->assertSame(1, Company::count());
    }
}
