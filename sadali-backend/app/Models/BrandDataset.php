<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class BrandDataset extends CompanyRecord
{
    protected static function booted(): void
    {
        parent::booted();
        static::addGlobalScope('safe-datasets', fn (Builder $query) => $query->where($query->getModel()->qualifyColumn('key'), '!=', 'site_scripts'));
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        $data = parent::toArray();
        if (array_key_exists('data', $data)) {
            $data['data'] = json_decode($this->getRawOriginal('data') ?? 'null');
        }

        return $data;
    }

    protected function casts(): array
    {
        return ['data' => 'array', 'sort_order' => 'integer', 'is_published' => 'boolean'];
    }

    /** @param Builder<static> $query @return Builder<static> */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
