# Kontrak API v1

## Autentikasi dan format

Base CMS `/api/v1/cms`, base publik `/api/v1/public`. Semua CMS memakai cookie session Fortify; gunakan origin aplikasi yang sama. `GET /login` memulai session dan memberi cookie XSRF-TOKEN. `POST /login` dengan email/password, header `Accept: application/json` dan `X-XSRF-TOKEN` (nilai cookie yang sudah URL-decoded) memperoleh session terautentikasi; dua-factor memakai alur Fortify jika diaktifkan. `POST /logout` mencabut session. GET CMS tidak membutuhkan CSRF, POST/PUT/PATCH/DELETE wajib CSRF. Gunakan `credentials: same-origin` pada fetch. Middleware CSRF tidak dinonaktifkan untuk endpoint API.

Untuk browser Axios pada origin sama, pengiriman XSRF-TOKEN otomatis tersedia. Fetch membutuhkan header X-XSRF-TOKEN eksplisit. Tidak ada Bearer token CMS dalam MVP. Endpoint publik anonim hanya GET; gunakan frontend server untuk origin berbeda. Registrasi Fortify tidak memberikan membership atau super admin.

Role: **S** super_admin (`users.is_super_admin`), **A** company_admin, **E** company_editor. Role A/E ada pada `company_user` untuk company terkait. Semua akses company CMS melewati membership; S dapat memilih company apa pun tetapi tetap memakai scope ID yang dipilih. A/E tidak bisa mengganti company_id di body. Company di URL CMS menggunakan ID numerik, publik menggunakan slug.

Respons detail memakai `{"data": {...}}`, list konten/company/media/activity memakai `data`, `links`, `meta`. List user memakai paginator Laravel `data/current_page/per_page/...`. DELETE berhasil 204. Create 201. Update/profile PUT 200. Angka harga dikembalikan string decimal dengan dua angka desimal, null jika tidak diisi. Semua waktu API ISO-8601 UTC; input jadwal menerima timestamp dengan offset dan dinormalisasi ke UTC. Status enum draft/published/archived.

Error `/api/v1/*`:

```json
{
  "message": "Periksa kembali data yang diisi.",
  "errors": { "slug": ["Nilai slug sudah digunakan."] }
}
```

Pesan validasi utama dan teks bebas memiliki petunjuk Indonesia; validator yang belum mempunyai pesan khusus mengikuti locale Laravel (default starter en). API selalu konsisten meski tidak ada header Accept. Error tanpa field memakai `errors: {}`. Status 401 belum login, 403 role tidak sesuai, 404 data/akses tenant tidak ditemukan, 409 media masih digunakan, 419 CSRF/session kedaluwarsa, 422 input/quota, 429 throttle, 500 kegagalan internal tanpa stack trace/SQL. Header Retry-After throttle dipertahankan.

## Company dan profil

| Metode | Path setelah `/api/v1/cms` | Authorization | Parameter/body utama |
| --- | --- | --- | --- |
| GET | /companies | S/A/E | page, per_page 1–100, default 20; hanya company yang boleh diakses |
| POST | /companies | S | name, slug wajib; active false, status draft default; plan_key/feature_limits opsional |
| GET | /companies/{id} | S/A/E | ID perusahaan |
| PATCH | /companies/{id} | S/A | name, slug, status; active/plan_key/feature_limits hanya S |
| DELETE | /companies/{id} | S | soft delete, publik dan CMS tenant menjadi 404 |
| GET | /companies/{id}/profile | S/A/E | data profil; kosong jika belum diisi |
| PUT | /companies/{id}/profile | S/A | partial upsert field profil; field yang tidak dikirim tetap, null mengosongkan nullable |

Contoh create company:

```json
{"name":"Usaha Contoh","slug":"usaha-contoh","active":false,"feature_limits":{"pages":20,"products":100,"articles":50,"media":200}}
```

Response 201:

```json
{"data":{"id":1,"name":"Usaha Contoh","slug":"usaha-contoh","active":false,"status":"draft","plan_key":"starter","feature_limits":{"pages":20,"products":100,"articles":50,"media":200},"created_at":"2026-10-01T00:00:00.000000Z","updated_at":"2026-10-01T00:00:00.000000Z"}}
```

Profil:

