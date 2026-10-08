<?php

namespace App\Models;

class CompanyProfile extends CompanyRecord
{
    protected function casts(): array
    {
        return ['opening_hours' => 'array', 'social_links' => 'array', 'legal' => 'array', 'theme' => 'array'];
    }
}
