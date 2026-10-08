<?php

namespace App\Models;

class ActivityLog extends CompanyRecord
{
    protected function casts(): array
    {
        return ['changes' => 'array'];
    }
}