```json
{
  "description":"Usaha makanan contoh.",
  "address":"Alamat usaha contoh",
  "email":"kontak@example.test",
  "phone":null,
  "whatsapp":"6281234567890",
  "opening_hours":{"mon":{"opens":"08:00","closes":"17:00","closed":false},"sun":{"closed":true}},
  "social_links":{"website":"https://example.test"},
  "legal":{"business_name":"Usaha Contoh","nib":"CONTOH"},
  "theme":{"primary":"#166534","accent":"#f59e0b","font":"system","template":"simple"},
  "logo_media_id":null,
  "cover_media_id":null,
  "share_media_id":null,
  "meta_title":"Usaha Contoh",
  "meta_description":"Produk dan layanan usaha contoh."
}
```

`whatsapp` hanya format 62 + 8–13 digit berikutnya. Resource menambahkan whatsapp_url `https://wa.me/...`. Hari opening_hours mon/tue/wed/thu/fri/sat/sun; social_links hanya instagram/facebook/tiktok/youtube/website, URL HTTPS. Legal opsional business_name/nib/npwp dan tidak dikirim publik. Theme font system/inter/noto-sans, template simple/catalog/services, warna hex enam digit. JSON nested dengan key tambahan ditolak; konfigurasi nested yang dikirim menggantikan objek tersebut (bukan deep merge).

## Halaman, produk/layanan, artikel dan section

Path `C = /api/v1/cms/companies/{id}`; `type = pages | products | articles | sections`.

| Metode | Path | Authorization | Parameter/body utama |
| --- | --- | --- | --- |
| GET | C/{type} | S/A/E | page/per_page; status & search untuk konten; page_id untuk section |
| POST | C/{type} | S/A/E | title/slug untuk konten; page_id/type/config untuk section; role A/S wajib jika publikasi |
| GET | C/{type}/{recordId} | S/A/E | ID scoped |
| PATCH | C/{type}/{recordId} | S/A/E | field yang berubah; A/S wajib jika konten lama published, status baru published, atau jadwal diset |
| DELETE | C/{type}/{recordId} | S/A/E | A/S untuk konten published dan section halaman published |

Pages/articles/products memiliki title (1–255), slug (huruf kecil/angka/hyphen, maksimal 120, unik per company dan type), body teks biasa ≤50.000, status default draft, published_at nullable, image_media_id milik company, meta_title ≤160, meta_description ≤320. Produk/layanan memiliki kind product/service, category opsional ≤100, price opsional ≥0, visible boolean default true. Tidak ada HTML atau JavaScript bebas.

Contoh POST C/products:

```json
{"title":"Paket Contoh","slug":"paket-contoh","kind":"service","category":"Jasa","body":"Layanan untuk demonstrasi.","price":null,"status":"draft","visible":true}
```

Contoh response:

```json
{"data":{"id":4,"company_id":1,"title":"Paket Contoh","slug":"paket-contoh","kind":"service","category":"Jasa","body":"Layanan untuk demonstrasi.","price":null,"status":"draft","published_at":null,"visible":true,"image_media_id":null,"meta_title":null,"meta_description":null,"created_at":"2026-10-01T00:00:00.000000Z","updated_at":"2026-10-01T00:00:00.000000Z"}}
```

Publikasi terjadwal: PATCH C/articles/4 dengan `{"status":"published","published_at":"2026-10-02T09:00:00+08:00"}`; baru muncul publik pada 2026-10-02 01:00 UTC. Jadwal kosong artinya terbit langsung saat published. Untuk membatalkan jadwal, kirim published_at null; untuk menyembunyikan konten, status draft/archived. Editor tidak dapat mengedit konten scheduled karena statusnya published.

Sections memakai type hero/text/products/gallery/contact/articles, page_id perusahaan yang sama, position 0–1000, visible default true, config hanya heading/text/button_label/button_url/limit. URL tombol HTTPS; limit 1–24. Image memakai image_media_id terpisah agar FK/scoping dapat diverifikasi. Contoh:

```json
{"page_id":1,"type":"hero","position":0,"visible":true,"config":{"heading":"Selamat datang","text":"Usaha contoh","button_label":"Lihat produk","button_url":"https://example.test/produk"},"image_media_id":null}
```

Ubah urutan dengan PATCH position pada section; posisi sama diurutkan lagi berdasarkan ID. Section pada page draft tidak muncul publik walaupun visible true. Section tersembunyi tidak muncul publik.

Daftar pages/products/articles tidak memuat body untuk menjaga response ringan; gunakan endpoint detail untuk body lengkap.

List response:

```json
{"data":[],"links":{"first":"http://localhost:8000/api/v1/cms/companies/1/articles?page=1","last":"http://localhost:8000/api/v1/cms/companies/1/articles?page=1","prev":null,"next":null},"meta":{"current_page":1,"from":null,"last_page":1,"path":"http://localhost:8000/api/v1/cms/companies/1/articles","per_page":20,"to":null,"total":0}}
```

