<?php

namespace App\Models;

class Product extends CompanyRecord
{
    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'price' => 'decimal:2', 'visible' => 'boolean'];
    }
}
