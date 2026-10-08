<?php

namespace Database\Seeders;

use App\Cms\CompanyContext;
use App\Models\Article;
use App\Models\Company;
use App\Models\CompanyProfile;
use App\Models\Page;
use App\Models\Product;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CompanyDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Demo seeder hanya untuk local/testing.');
        }
        $context = app(CompanyContext::class);
        try {
            foreach (['Dapur Contoh', 'Kriya Contoh', 'Bengkel Contoh'] as $index => $name) {
                $slug = Str::slug($name);
                $company = Company::firstOrCreate(['slug' => $slug], ['name' => $name, 'active' => true, 'status' => 'published']);
                $context->id = $company->id;
                $user = User::firstOrCreate(['email' => $slug.'@example.test'], ['name' => 'Pengelola Demo '.($index + 1), 'password' => Str::random(64)]);
                $company->users()->syncWithoutDetaching([$user->id => ['role' => 'company_admin']]);
                CompanyProfile::firstOrCreate([], ['description' => 'Usaha fiktif untuk demonstrasi CMS UMKM.', 'address' => 'Alamat contoh, Indonesia', 'theme' => ['primary' => '#166534', 'accent' => '#f59e0b', 'font' => 'system', 'template' => 'simple']]);
                foreach (['Beranda', 'Tentang Kami', 'Produk Layanan', 'Galeri', 'Kontak'] as $title) {
                    $page = Page::firstOrCreate(['slug' => Str::slug($title)], ['title' => $title, 'status' => 'published', 'body' => 'Teks contoh yang dapat diganti.']);
                    Section::firstOrCreate(['page_id' => $page->id, 'position' => 0], ['type' => $title === 'Galeri' ? 'gallery' : 'text', 'config' => ['heading' => $title, 'text' => 'Konten contoh UMKM.'], 'visible' => true]);
                }
                Product::firstOrCreate(['slug' => 'produk-contoh'], ['title' => 'Produk Contoh', 'body' => 'Deskripsi produk fiktif.', 'status' => 'published', 'price' => null]);
                Article::firstOrCreate(['slug' => 'berita-contoh'], ['title' => 'Berita Contoh', 'body' => 'Berita usaha fiktif.', 'status' => 'draft']);
            }
        } finally {
            $context->id = null;
        }
    }
}
