# Ekstraksi CMS Acala dari aplikasi full-stack

## Sumber dan batas data

Sumber dibaca dari `C:/laragon/www/acala-barbistro-rebuild`; aplikasi tersebut tidak diedit. Outlet tujuan bernama **Acala**, slug **acala**, workspace **`/cms/acala`**. Cabang Nusa Dua dan Nusa Lembongan tetap menjadi data lokasi di bawah satu brand Acala, bukan dua tenant baru.

Database CMS sumber tidak dapat diekspor: `.env`, file SQLite/dump database, dan `vendor/autoload.php` tidak tersedia. Snapshot ini mengambil **data yang benar-benar terdapat dalam repository sumber**, bukan mengklaim perubahan terakhir dari database live.

Berkas sumber:

- `database/seeders/CmsDataSeeder.php`: 51 blok konten pada 10 halaman.
- `database/seeders/data/cms_datasets.json`: 15 dataset beserta label, deskripsi, urutan dan status publikasi yang tersedia.
- `database/migrations/2026_08_05_000001_create_cms_images_table.php`: 32 slot gambar.

Seeder PHP tidak dijalankan. Array literal diekstrak melalui AST dengan penolakan ekspresi executable. Nilai JSON dataset diambil langsung dari file; seeder dataset lama tidak disalin karena merujuk lokasi/format JSON yang berbeda dari berkas repository sebenarnya.

## Artifact

- `database/data/acala/source.json`: snapshot dengan provenance dan SHA-256 setiap berkas sumber.
- `database/data/acala/assets-manifest.json`: pemetaan URL aset, checksum aset yang disalin, dan daftar referensi yang hilang.
- `public/outlet-assets/acala/`: 32 referensi aset yang tersedia telah disalin dan diperiksa checksum terhadap sumber. Hanya referensi berkas publik gambar/PDF yang diambil; tidak menyalin `.env`, auth, private storage, service-account, atau kode aplikasi.

Satu referensi gambar tidak tersedia di sumber: `/Branch/Acala nusa dua/DSC03517.jpg`. Referensi tersebut dipertahankan dan dilaporkan, tidak diganti dengan gambar lain secara diam-diam. Lengkapi berkas ini atau ubah kontennya lewat CMS sebelum mengaktifkan frontend publik.

## Data yang dipertahankan

Blok Acala memakai `page` + `section` dan field asli: `label`, `eyebrow`, `title`, `subtitle`, `body`, `image`, `cta_label`, `cta_url`, `metadata`, `sort_order`, `is_published`. Ini bukan konversi lossy ke lima field section generic.

Dataset: `branches`, `branch_booking_urls`, `contact_links`, `booking_actions`, `booking_action_cards`, `blog_highlights`, `hero_collage_images`, `branch_moments`, `gallery_branches`, `reviews`, `menu_categories`, `menu_items`, `branch_options`, `branch_usps`, `home_menu_groups`. Nested menu, booking, kontak publik, galeri dan SEO tetap dipertahankan. Struktur array/object dataset tidak dipaksa menjadi object tunggal.

Slot gambar mempertahankan `key`, `group`, `label`, `path`, `alt`. Path aset yang berhasil dipindahkan ditulis ulang menjadi `/outlet-assets/acala/...`; referensi aplikasi seperti `/menu` tidak ditulis ulang sebagai aset. Frontend yang berada di origin berbeda perlu menambahkan origin API untuk path media relatif.

## CMS per-brand, bukan satu template website

`companies.cms_driver` menentukan CMS yang dikodekan untuk brand, bukan memaksakan satu frontend:

- `generic`: CMS yang sudah ada tetap berlaku bagi brand lain.
- `acala`: blok konten, dataset dan slot gambar Acala dengan editor custom.

Backend registry mendefinisikan field/contract driver; registry React memilih editor yang sudah dikodekan. Tidak menjalankan kode/komponen dari database. Brand berikutnya dapat menambahkan driver, validasi dan editor sendiri sambil menggunakan auth, tenant scope, audit dan pemilihan workspace yang sama.

API pengiriman konten tetap dibatasi pada tenant dan halaman/dataset yang diminta. Hindari menyalin pola sumber yang mem-fetch seluruh konten/dataset/gambar ketika website pertama kali dimuat.

Aplikasi frontend Acala sumber masih menggunakan API full-stack lama sampai integrasi API barunya dilakukan secara eksplisit. Menyalin backend tidak otomatis mengubah hook `fetch` sumber. Tidak ada credential/login Google Analytics atau script tracking yang disalin atau dieksekusi. `site_scripts` tidak terdapat pada snapshot ini dan diblokir pada kontrak custom.

Lihat `docs/acala-import.md` untuk command import dan `docs/brand-custom-api.md` (atau dokumentasi API custom yang dihasilkan bersama implementasi) untuk endpoint dan cara menambahkan driver.
