<?php

namespace Tests\Feature\Cms;

use App\Cms\CompanyContext;
use App\Cms\Imports\AcalaImporter;
use App\Models\BrandContentBlock;
use App\Models\BrandDataset;
use App\Models\BrandImageSlot;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcalaImportTest extends TestCase
{
    use RefreshDatabase;

    private function snapshot(): array
    {
        return [
            'source' => 'acala-barbistro-rebuild:repository-seeds',
            'contents' => [['page' => 'home', 'section' => 'hero', 'label' => 'Hero', 'title' => 'Acala', 'sort_order' => 0, 'is_published' => true]],
            'datasets' => [['key' => 'menu', 'label' => 'Menu', 'description' => null, 'data' => [['name' => 'Drink']], 'sort_order' => 0, 'is_published' => true]],
            'images' => [['key' => 'hero', 'group' => 'home', 'label' => 'Hero', 'path' => '/outlet-assets/acala/hero.jpg', 'alt' => 'Acala']],
        ];
    }

    public function test_backend_dummy_source_is_importable_without_claiming_live_data(): void
    {
        $snapshot = $this->snapshot();
        $snapshot['source'] = 'Acala-Backend-gagal:repository-dummy';
        $snapshot['provenance'] = ['live_database_available' => false, 'data_mode' => 'dummy', 'source_endpoint' => '/api/cms/public-contents'];
        $report = app(AcalaImporter::class)->import($snapshot);
        $this->assertDatabaseHas('companies', ['id' => $report['brand_id'], 'slug' => 'acala', 'cms_driver' => 'acala', 'active' => false]);
        $this->assertSame(1, $report['contents']['created']);
        $this->artisan('cms:import-acala', ['--dry-run' => true])
            ->expectsOutputToContain('Acala-Backend-gagal:repository-dummy')
            ->assertSuccessful();
    }

    public function test_cli_default_snapshot_dry_run_validates_actual_records_without_writes(): void
    {
        $this->artisan('cms:import-acala', ['--dry-run' => true])
            ->expectsOutputToContain('contents: 51')
            ->expectsOutputToContain('datasets: 15')
            ->expectsOutputToContain('images: 32')
            ->assertSuccessful();
        $this->assertDatabaseCount('companies', 0);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_import_creates_a_draft_acala_without_users_and_restores_context(): void
    {
        $context = app(CompanyContext::class);
        $context->id = 765;
        $report = app(AcalaImporter::class)->import($this->snapshot());
        $this->assertDatabaseHas('companies', ['id' => $report['brand_id'], 'name' => 'Acala', 'slug' => 'acala', 'cms_driver' => 'acala', 'active' => false, 'status' => 'draft']);
        foreach (['brand_content_blocks', 'brand_datasets', 'brand_image_slots'] as $table) {
            $this->assertDatabaseCount($table, 1);
            $this->assertDatabaseHas($table, ['company_id' => $report['brand_id']]);
        }
        $this->assertDatabaseCount('users', 0);
        $this->assertSame(765, $context->id);
        $this->assertSame(1, $report['datasets']['created']);
        $context->id = null;
    }

    public function test_import_is_additive_and_preserves_editorial_changes_and_other_tenants(): void
    {
        $importer = app(AcalaImporter::class);
        $first = $importer->import($this->snapshot());
        $brand = Company::findOrFail($first['brand_id']);
        $brand->update(['name' => 'Edited Acala', 'settings' => ['font' => 'serif']]);
        $context = app(CompanyContext::class);
        $context->id = $brand->id;
        BrandContentBlock::query()->firstOrFail()->update(['title' => 'Editorial title', 'is_published' => false]);
        BrandDataset::query()->firstOrFail()->update(['data' => [['name' => 'Editorial drink']]]);
        BrandImageSlot::query()->firstOrFail()->update(['path' => '/editor.jpg']);
        $other = Company::create(['name' => 'Other', 'slug' => 'other']);
        $context->id = $other->id;
        BrandDataset::create($this->snapshot()['datasets'][0]);
        $snapshot = $this->snapshot();
        $snapshot['datasets'][] = array_replace($snapshot['datasets'][0], ['key' => 'new_menu']);
        $second = $importer->import($snapshot);
        $third = $importer->import($snapshot);
        $this->assertSame($first['brand_id'], $second['brand_id']);
        $this->assertSame(1, $second['datasets']['created']);
        $this->assertSame(2, $third['datasets']['existing']);
        $this->assertSame($other->id, $context->id);
        $this->assertDatabaseHas('brand_content_blocks', ['company_id' => $brand->id, 'title' => 'Editorial title', 'is_published' => false]);
        $this->assertDatabaseHas('brand_image_slots', ['company_id' => $brand->id, 'path' => '/editor.jpg']);
        $this->assertDatabaseHas('companies', ['id' => $brand->id, 'name' => 'Edited Acala']);
        $context->id = $brand->id;
        $this->assertSame([['name' => 'Editorial drink']], BrandDataset::where('key', 'menu')->firstOrFail()->data);
        $context->id = $other->id;
        $this->assertSame([['name' => 'Drink']], BrandDataset::where('key', 'menu')->firstOrFail()->data);
        $context->id = null;
    }

    public function test_overwrite_and_publish_are_explicit_and_do_not_replace_brand_settings(): void
    {
        $importer = app(AcalaImporter::class);
        $first = $importer->import($this->snapshot());
        $brand = Company::findOrFail($first['brand_id']);
        $brand->update(['name' => 'Editor name', 'settings' => ['font' => 'serif']]);
        app(CompanyContext::class)->id = $brand->id;
        BrandContentBlock::query()->firstOrFail()->update(['title' => 'Editor title']);
        app(CompanyContext::class)->id = null;
        $report = $importer->import($this->snapshot(), overwrite: true, publish: true);
        $this->assertSame(1, $report['contents']['updated']);
        $this->assertDatabaseHas('companies', ['id' => $brand->id, 'name' => 'Acala', 'active' => true, 'status' => 'published']);
        $this->assertSame(['font' => 'serif'], $brand->fresh()->settings);
        $this->assertDatabaseHas('brand_content_blocks', ['company_id' => $brand->id, 'title' => 'Acala']);
        $importer->import($this->snapshot());
        $this->assertTrue($brand->fresh()->active);
        $this->assertNull(app(CompanyContext::class)->id);
    }

    public function test_runtime_failure_rolls_back_brand_and_every_collection_and_restores_context(): void
    {
        $context = app(CompanyContext::class);
        $context->id = 987;
        $event = 'eloquent.creating: '.BrandImageSlot::class;
        app('events')->listen($event, function (): void {
            throw new \RuntimeException('Deliberate storage failure');
        });
        try {
            app(AcalaImporter::class)->import($this->snapshot());
            $this->fail('Expected transaction failure.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Deliberate storage failure', $exception->getMessage());
        } finally {
            app('events')->forget($event);
        }
        foreach (['companies', 'brand_content_blocks', 'brand_datasets', 'brand_image_slots'] as $table) {
            $this->assertDatabaseCount($table, 0);
        }
        $this->assertSame(987, $context->id);
        $context->id = null;
    }

    public function test_incompatible_or_deleted_slug_is_not_hijacked(): void
    {
        $brand = Company::create(['name' => 'Existing', 'slug' => 'acala', 'cms_driver' => 'different']);
        try {
            app(AcalaImporter::class)->import($this->snapshot());
            $this->fail('Incompatible outlet must fail.');
        } catch (\InvalidArgumentException) {
            $this->assertSame('different', $brand->fresh()->cms_driver);
        }
        $brand->update(['cms_driver' => 'generic']);
        $brand->delete();
        $this->expectException(\InvalidArgumentException::class);
        app(AcalaImporter::class)->import($this->snapshot());
    }

    public function test_validation_rejects_unknown_ownership_credentials_scripts_and_malformed_records(): void
    {
        $bad = [];
        $snapshot = $this->snapshot();
        $snapshot['contents'][0]['company_id'] = 999;
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['users'] = [['password' => 'must-not-import']];
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['datasets'][0]['key'] = 'site_scripts';
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['source'] = 'unknown';
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['images'][0]['key'] = null;
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['datasets'] = ['not-a-list' => $snapshot['datasets'][0]];
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['contents'][] = $snapshot['contents'][0];
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['images'][] = $snapshot['images'][0];
        $bad[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['provenance'] = ['live_database_available' => true];
        $bad[] = $snapshot;
        foreach ($bad as $snapshot) {
            try {
                app(AcalaImporter::class)->import($snapshot);
                $this->fail('Invalid snapshot must fail.');
            } catch (\InvalidArgumentException) {
                $this->assertDatabaseCount('companies', 0);
                $this->assertNull(app(CompanyContext::class)->id);
            }
        }
    }

    public function test_validation_matches_database_lengths_and_required_image_fields(): void
    {
        $invalid = [];
        $snapshot = $this->snapshot();
        $snapshot['contents'][0]['page'] = str_repeat('a', 81);
        $invalid[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['datasets'][0]['description'] = str_repeat('a', 1001);
        $invalid[] = $snapshot;
        $snapshot = $this->snapshot();
        unset($snapshot['images'][0]['path']);
        $invalid[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['images'][0]['group'] = null;
        $invalid[] = $snapshot;
        $snapshot = $this->snapshot();
        $snapshot['contents'][0]['body'] = str_repeat('a', 65536);
        $invalid[] = $snapshot;
        foreach ($invalid as $snapshot) {
            try {
                app(AcalaImporter::class)->validate($snapshot);
                $this->fail('Database field constraints must be validated before writes.');
            } catch (\InvalidArgumentException) {
                $this->assertDatabaseCount('companies', 0);
            }
        }
        $snapshot = $this->snapshot();
        $snapshot['contents'][0]['subtitle'] = str_repeat('a', 1000);
        $snapshot['images'][0]['alt'] = str_repeat('a', 500);
        app(AcalaImporter::class)->validate($snapshot);
        $this->assertDatabaseCount('companies', 0);
    }

    public function test_nested_secrets_and_executable_configuration_are_rejected_before_writes(): void
    {
        foreach (['password', 'api_key', 'access_token', 'client_secret', 'site_scripts'] as $field) {
            $snapshot = $this->snapshot();
            $snapshot['datasets'][0]['data'] = [['nested' => [$field => 'not-public-content']]];
            try {
                app(AcalaImporter::class)->import($snapshot);
                $this->fail('Secrets and scripts must not be copied.');
            } catch (\InvalidArgumentException $exception) {
                $this->assertStringNotContainsString('not-public-content', $exception->getMessage());
                $this->assertDatabaseCount('companies', 0);
            }
        }
    }

    public function test_command_rejects_missing_remote_invalid_deep_and_oversized_sources_without_writes(): void
    {
        foreach (['missing-acala-snapshot.json', 'https://example.test/snapshot.json'] as $path) {
            $this->artisan('cms:import-acala', ['--source' => $path, '--dry-run' => true])->assertFailed();
        }
        $deep = 'null';
        for ($i = 0; $i < AcalaImporter::MAX_DEPTH + 1; $i++) {
            $deep = '['.$deep.']';
        }
        foreach (['{invalid', '[]', $deep, str_repeat(' ', AcalaImporter::MAX_BYTES + 1)] as $json) {
            $path = tempnam(storage_path('framework'), 'acala-test-');
            try {
                file_put_contents($path, $json);
                $this->artisan('cms:import-acala', ['--source' => $path, '--dry-run' => true])->assertFailed();
            } finally {
                unlink($path);
            }
        }
        $this->assertDatabaseCount('companies', 0);
        $this->assertNull(app(CompanyContext::class)->id);
    }

    public function test_command_flags_and_explicit_source_publish_only_when_not_dry_run(): void
    {
        $brand = Company::create(['name' => 'Editor name', 'slug' => 'acala', 'cms_driver' => 'generic', 'active' => false, 'status' => 'draft']);
        $source = database_path('data/acala/source.json');
        $this->artisan('cms:import-acala', ['--source' => $source, '--dry-run' => true, '--publish' => true, '--overwrite' => true])->assertSuccessful();
        $this->assertDatabaseHas('companies', ['id' => $brand->id, 'name' => 'Editor name', 'cms_driver' => 'generic', 'active' => false, 'status' => 'draft']);
        $this->assertDatabaseCount('brand_datasets', 0);
        $this->artisan('cms:import-acala', ['--source' => $source, '--publish' => true, '--overwrite' => true])->assertSuccessful();
        $this->assertDatabaseHas('companies', ['id' => $brand->id, 'name' => 'Acala', 'cms_driver' => 'acala', 'active' => true, 'status' => 'published']);
        $this->assertDatabaseCount('brand_datasets', 15);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_command_imports_actual_default_snapshot_in_disposable_database_idempotently(): void
    {
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->artisan('cms:import-acala')->expectsOutputToContain('contents: created=51 existing=0 updated=0')->assertSuccessful();
        $this->assertDatabaseCount('brand_content_blocks', 51);
        $this->assertDatabaseCount('brand_datasets', 15);
        $this->assertDatabaseCount('brand_image_slots', 32);
        $this->assertSame(10, BrandContentBlock::withoutGlobalScopes()->distinct()->count('page'));
        $this->assertDatabaseCount('users', 0);
        $snapshot = json_decode(file_get_contents(database_path('data/acala/source.json')), true, flags: JSON_THROW_ON_ERROR);
        $brand = Company::where('slug', 'acala')->firstOrFail();
        app(CompanyContext::class)->id = $brand->id;
        foreach ($snapshot['contents'] as $record) {
            $model = BrandContentBlock::where('page', $record['page'])->where('section', $record['section'])->firstOrFail();
            foreach ($record as $field => $value) {
                $this->assertSame($value, $model->getAttribute($field));
            }
        }
        foreach (['datasets' => BrandDataset::class, 'images' => BrandImageSlot::class] as $collection => $modelClass) {
            foreach ($snapshot[$collection] as $record) {
                $model = $modelClass::where('key', $record['key'])->firstOrFail();
                foreach ($record as $field => $value) {
                    $this->assertSame($value, $model->getAttribute($field));
                }
            }
        }
        app(CompanyContext::class)->id = null;
        $this->artisan('cms:import-acala')->expectsOutputToContain('contents: created=0 existing=51 updated=0')->assertSuccessful();
        $this->assertDatabaseCount('companies', 1);
        $this->assertDatabaseCount('brand_content_blocks', 51);
        $this->assertDatabaseCount('brand_datasets', 15);
        $this->assertDatabaseCount('brand_image_slots', 32);
        $this->assertNull(app(CompanyContext::class)->id);
    }

    public function test_duplicate_collision_is_independent_of_record_field_order(): void
    {
        $snapshot = $this->snapshot();
        $snapshot['contents'][] = array_reverse($snapshot['contents'][0], preserve_keys: true);
        try {
            app(AcalaImporter::class)->import($snapshot);
            $this->fail('Reordered duplicate natural keys must fail before writes.');
        } catch (\InvalidArgumentException $exception) {
            $this->assertStringContainsString('Duplicate', $exception->getMessage());
        }
        $this->assertDatabaseCount('companies', 0);
    }

    public function test_snapshot_validation_rejects_duplicate_keys_before_writes(): void
    {
        $snapshot = $this->snapshot();
        $snapshot['datasets'][] = $snapshot['datasets'][0];
        try {
            app(AcalaImporter::class)->import($snapshot);
            $this->fail('Duplicate keys must be rejected.');
        } catch (\InvalidArgumentException $exception) {
            $this->assertStringContainsString('Duplicate', $exception->getMessage());
        }
        $this->assertDatabaseCount('companies', 0);
    }
}
