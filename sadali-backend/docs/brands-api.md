# API brand / outlet

Brand adalah alias company yang sudah ada, bukan tenant atau tabel baru. ID CMS tetap integer `companies.id`; API publik memakai `companies.slug`. Tidak ada reset atau migrasi ID. Enam outlet demo merupakan enam root brand, bukan enam user atau enam property wajib.

## Autentikasi dan akses

CMS memakai session login Fortify (`POST /login`) dan CSRF pada mutasi, sama dengan API company. Membership tetap `company_user` dengan role `company_admin`/`company_editor`; super admin dapat mengakses semua brand. Tenant tidak boleh diberikan lewat body: `company_id`, `id`, `actor_id` dilarang. Akses tenant/record lain menghasilkan 404.

## Brand root

| Method | Endpoint | Akses |
| --- | --- | --- |
| GET | `/api/v1/cms/brands` | daftar brand membership, pagination |
| POST | `/api/v1/cms/brands` | super admin saja |
| GET | `/api/v1/cms/brands/{id}` | member |
| PATCH | `/api/v1/cms/brands/{id}` | company admin / super admin |
| DELETE | `/api/v1/cms/brands/{id}` | super admin; soft delete |
| GET | `/api/v1/public/brands/{slug}` | anonim; brand aktif + published |

POST membutuhkan `name`, `slug`; PATCH partial. Field company lama tetap berlaku (`active`/`plan_key`/`feature_limits` hanya super admin). Metadata tambahan:

- `domain`: nullable, unik global termasuk soft-deleted brand, maksimum 253 karakter; bare ASCII hostname bertitik, tanpa protocol/path/port/wildcard. Lowercase + trim sebelum validasi. Contoh `outlet.example.com`. Ini metadata, **bukan** provisioning DNS/TLS atau resolusi tenant otomatis berdasarkan Host header.
- `logo_url`: nullable URL HTTPS maksimum 500 karakter; tidak di-fetch server. Ini gambar eksternal, bukan pengganti media privat.
- `settings`: nullable object dengan **hanya** `template`, `font`, `primary`, `secondary`. Template `simple|catalog|services`; font `system|inter|noto-sans`; warna `#RRGGBB`. Tidak ada HTML/CSS/JS atau arbitrary nested config. PATCH settings mengganti object, tidak deep-merge.

```json
{"name":"Outlet Jakarta","slug":"outlet-jakarta","domain":"jakarta.example.com","logo_url":"https://cdn.example.com/logo.png","settings":{"template":"services","font":"system","primary":"#123abc"}}
```

Response publik root: `data.brand` dan `data.profile`; root legacy company tetap `data.company`. Field paket/limit/legal dan tenant child ownership tidak dikirim publik. Settings publik difilter ulang, termasuk data lama dari database, ke enum/warna valid saja.

## Aliases konten lama

Ganti segmen `companies` menjadi `brands` untuk profile (`GET`, `PUT`), pages/products/articles/sections (CRUD CMS), media (list/upload/file/delete CMS), activity (CMS), dan pages/products/articles/section halaman/media-file publik. Semua alias menunjuk record, quota, scope dan policy yang sama. URL gambar yang dikembalikan resource lama tetap dapat memakai `/companies/…` dan tetap valid. Tidak ada tabel `brands` atau `cms_pages` baru: `pages` adalah CMS pages. User management tetap terpusat pada `/api/v1/cms/users`, membership memakai `company_id`.

Render/editor halaman: lihat `page-delivery.md`. Banners diambil terpisah, tidak tertanam otomatis dalam response render.

## Resources outlet

Di kedua alias `/api/v1/cms/{brands|companies}/{id}` tersedia:

- `GET /{resource}`: pagination.
- `POST /{resource}`: create; return 201 `data`.
- `GET /{resource}/{record}`: detail.
- `PATCH /{resource}/{record}`: partial update.
- `DELETE /{resource}/{record}`: 204.

Resources:

| Resource | Fields create / update | Catatan |
| --- | --- | --- |
| `properties` | `name` required on POST (255), `address` nullable (2000), `phone` nullable (30), `status` | property soft delete; public contact outlet, bukan PII guest |
| `services` | `name` required on POST (255), `icon` nullable (80), `description` nullable (5000), `status` | icon hanya key lowercase `[a-z][a-z0-9-]*`, bukan markup/URL |
| `guests` | `first_name` required on POST (120), `last_name` nullable (120), `email` nullable valid (255), `phone` nullable (30) | **semua CRUD/list/detail admin saja**, tidak ada API publik; delete hard |
| `banners` | `page_id` required on POST, `image_url` HTTPS required (500), `title` nullable (160), `link_url` HTTPS nullable (500), `position` integer 0–1000, `status` | tabel `cms_banners`, page wajib brand yang sama; delete hard |

`status` enum `draft|published|archived`, default draft. Properties/services/banners tidak memiliki jadwal published_at: public memakai status langsung. Editor dapat mengelola draft/archived, tetapi tidak publish atau mengubah/hapus record published. Banners juga memeriksa **halaman asal dan tujuan**: editor tidak dapat mengubah banner apa pun pada page published, termasuk draft banner. Text fields plain text, bukan HTML.

`GET /banners?page_id={id}` CMS memfilter satu page; tanpa filter daftar banner tenant. Public **wajib** `page_id` dan memastikan page tenant published dengan jadwal sudah lewat.

## API publik ringan

- `GET /api/v1/public/brands/{slug}/properties`
- `GET /api/v1/public/brands/{slug}/services`
- `GET /api/v1/public/brands/{slug}/banners?page_id={page_id}`

Alias `/public/companies/{slug}/…` tersedia juga. Tidak ada public guests, tidak ada guest PII di payload root/content/outlet. List terpisah, tanpa relasi tenant lain atau seluruh CMS tree. Brand wajib active + published, record wajib published; property soft-deleted disembunyikan. Banner diurutkan position lalu id, resources lain id.

Pagination semua list: `page` >= 1, `per_page` 1–100 (default 20), envelope `data`, `links`, `meta`. Banners tanpa page_id public mendapat 422; page tidak ada/cross-tenant/draft/scheduled mendapat 404. Query status/search untuk resource outlet belum disediakan (jangan mengandalkan filter yang tidak didokumentasikan).

## Seeder aman dan deployment

Seeder opt-in: `php artisan db:seed --class=BrandDemoSeeder` setelah operator melakukan backup + additive migration. **Tidak dijalankan pada DB aplikasi selama implementasi ini.** Membuat `outlet-1` sampai `outlet-6` inactive/draft; idempotent, tidak mengubah brand existing termasuk soft-deleted, tidak membuat user/admin/password/membership, selalu clear CompanyContext. Gunakan pengelolaan user/membership existing untuk assignment admin asli. DatabaseSeeder dan CompanyDemoSeeder lama tidak diubah.

Migration baru `2026_10_05_000002`–`000006` additive; jangan migrate:fresh di DB existing. Down menghapus metadata/tabel tambahan dan bukan prosedur produksi. Suite tests memakai SQLite in-memory; MySQL/MariaDB staging tetap perlu verifikasi FK dan concurrent writers.
