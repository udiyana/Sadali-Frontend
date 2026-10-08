<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Models\BrandContentBlock;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AcalaCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The parent registers this file in web.php after the isolated handoff.
        if (! Route::has('acala-compat.public-contents') && file_exists(base_path('routes/acala-compat.php'))) {
            Route::middleware('web')->group(base_path('routes/acala-compat.php'));
        }
    }

    /** @param array<string, mixed> $attributes */
    private function tenant(string $slug = 'acala', array $attributes = []): Company
    {
        return Company::create(array_merge(['name' => 'Dummy Acala', 'slug' => $slug, 'active' => true, 'status' => 'published', 'cms_driver' => 'acala'], $attributes));
    }

    /** @param array<string, mixed> $attributes */
    private function block(Company $company, array $attributes = []): BrandContentBlock
    {
        $context = app(CompanyContext::class);
        $previous = $context->id;
        $context->id = $company->id;
        try {
            return BrandContentBlock::create(array_merge(['page' => 'home', 'section' => 'hero', 'title' => 'Dummy hero', 'body' => 'Full dummy copy', 'metadata' => ['cards' => [['title' => 'Dummy card']]], 'is_published' => true], $attributes));
        } finally {
            $context->id = $previous;
        }
    }

    private function assertContextId(?int $expected): void
    {
        $this->assertSame($expected, app(CompanyContext::class)->id);
    }

    public function test_unavailable_acala_never_falls_back_to_another_tenant(): void
    {
        $this->block($this->tenant('other'), ['title' => 'FOREIGN']);
        $this->getJson('/api/cms/public-contents')->assertNotFound();
        $company = $this->tenant();
        $this->block($company);
        foreach ([['active' => false], ['status' => 'draft'], ['cms_driver' => 'generic'], ['cms_driver' => 'untrusted']] as $attributes) {
            $company->update(array_merge(['active' => true, 'status' => 'published', 'cms_driver' => 'acala'], $attributes));
            $this->getJson('/api/cms/public-contents')->assertNotFound();
        }
        $company->update(['cms_driver' => 'acala']);
        $company->delete();
        $this->getJson('/api/cms/public-contents')->assertNotFound();
    }

    public function test_request_context_is_restored_on_success_validation_failure_and_missing_company(): void
    {
        $company = $this->tenant();
        $this->block($company);
        $other = $this->tenant('other');
        $context = app(CompanyContext::class);
        foreach ([null, $other->id] as $previous) {
            $context->id = $previous;
            $this->getJson('/api/cms/public-contents')->assertOk()->assertJsonCount(1, 'data');
            $this->assertContextId($previous);
            $this->getJson('/api/cms/public-contents?per_page=101')->assertUnprocessable();
            $this->assertContextId($previous);
        }
        $company->update(['active' => false]);
        $this->getJson('/api/cms/public-contents')->assertNotFound();
        $this->assertSame($other->id, $context->id);
        $context->id = null;
    }

    public function test_request_context_is_restored_when_content_retrieval_throws(): void
    {
        $company = $this->tenant();
        $this->block($company);
        $other = $this->tenant('other');
        $context = app(CompanyContext::class);
        $context->id = $other->id;
        $dispatcher = BrandContentBlock::getEventDispatcher();
        BrandContentBlock::setEventDispatcher(clone $dispatcher);
        BrandContentBlock::retrieved(function () use ($company, $context): void {
            $this->assertSame($company->id, $context->id);
            throw new \RuntimeException('Simulated content retrieval failure');
        });
        $this->withoutExceptionHandling();
        try {
            $this->getJson('/api/cms/public-contents');
            $this->fail('Content retrieval must throw.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Simulated content retrieval failure', $exception->getMessage());
            $this->assertSame($other->id, $context->id);
        } finally {
            BrandContentBlock::setEventDispatcher($dispatcher);
            $context->id = null;
        }
    }

    public function test_oversized_and_malformed_filters_are_rejected(): void
    {
        $this->tenant();
        foreach ([['per_page' => 101], ['per_page' => 0], ['per_page' => 'bad'], ['per_page' => [20]], ['page_number' => 0], ['page_number' => 'bad'], ['page_number' => [1]], ['page' => 'Home'], ['page' => 'home/secret'], ['page' => str_repeat('a', 81)], ['page' => ''], ['page' => ['home']]] as $query) {
            $this->getJson('/api/cms/public-contents?'.http_build_query($query))->assertUnprocessable()->assertJsonValidationErrors(array_keys($query));
        }
    }

    public function test_default_limit_and_next_link_keep_page_key_separate_from_page_number(): void
    {
        $company = $this->tenant();
        for ($i = 0; $i < 23; $i++) {
            $this->block($company, ['section' => 'section_'.$i, 'title' => 'Row '.$i, 'sort_order' => $i]);
        }
        $this->block($company, ['page' => 'about']);
        $first = $this->getJson('/api/cms/public-contents?page=home')->assertOk()->assertJsonCount(20, 'data')->assertJsonPath('meta.total', 23)->assertJsonPath('meta.per_page', 20)->assertJsonPath('meta.has_more', true);
        $next = $first->json('links.next');
        $this->assertNotNull($next);
        $query = parse_url($next, PHP_URL_QUERY);
        $this->assertIsString($query);
        parse_str($query, $parameters);
        $this->assertSame('home', $parameters['page']);
        $this->assertSame('2', $parameters['page_number']);
        $this->getJson($next)->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('data.0.title', 'Row 20')->assertJsonPath('meta.current_page', 2)->assertJsonPath('meta.has_more', false)->assertJsonPath('links.next', null);
        $this->getJson('/api/cms/public-contents?per_page=100')->assertOk()->assertJsonCount(24, 'data')->assertJsonPath('data.0.page', 'about');
    }

    public function test_selected_page_preserves_full_source_fields_and_excludes_foreign_and_draft_records(): void
    {
        $company = $this->tenant();
        $block = $this->block($company, ['label' => 'Hero', 'eyebrow' => 'Welcome', 'subtitle' => 'Subtitle', 'image' => 'https://example.com/hero.jpg', 'cta_label' => 'Book', 'cta_url' => '/reservation', 'sort_order' => 2]);
        $this->block($company, ['section' => 'draft', 'title' => 'DRAFT', 'is_published' => false]);
        $this->block($company, ['page' => 'about', 'title' => 'OTHER PAGE']);
        $this->block($this->tenant('other'), ['title' => 'FOREIGN']);

        $response = $this->getJson('/api/cms/public-contents?page=home')->assertOk()->assertJsonCount(1, 'data');
        $expected = $block->toArray();
        foreach (['id', 'page', 'section', 'label', 'eyebrow', 'title', 'subtitle', 'body', 'image', 'cta_label', 'cta_url', 'metadata', 'sort_order', 'is_published', 'created_at', 'updated_at'] as $field) {
            $this->assertArrayHasKey($field, $expected);
            $response->assertJsonPath('data.0.'.$field, data_get($expected, $field));
        }
        $response->assertJsonMissingPath('data.0.company_id')->assertJsonMissing(['title' => 'DRAFT'])->assertJsonMissing(['title' => 'FOREIGN'])->assertJsonMissing(['title' => 'OTHER PAGE']);
    }
}
