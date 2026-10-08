<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Section extends CompanyRecord
{
    /** @return BelongsTo<Page, $this> */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    protected function casts(): array
    {
        return ['config' => 'array', 'visible' => 'boolean', 'position' => 'integer'];
    }
}
