<?php

namespace Tests\Feature\Cms;

use App\Models\Company;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BrandCustomMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_custom_schema_resumes_missing_index_without_dropping_existing_content(): void
    {
        $company = Company::create(['name' => 'Recovery', 'slug' => 'recovery']);
        $id = DB::table('brand_content_blocks')->insertGetId(['company_id' => $company->id, 'page' => 'home', 'section' => 'hero', 'title' => 'Preserve this content']);
        $columns = ['company_id', 'page', 'is_published', 'sort_order'];
        $index = collect(Schema::getIndexes('brand_content_blocks'))->first(fn (array $item) => $item['columns'] === $columns);
        $this->assertNotNull($index);
        Schema::table('brand_content_blocks', fn (Blueprint $table) => $table->dropIndex($index['name']));
        $migration = require database_path('migrations/2026_10_05_000008_create_brand_custom_tables.php');
        $migration->up();
        $migration->up();
        $this->assertSame('Preserve this content', DB::table('brand_content_blocks')->where('id', $id)->value('title'));
        $indexes = Schema::getIndexes('brand_content_blocks');
        $this->assertTrue(collect($indexes)->contains(fn (array $item) => $item['columns'] === $columns));
        foreach (['brand_content_blocks', 'brand_datasets', 'brand_image_slots'] as $table) {
            foreach (Schema::getIndexes($table) as $item) {
                $this->assertLessThanOrEqual(64, strlen($item['name']), 'MySQL identifier limit: '.$item['name']);
            }
        }
    }
}
