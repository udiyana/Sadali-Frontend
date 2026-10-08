<?php

namespace App\Models;

class Media extends CompanyRecord
{
    protected function casts(): array
    {
        return ['size' => 'integer', 'width' => 'integer', 'height' => 'integer'];
    }
}
