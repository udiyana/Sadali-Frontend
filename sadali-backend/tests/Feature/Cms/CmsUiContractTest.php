<?php

namespace Tests\Feature\Cms;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsUiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_section_editor_can_clear_all_text_using_explicit_nullable_config_fields(): void
    {
        $company = Company::create(['name' => 'UI contract', 'slug' => 'ui-contract']);
        $admin = User::factory()->create();
        $company->users()->attach($admin, ['role' => 'company_admin']);
        $this->actingAs($admin);
        $base = '/api/v1/cms/brands/'.$company->id;
        $page = $this->postJson($base.'/pages', ['title' => 'Test', 'slug' => 'test'])->assertCreated()->json('data.id');
        $section = $this->postJson($base.'/sections', ['page_id' => $page, 'type' => 'text', 'config' => ['heading' => 'Old heading', 'text' => 'Old content', 'limit' => 4]])->assertCreated()->json('data.id');
        $cleared = ['heading' => null, 'text' => null, 'button_label' => null, 'button_url' => null];
        $this->patchJson($base.'/sections/'.$section, ['config' => $cleared])->assertOk()->assertJsonPath('data.config', $cleared);
        $this->getJson($base.'/sections/'.$section)->assertOk()->assertJsonPath('data.config', $cleared)->assertJsonMissingPath('data.config.limit');
    }
}
