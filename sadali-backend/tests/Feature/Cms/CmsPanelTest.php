<?php

namespace Tests\Feature\Cms;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CmsPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_live_panel_requires_login_and_only_shares_accessible_membership_roles(): void
    {
        $this->get('/cms')->assertRedirect('/login');
        $user = User::factory()->create();
        $company = Company::create(['name' => 'Own', 'slug' => 'own']);
        $other = Company::create(['name' => 'Foreign', 'slug' => 'foreign']);
        $company->users()->attach($user, ['role' => 'company_editor']);
        $this->actingAs($user)->get('/cms')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('cms/index', false)
            ->where('demo', false)
            ->where('cmsUser.id', $user->id)
            ->where('cmsUser.is_super_admin', false)
            ->where('cmsRoles.'.$company->id, 'company_editor')
            ->missing('cmsRoles.'.$other->id)
            ->missing('cmsUser.password')
            ->missing('cmsUser.two_factor_secret'));
    }

    public function test_brand_workspace_resolves_the_authorized_brand_from_the_url(): void
    {
        $user = User::factory()->create();
        $company = Company::create(['name' => 'Own workspace', 'slug' => 'own-workspace']);
        $company->users()->attach($user, ['role' => 'company_editor']);
        $this->actingAs($user)->get('/cms/own-workspace')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('cms/index', false)
            ->where('demo', false)
            ->where('cmsBrandSlug', 'own-workspace')
            ->where('cmsBrand.id', $company->id)
            ->where('cmsBrand.name', 'Own workspace')
            ->where('cmsBrand.cms_driver', 'generic'));
    }

    public function test_brand_workspace_requires_login_and_rejects_foreign_missing_and_deleted_brands(): void
    {
        $this->get('/cms/own-workspace')->assertRedirect('/login');
        $user = User::factory()->create();
        $foreign = Company::create(['name' => 'Foreign', 'slug' => 'foreign']);
        $deleted = Company::create(['name' => 'Deleted', 'slug' => 'deleted']);
        $deleted->users()->attach($user, ['role' => 'company_admin']);
        $deleted->delete();
        $this->actingAs($user)->get('/cms/'.$foreign->slug)->assertNotFound();
        $this->get('/cms/missing')->assertNotFound();
        $this->get('/cms/deleted')->assertNotFound();
        $super = User::factory()->create(['is_super_admin' => true]);
        $this->actingAs($super)->get('/cms/'.$foreign->slug)->assertOk()->assertInertia(fn (Assert $page) => $page->where('cmsBrand.id', $foreign->id));
    }

    public function test_demo_brand_workspace_is_exactly_scoped_by_slug(): void
    {
        foreach (['nusa-stay', 'sora-kitchen', 'aruna-wellness'] as $slug) {
            $this->get('/cms/demo/'.$slug)->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('cms/index', false)
                ->where('demo', true)
                ->where('cmsBrandSlug', $slug)
                ->where('cmsBrand', null));
        }
        $this->get('/cms/demo/not-a-brand')->assertNotFound();
        $this->assertGuest();
    }

    public function test_demo_panel_is_accessible_without_authentication_and_explicitly_marked_demo(): void
    {
        $this->get('/cms/demo')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('cms/index', false)
            ->where('demo', true)
            ->where('cmsUser.name', 'Admin demo')
            ->where('cmsUser.is_super_admin', true));
        $this->assertGuest();
    }
}
