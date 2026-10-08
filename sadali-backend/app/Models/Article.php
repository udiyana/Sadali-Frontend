<?php

namespace App\Models;

class Article extends CompanyRecord
{
    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
