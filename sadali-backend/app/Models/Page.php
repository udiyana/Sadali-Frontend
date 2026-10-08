<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends CompanyRecord
{
    /** @return HasMany<Section, $this> */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
