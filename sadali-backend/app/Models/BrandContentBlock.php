<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class BrandContentBlock extends CompanyRecord
{
    protected function casts(): array
    {
        return ['metadata' => 'array', 'sort_order' => 'integer', 'is_published' => 'boolean'];
    }

    /** @param Builder<static> $query @return Builder<static> */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