Resource Laravel juga menambahkan daftar navigasi `meta.links`.

## Media, pengguna dan aktivitas

| Metode | Path setelah `/api/v1/cms` | Authorization | Parameter/body utama |
| --- | --- | --- | --- |
| GET | /companies/{id}/media | S/A/E | page/per_page |
| POST | /companies/{id}/media | S/A/E | multipart file, alt opsional; JPEG/PNG/WebP ≤5 MiB, dimensi ≤8000 |
| GET | /companies/{id}/media/{mediaId}/file | S/A/E | stream privat atau redirect cloud 302 jika diaktifkan; no-store |
| DELETE | /companies/{id}/media/{mediaId} | S/A | 409 jika direferensikan; 204 jika terhapus |
| GET | /users | S | page/per_page; pengguna dengan membership |
| POST | /users | S | name/email/password/password_confirmation; password ≥12; is_super_admin, memberships opsional |
| GET | /users/{userId} | S | data aman & memberships |
| PATCH | /users/{userId} | S | name/email/password/is_super_admin/memberships; memberships menggantikan seluruh akses company |
| DELETE | /users/{userId} | S | dilarang untuk super admin; cabut role lewat admin lain terlebih dahulu |
| GET | /activity | S | page/per_page, log semua company dan aksi pusat |
| GET | /companies/{id}/activity | S/A/E | page/per_page, hanya log company yang dipilih |

Media response:

```json
{"data":{"id":7,"company_id":1,"mime":"image/png","size":12800,"alt":"Foto contoh","url":"http://localhost:8000/api/v1/cms/companies/1/media/7/file","created_at":"2026-10-01T00:00:00.000000Z","updated_at":"2026-10-01T00:00:00.000000Z"}}
```

Resource konten/profil menambahkan image_url/logo_url/cover_url/share_url jika ID media tersedia. Path/disk tidak dikirim ke klien. Upload tidak menerima URL eksternal atau storage path dari user.

Membership request:

```json
{"memberships":[{"company_id":1,"role":"company_admin"},{"company_id":2,"role":"company_editor"}]}
```

Password/hash/secret two-factor tidak dikirim. PATCH tanpa memberships mempertahankan akses; `memberships: []` mencabut semuanya. Super admin tidak bisa mencabut akses global dirinya sendiri. Activity changes berisi nama field, tidak berisi nilai password/kontak/legal:

```json
{"data":[{"id":1,"company_id":1,"actor_id":2,"action":"profile.updated","subject_type":"CompanyProfile","subject_id":1,"changes":{"fields":["description"]},"created_at":"2026-10-01T00:00:00.000000Z","updated_at":"2026-10-01T00:00:00.000000Z"}],"links":{},"meta":{"current_page":1,"per_page":20,"total":1}}
```

## Website publik

`P = /api/v1/public/companies/{companySlug}`. Semua anonim, throttle 60/menit/IP; company active + published wajib, termasuk endpoint media.

| Metode | Path | Filter/parameter utama |
| --- | --- | --- |
| GET | P | company dan profile aman untuk publik |
| GET | P/pages | published dan jadwal terlewati, page/per_page |
| GET | P/pages/{slug} | detail halaman published |
| GET | P/pages/{slug}/sections | halaman published, hanya section visible, urut position/id, page/per_page |
| GET | P/products | published + visible, page/per_page |
| GET | P/products/{slug} | detail produk/layanan published + visible |
| GET | P/articles | published dan jadwal terlewati, page/per_page |
| GET | P/articles/{slug} | detail artikel published |
| GET | P/media/{id}/file | hanya media yang direferensikan profil atau konten/section publik; stream/redirect sesuai disk |

Contoh response P (dipersingkat):

```json
{"data":{"company":{"id":1,"name":"Usaha Contoh","slug":"usaha-contoh","active":true,"status":"published","created_at":"2026-10-01T00:00:00.000000Z","updated_at":"2026-10-01T00:00:00.000000Z"},"profile":{"description":"Usaha contoh","whatsapp":"6281234567890","whatsapp_url":"https://wa.me/6281234567890","theme":{"primary":"#166534","accent":"#f59e0b","font":"system","template":"simple"}}}}
```

Draft/archived, scheduled di masa depan, company inactive/deleted dan ID tenant lain mendapat 404 pada detail/file atau tidak muncul dalam list. Query status pada endpoint publik tidak dapat membuka draft. Field legal/plan_key/feature_limits/company_id dihilangkan dari resource publik.

Mode cloud, TTL signed URL dan metadata width/height dijelaskan pada [struktur optimasi](optimization.md).
