<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class BoundedBrandJson implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        try {
            $encoded = json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES, 16);
        } catch (\JsonException) {
            $fail('JSON maksimal memiliki kedalaman 16.');

            return;
        }
        if (strlen($encoded) > 1048576) {
            $fail('JSON maksimal berukuran 1 MiB.');
        }
    }
}
