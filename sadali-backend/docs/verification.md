# Hasil verifikasi backend CMS

Pemeriksaan pada 1 Oktober 2026, PHP 8.5.9 Laragon di Windows melalui WSL. Laravel framework mendukung PHP 8.3, tetapi composer.lock saat ini memuat Symfony 8.1 yang mensyaratkan PHP ≥8.4.1; runtime PHP 8.3 belum kompatibel dengan lock ini. `.env` aplikasi tetap memakai konfigurasi sebelumnya; tidak ada migration/seed yang dijalankan pada database aplikasi.

| Pemeriksaan | Hasil |
| --- | --- |
| Suite backend lengkap, PHPUnit | **Lulus: 113 test, 606 assertion** |
| PHPStan/Larastan konfigurasi repository, level 7 | **Lulus: 0 error** |
| Registrasi route API | **Lulus: 28 route template**, termasuk CRUD dinamis untuk pages/products/articles/sections |
| Migration dan seeder demo | **Lulus melalui RefreshDatabase SQLite in-memory**, seeder idempotent diperiksa dua kali |
| Format Laravel Pint | **Lulus: 135 file**, tanpa masalah format |
| Build frontend starter | **Belum berhasil**: native binding Vite Plus Linux tidak tersedia dalam node_modules yang ada |
| MySQL/MariaDB nyata | **Belum dijalankan**; perlu database staging/disposable dan konfigurasi koneksi tersendiri |
| Migration/seed pada database aplikasi | **Tidak dijalankan**, untuk mempertahankan data/configuration yang sudah ada |
| UI CMS khusus company / website publik | Belum dibangun; backend menyediakan kontrak untuk integrasi frontend |

Command test yang benar-benar dijalankan dari projects/backend-rbi:

```bash
/mnt/c/laragon/bin/php/php-8.5.9-nts-Win32-vs17-x64/php.exe \
  -d extension=pdo_sqlite -d extension=sqlite3 \
  vendor/phpunit/phpunit/phpunit

/mnt/c/laragon/bin/php/php-8.5.9-nts-Win32-vs17-x64/php.exe \
  vendor/phpstan/phpstan/phpstan analyse --no-progress --error-format=raw

/mnt/c/laragon/bin/php/php-8.5.9-nts-Win32-vs17-x64/php.exe \
  vendor/laravel/pint/builds/pint --test

/mnt/c/laragon/bin/php/php-8.5.9-nts-Win32-vs17-x64/php.exe \
  artisan route:list --path=api/v1
```

Ekstensi SQLite diaktifkan hanya pada proses test, tanpa mengubah php.ini. TestCase menggunakan `withoutVite()` agar assertion backend dan halaman starter dapat berjalan tanpa asset build; ini tidak memverifikasi rendering React di browser.

22 test CMS baru mencakup:

- Login Fortify, password salah, logout, akses tanpa login dan tanpa membership.
- company_admin vs company_editor, perbedaan role pada dua membership, pengelolaan pusat dan bootstrap super admin via console.
- CRUD page/product/article, keunikan slug per tenant, pagination dan log aktivitas.
- Penolakan URL perusahaan lain dan ID record lain untuk read/update/delete; penolakan company_id palsu serta foreign media/page_id pada body.
- Scope kosong tanpa konteks, foreign key gabungan yang menolak referensi silang langsung di database.
- Publikasi draft/published/archived, jadwal masa depan, konversi timezone, company inactive/draft/deleted, product hidden dan section pada halaman draft.
- Larangan editor mengubah/hapus published content dan section pada halaman published.
- Tema/font/URL/config aman, HTML/JavaScript ditolak, harga/legal opsional, legal tidak tampil publik.
- Upload PNG privat, MIME dan ukuran tidak valid ditolak, file draft tersembunyi, file published tersedia, file referenced tidak dapat dihapus.
- CSRF nyata untuk mutation (bypass khusus environment testing dimatikan pada test tersebut), rate limiting publik dan header Retry-After.
- Quota feature_limits, membership assignment/revoke, delete user, larangan menghapus/mencabut super admin sendiri, idempotensi demo seeder.

Kegagalan selama pengembangan: driver SQLite belum aktif; dua assertion awal (status upsert profil dan payload section kosong) diperbaiki; suite starter terhalang manifest Vite dan diselesaikan dengan setup test backend withoutVite; import Product pada dua test tambahan diperbaiki; PHPStan/anotasi dan format dibenahi. Hasil suite lengkap terakhir lulus seluruhnya. Build frontend tetap mempunyai hambatan dependency native yang terpisah.

Sebelum deployment, jalankan migration, seed yang sesuai lingkungan, test isolasi dan concurrency quota pada database **disposable MySQL/MariaDB**. Jangan gunakan database aplikasi yang berisi data untuk RefreshDatabase. Deployment produksi memerlukan konfigurasi environment, backup, private storage, HTTPS dan APP_DEBUG=false sesuai README/architecture.


## Pemeriksaan setelah optimasi storage dan query

Suite terbaru: **113 test / 606 assertion lulus**. Lima test tambahan membuktikan URL cloud hanya dibuat setelah pemeriksaan tenant/publikasi, query media publik hanya satu round trip dan tetap scoped, daftar tidak memuat body tetapi detail tetap lengkap, upload tidak menambah level transaksi saat transfer file dan file quota gagal dibersihkan, serta adapter S3 nyata menghasilkan URL HTTPS bertanda tangan memakai credential fiktif tanpa menghubungi cloud.

Adapter S3 terpasang lewat Composer (lock tersimpan). Composer melaporkan tidak ada advisory keamanan pada pemeriksaan instalasi; Composer Laragon lama menghasilkan deprecation warning pada PHP 8.5 namun perintah berhasil. Cloud bucket/credential nyata **belum dihubungkan**, upload/download ke R2/S3 nyata belum diuji. Migration index/metadata baru diuji di SQLite melalui RefreshDatabase; belum diterapkan ke database aplikasi dan belum diperiksa EXPLAIN pada MySQL. CDN, Redis dan compression/resize image belum diaktifkan. Lihat [struktur optimasi](optimization.md).
