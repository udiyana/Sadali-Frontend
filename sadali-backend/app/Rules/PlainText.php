<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PlainText implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && (preg_match('/<[^>]*>/', $value) || preg_match('/(?:javascript|data|vbscript)\s*:/i', $value))) {
            $fail('Gunakan teks biasa tanpa HTML atau kode JavaScript.');
        }
    }
}
