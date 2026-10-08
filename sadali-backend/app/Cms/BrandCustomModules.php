<?php

namespace App\Cms;

use App\Models\BrandContentBlock;
use App\Models\BrandDataset;
use App\Models\BrandImageSlot;
use App\Models\CompanyRecord;

final class BrandCustomModules
{
    /** @return class-string<CompanyRecord> */
    public static function model(string $module): string
    {
        return match ($module) {
            'content-blocks' => BrandContentBlock::class, 'datasets' => BrandDataset::class, 'image-slots' => BrandImageSlot::class, default => abort(404)
        };
    }

    /** @return list<string> */
    public static function summaryColumns(string $module): array
    {
        return match ($module) {
            'image-slots' => ['id', 'company_id', 'key', 'group', 'label', 'path', 'alt', 'created_at', 'updated_at'],
            'datasets' => ['id', 'company_id', 'key', 'label', 'description', 'sort_order', 'is_published', 'created_at', 'updated_at'],
            default => ['id', 'company_id', 'page', 'section', 'label', 'title', 'sort_order', 'is_published', 'created_at', 'updated_at'],
        };
    }
}
