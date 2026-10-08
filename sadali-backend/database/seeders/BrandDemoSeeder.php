<?php

namespace Database\Seeders;

use App\Cms\CompanyContext;
use App\Models\Company;
use Illuminate\Database\Seeder;

class BrandDemoSeeder extends Seeder
{
    public function run(): void
    {
        try {
            for ($i = 1; $i <= 6; $i++) {
                Company::withTrashed()->firstOrCreate(['slug' => 'outlet-'.$i], ['name' => 'Outlet '.$i, 'active' => false, 'status' => 'draft']);
            }
        } finally {
            app(CompanyContext::class)->id = null;
        }
    }
}
