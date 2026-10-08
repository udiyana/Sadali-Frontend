# Pemanggilan CMS per halaman

Backend mempertahankan tenant `companies` yang sudah ada. Path `brands` menunjuk tenant yang sama, bukan menyalin database. ID tetap integer agar auth, relasi, dan konten lama kompatibel; berbeda dari rancangan UUID pada ERD. Satu brand mempunyai banyak page, setiap page mempunyai section sendiri. Customisasi konten dilakukan melalui susunan section dan config JSON yang tervalidasi, bukan HTML/JavaScript/template yang dieksekusi dari database.

## Website publik: satu halaman, satu request utama

```http
GET /api/v1/public/brands/outlet-1/pages/home/render
Accept: application/json
```

Struktur respons: `data.company`, `data.profile`, `data.page`, `data.sections`, `meta`, `links`. Company/profile dipakai untuk identitas dan tema. Page memuat body dan metadata hanya halaman terpilih. Sections hanya milik page tersebut, hanya visible, urutan position lalu ID. Tidak otomatis menyertakan products/articles/properties/services/banners/guests atau halaman lain. Data legal tidak dikirim publik. Hanya brand aktif + published dan page published yang jadwalnya sudah lewat dapat dibaca.

Sections default **24**, maksimum **100** per request. `?per_page=24&page=2` melanjutkan sections. `meta` berisi current_page, per_page, total, last_page, has_more. `links.next`/`links.prev` menyediakan kelanjutan. Tidak ada truncation diam-diam: frontend harus mengikuti next jika ingin seluruh section halaman yang panjang. Parameter tidak valid menghasilkan 422.

```js
// Path relatif untuk frontend same-origin; untuk frontend lain gunakan proxy server.
async function loadPage(brandSlug, pageSlug, signal) {
  const path = `/api/v1/public/brands/${encodeURIComponent(brandSlug)}/pages/${encodeURIComponent(pageSlug)}/render`;
  const response = await fetch(path, { headers: { Accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`Gagal memuat halaman (${response.status})`);
  return response.json();
}
```

API publik anonim tidak mengaktifkan CORS lintas origin secara otomatis. Gunakan server frontend/proxy; konfigurasi origin browser yang diizinkan perlu ditentukan saat deployment. Jangan render teks konten sebagai HTML mentah.

## CMS: buka editor hanya halaman terpilih

```http
GET /api/v1/cms/brands/1/pages/12/editor?per_page=24
```

Session Fortify dan membership brand wajib. Response `data.page` dan `data.sections` mencakup draft/hidden untuk editing; section tetap dibatasi/paginated. Tidak mengirim daftar guests, resource brand lain, atau seluruh koleksi CMS. User tanpa membership dan ID page milik brand lain menerima 404; tanpa login 401. Mutasi memakai endpoint pages/sections lama dengan proteksi CSRF dan role server yang sama.

## Navigasi: daftar halaman ringan

```http
GET /api/v1/cms/brands/1/pages?per_page=20
GET /api/v1/public/brands/outlet-1/pages?per_page=20
```

Daftar page default `view=summary`: ID, title, slug, status, jadwal, metadata gambar/SEO, timestamps. Kolom body **tidak diambil pada SQL**, bukan sekadar disembunyikan di JSON. Tidak ada eager load sections. Klik halaman kemudian fetch editor/render. `?view=full` tersedia untuk kompatibilitas jika integrasi benar-benar membutuhkan body pada daftar. Endpoint detail page tetap memberi body penuh. Validasi view hanya summary/full. Path companies memiliki perilaku yang sama.

## Batas desain

- Enam outlet bukan enam database/aplikasi. Scope tenant membatasi setiap request. Tidak ada batas hard-code enam sehingga brand baru bisa ditambahkan kelak.
- Pages dengan slug sama pada brand berbeda diperbolehkan; unik per tenant.
- Render/editor bukan mega-endpoint. Koleksi layanan/properti/banner dipanggil hanya bila komponen halaman memerlukannya; gunakan pagination/filter halaman pada kontrak resource yang tersedia.
- Konfigurasi schema/field bisnis khusus enam outlet belum diberikan; implementasi menyediakan fondasi sections/config yang aman, bukan klaim semua variasi bisnis final.
- Tidak ada cache respons jangka panjang yang berisiko menampilkan draft setelah unpublished. Optimasi utama adalah scope halaman, query kolom ringan dan pagination. CDN/cache produksi membutuhkan invalidasi dan penanganan published_at sebelum diaktifkan.
- Migration aplikasi, seed ke database nyata, UI admin, deployment MySQL, dan integrasi frontend bukan bagian yang otomatis dijalankan. Tes backend memakai SQLite in-memory.
