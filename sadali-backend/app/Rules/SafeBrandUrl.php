<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class SafeBrandUrl implements ValidationRule
{
    public function __construct(private bool $image = false) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! $this->safe($value)) {
            $fail('Gunakan URL HTTPS atau jalur lokal yang aman dan tersedia.');
        }
    }

    private function safe(string $value): bool
    {
        $decoded = $value;
        for ($i = 0; $i < 4; $i++) {
            $next = rawurldecode($decoded);
            if ($next === $decoded) {
                break;
            }
            $decoded = $next;
        }
        if (preg_match('/[\\\\\x00-\x1f\x7f]/', $decoded) || str_contains($decoded, '%') || preg_match('~(?:^|/)\.\.(?:/|$|[?#])~', $decoded)) {
            return false;
        }
        if (str_starts_with($decoded, 'https://')) {
            $parts = parse_url($decoded);

            return filter_var($value, FILTER_VALIDATE_URL) !== false && is_array($parts) && ! isset($parts['user']) && ! isset($parts['pass']);
        }
        if (! str_starts_with($decoded, '/') || str_starts_with($decoded, '//') || str_contains($decoded, ':')) {
            return false;
        }
        if (! $this->image) {
            return true;
        }
        if (strpbrk($decoded, '?#') !== false || ! in_array(strtolower(pathinfo($decoded, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'ico'], true)) {
            return false;
        }
        $root = realpath(public_path());
        $path = realpath(public_path(ltrim($decoded, '/')));

        return $root !== false && $path !== false && is_file($path) && str_starts_with(str_replace('\\', '/', $path), str_replace('\\', '/', $root).'/');
    }
}
