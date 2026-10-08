<?php

namespace App\Cms;

use App\Models\Company;

final class BrandDrivers
{
    /** @return list<string> */
    public static function keys(): array
    {
        return ['generic', 'acala'];
    }

    /** @return array<string, mixed> */
    public static function definition(Company $company): array
    {
        return match ($company->cms_driver) {
            'generic' => ['driver' => 'generic', 'name' => 'Generic', 'modules' => []],
            'acala' => AcalaDefinition::get(),
            default => abort(404),
        };
    }
}
