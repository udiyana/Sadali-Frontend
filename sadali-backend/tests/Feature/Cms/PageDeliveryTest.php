<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Models\Company;
use App\Models\CompanyProfile;
use App\Models\Page;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageDeliveryTest extends TestCase
{
    use RefreshDatabase;

    private function tenant(): Company
    {
        return Company::create(['name' => 'Outlet A', 'slug' => 'outlet-a', 'active' => true, 'status' => 'published']);
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

    public function test_render_never_exposes_drafts_scheduled_pages_or_other_brands(): void
    {
        $company = $this->tenant();
        $this->record(Page::class, $company, ['title' => 'Draft', 'slug' => 'draft']);
        $this->record(Page::class, $company, ['title' => 'Future', 'slug' => 'future', 'status' => 'published', 'published_at' => now()->addDay()]);
        $other = Company::create(['name' => 'Outlet B', 'slug' => 'outlet-b', 'active' => true, 'status' => 'published']);
        $foreign = $this->record(Page::class, $other, ['title' => 'Foreign', 'slug' => 'foreign', 'status' => 'published']);
        $url = '/api/v1/public/brands/outlet-a/pages/';
        foreach (['draft', 'future', 'foreign'] as $slug) {
            $this->getJson($url.$slug.'/render')->assertNotFound();
        }
        $admin = User::factory()->create();
        $company->users()->attach($admin, ['role' => 'company_admin']);
        $this->actingAs($admin)->getJson('/api/v1/cms/brands/'.$company->id.'/pages/'.$foreign->id.'/editor')->assertNotFound();
        $company->update(['active' => false]);
        $this->getJson($url.'draft/render')->assertNotFound();
    }

    public function test_page_lists_are_lightweight_with_explicit_full_view(): void
    {
        $company = $this->tenant();
        $admin = User::factory()->create();
        $company->users()->attach($admin, ['role' => 'company_admin']);
        $this->record(Page::class, $company, ['title' => 'Home', 'slug' => 'home', 'body' => 'Large page content', 'status' => 'published']);
        $public = '/api/v1/public/companies/outlet-a/pages';
        $this->getJson($public)->assertOk()->assertJsonPath('data.0.title', 'Home')->assertJsonMissingPath('data.0.body');
        $this->getJson($public.'?view=full')->assertOk()->assertJsonPath('data.0.body', 'Large page content');
        $this->getJson($public.'?view=unknown')->assertUnprocessable();
        $cms = '/api/v1/cms/companies/'.$company->id.'/pages';
        $this->actingAs($admin)->getJson($cms)->assertOk()->assertJsonMissingPath('data.0.body');
        $this->getJson($cms.'?view=full')->assertOk()->assertJsonPath('data.0.body', 'Large page content');
    }

    public function test_editor_loads_only_selected_page_including_hidden_sections(): void
    {
        $company = $this->tenant();
        $admin = User::factory()->create();
        $company->users()->attach($admin, ['role' => 'company_admin']);
        $page = $this->record(Page::class, $company, ['title' => 'Draft', 'slug' => 'draft']);
        $other = $this->record(Page::class, $company, ['title' => 'Other', 'slug' => 'other']);
        $this->record(Section::class, $company, ['page_id' => $page->id, 'type' => 'text', 'visible' => false, 'config' => ['heading' => 'Hidden draft']]);
        $this->record(Section::class, $company, ['page_id' => $other->id, 'type' => 'text', 'config' => ['heading' => 'Other page']]);
        $url = '/api/v1/cms/brands/'.$company->id.'/pages/'.$page->id.'/editor';
        $this->getJson($url)->assertUnauthorized();
        $this->actingAs(User::factory()->create())->getJson($url)->assertNotFound();
        $this->actingAs($admin)->getJson($url)->assertOk()->assertJsonPath('data.page.status', 'draft')
            ->assertJsonCount(1, 'data.sections')->assertJsonPath('data.sections.0.visible', false)
            ->assertJsonMissing(['heading' => 'Other page'])->assertJsonMissingPath('data.guests');
        $this->getJson($url.'?per_page=101')->assertUnprocessable();
    }

    public function test_render_sections_are_bounded_and_paginated(): void
    {
        $company = $this->tenant();
        $page = $this->record(Page::class, $company, ['title' => 'Home', 'slug' => 'home', 'status' => 'published']);
        for ($i = 0; $i < 26; $i++) {
            $this->record(Section::class, $company, ['page_id' => $page->id, 'type' => 'text', 'position' => $i, 'config' => ['heading' => 'Section '.$i]]);
        }
        $url = '/api/v1/public/brands/outlet-a/pages/home/render';
        $this->getJson($url)->assertOk()->assertJsonCount(24, 'data.sections')->assertJsonPath('meta.total', 26)->assertJsonPath('meta.has_more', true);
        $this->getJson($url.'?per_page=10&page=2')->assertOk()->assertJsonCount(10, 'data.sections')->assertJsonPath('data.sections.0.position', 10)->assertJsonPath('meta.current_page', 2);
        $this->getJson($url.'?per_page=101')->assertUnprocessable();
        $this->getJson($url.'?page=0')->assertUnprocessable();
    }

    public function test_render_delivers_only_selected_published_page_and_visible_sections(): void
    {
        $company = $this->tenant();
        $home = $this->record(Page::class, $company, ['title' => 'Home', 'slug' => 'home', 'status' => 'published']);
        $other = $this->record(Page::class, $company, ['title' => 'Other', 'slug' => 'other', 'status' => 'published']);
        $this->record(CompanyProfile::class, $company, ['description' => 'Profil', 'legal' => ['nib' => 'PRIVATE']]);
        $this->record(Section::class, $company, ['page_id' => $home->id, 'type' => 'hero', 'position' => 2, 'config' => ['heading' => 'Second']]);
        $this->record(Section::class, $company, ['page_id' => $home->id, 'type' => 'text', 'position' => 1, 'config' => ['text' => 'First']]);
        $this->record(Section::class, $company, ['page_id' => $home->id, 'type' => 'text', 'visible' => false, 'config' => ['text' => 'HIDDEN']]);
        $this->record(Section::class, $company, ['page_id' => $other->id, 'type' => 'text', 'config' => ['text' => 'OTHER PAGE']]);
        $this->getJson('/api/v1/public/companies/outlet-a/pages/home/render')
            ->assertOk()->assertJsonPath('data.page.id', $home->id)
            ->assertJsonPath('data.company.slug', 'outlet-a')
            ->assertJsonCount(2, 'data.sections')
            ->assertJsonPath('data.sections.0.config.text', 'First')
            ->assertJsonMissingPath('data.profile.legal')
            ->assertJsonMissingPath('data.products')
            ->assertJsonMissingPath('data.guests')
            ->assertJsonMissing(['text' => 'HIDDEN'])
            ->assertJsonMissing(['text' => 'OTHER PAGE']);
    }
}
