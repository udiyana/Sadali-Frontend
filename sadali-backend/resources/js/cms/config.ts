import {
    Activity,
    BookOpen,
    Building2,
    FileText,
    Image,
    LayoutDashboard,
    Package,
    Settings2,
    Sparkles,
    Users,
    UserRound,
    type LucideIcon,
} from 'lucide-react';
export type Field = {
    key: string;
    label: string;
    type?:
        | 'text'
        | 'textarea'
        | 'email'
        | 'password'
        | 'number'
        | 'select'
        | 'checkbox'
        | 'color'
        | 'url';
    required?: boolean;
    max?: number;
    min?: number;
    pattern?: string;
    options?: string[];
    hint?: string;
};
export type Module = {
    key: string;
    label: string;
    singular: string;
    description: string;
    icon: LucideIcon;
    fields: Field[];
    admin?: boolean;
    readonly?: boolean;
};
const title: Field = { key: 'title', label: 'Judul', required: true, max: 255 };
const slug: Field = {
    key: 'slug',
    label: 'Slug URL',
    required: true,
    max: 120,
    pattern: '[a-z0-9]+(-[a-z0-9]+)*',
    hint: 'Huruf kecil, angka, dan tanda hubung. Contoh: tentang-kami',
};
const status: Field = {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['draft', 'published', 'archived'],
};
const body: Field = {
    key: 'body',
    label: 'Konten',
    type: 'textarea',
    max: 50000,
    hint: 'Teks biasa. HTML dan JavaScript tidak dijalankan.',
};
const seo: Field[] = [
    { key: 'meta_title', label: 'Judul SEO', max: 160 },
    {
        key: 'meta_description',
        label: 'Deskripsi SEO',
        type: 'textarea',
        max: 320,
    },
];
const name: Field = { key: 'name', label: 'Nama', required: true, max: 255 };
const phone: Field = { key: 'phone', label: 'Telepon', max: 30 };
const email: Field = { key: 'email', label: 'Email', type: 'email', max: 255 };
const https: Field = {
    key: 'image_url',
    label: 'URL gambar HTTPS',
    type: 'url',
    required: true,
    max: 500,
    pattern: 'https://.*',
    hint: 'Gunakan URL HTTPS. Gambar tidak diunduh oleh CMS.',
};
export const modules: Module[] = [
    {
        key: 'overview',
        label: 'Ringkasan',
        singular: 'Ringkasan',
        description: 'Satu tempat untuk mengelola semua pengalaman brand Anda.',
        icon: LayoutDashboard,
        fields: [],
    },
    {
        key: 'pages',
        label: 'Halaman',
        singular: 'halaman',
        description: 'Atur konten, SEO, dan susunan section website.',
        icon: FileText,
        fields: [title, slug, status, body, ...seo],
    },
    {
        key: 'articles',
        label: 'Artikel',
        singular: 'artikel',
        description: 'Cerita dan kabar terbaru dari brand Anda.',
        icon: BookOpen,
        fields: [title, slug, status, body, ...seo],
    },
    {
        key: 'products',
        label: 'Produk',
        singular: 'produk',
        description: 'Kelola katalog produk dan paket layanan.',
        icon: Package,
        fields: [
            title,
            slug,
            {
                key: 'kind',
                label: 'Jenis',
                type: 'select',
                options: ['product', 'service'],
            },
            { key: 'category', label: 'Kategori', max: 100 },
            { key: 'price', label: 'Harga', type: 'number', min: 0 },
            { key: 'visible', label: 'Tampilkan di katalog', type: 'checkbox' },
            status,
            body,
            ...seo,
        ],
    },
    {
        key: 'banners',
        label: 'Banner',
        singular: 'banner',
        description: 'Sorotan visual yang terhubung dengan halaman tertentu.',
        icon: Image,
        fields: [
            {
                key: 'page_id',
                label: 'Halaman',
                type: 'select',
                required: true,
            },
            https,
            { key: 'title', label: 'Judul', max: 160 },
            {
                ...https,
                key: 'link_url',
                label: 'URL tautan HTTPS',
                required: false,
            },
            {
                key: 'position',
                label: 'Urutan',
                type: 'number',
                min: 0,
                max: 1000,
            },
            status,
        ],
    },
    {
        key: 'properties',
        label: 'Properti',
        singular: 'properti',
        description: 'Lokasi dan kontak publik untuk outlet Anda.',
        icon: Building2,
        fields: [
            name,
            { key: 'address', label: 'Alamat', type: 'textarea', max: 2000 },
            phone,
            status,
        ],
    },
    {
        key: 'services',
        label: 'Layanan',
        singular: 'layanan',
        description: 'Beri pengunjung gambaran layanan yang Anda tawarkan.',
        icon: Sparkles,
        fields: [
            name,
            {
                key: 'icon',
                label: 'Key ikon',
                max: 80,
                pattern: '[a-z][a-z0-9\\-]*',
                hint: 'Contoh: sparkles, coffee, atau heart. Bukan HTML/URL.',
            },
            {
                key: 'description',
                label: 'Deskripsi',
                type: 'textarea',
                max: 5000,
            },
            status,
        ],
    },
    {
        key: 'guests',
        label: 'Tamu',
        singular: 'tamu',
        description: 'Data kontak privat. Hanya dapat diakses administrator.',
        icon: UserRound,
        admin: true,
        fields: [
            {
                key: 'first_name',
                label: 'Nama depan',
                required: true,
                max: 120,
            },
            { key: 'last_name', label: 'Nama belakang', max: 120 },
            email,
            phone,
        ],
    },
    {
        key: 'profile',
        label: 'Profil brand',
        singular: 'profil',
        description: 'Identitas, informasi kontak, dan metadata website.',
        icon: Building2,
        admin: true,
        fields: [
            {
                key: 'description',
                label: 'Deskripsi brand',
                type: 'textarea',
                max: 5000,
            },
            { key: 'address', label: 'Alamat', type: 'textarea', max: 2000 },
            email,
            phone,
            {
                key: 'whatsapp',
                label: 'WhatsApp',
                pattern: '62[0-9]{8,13}',
                hint: 'Format internasional, diawali 62 tanpa tanda +.',
            },
            ...seo,
        ],
    },
    {
        key: 'settings',
        label: 'Pengaturan',
        singular: 'pengaturan',
        description: 'Identitas brand dan tampilan website, tanpa kode kustom.',
        icon: Settings2,
        admin: true,
        fields: [
            name,
            slug,
            {
                key: 'domain',
                label: 'Domain',
                max: 253,
                pattern: '[a-zA-Z0-9\\-]+(\\.[a-zA-Z0-9\\-]+)+',
                hint: 'Hostname saja, tanpa https:// atau path. Tidak menyiapkan DNS/TLS.',
            },
            {
                ...https,
                key: 'logo_url',
                label: 'URL logo HTTPS',
                required: false,
            },
            status,
            {
                key: 'settings.template',
                label: 'Template',
                type: 'select',
                options: ['simple', 'catalog', 'services'],
            },
            {
                key: 'settings.font',
                label: 'Font website',
                type: 'select',
                options: ['system', 'inter', 'noto-sans'],
            },
            { key: 'settings.primary', label: 'Warna utama', type: 'color' },
            {
                key: 'settings.secondary',
                label: 'Warna sekunder',
                type: 'color',
            },
        ],
    },
    {
        key: 'users',
        label: 'Pengguna',
        singular: 'pengguna',
        description:
            'Kelola akun dan seluruh membership brand. Super admin saja.',
        icon: Users,
        fields: [
            name,
            { ...email, required: true },
            {
                key: 'password',
                label: 'Password baru',
                type: 'password',
                min: 12,
                hint: 'Minimal 12 karakter. Kosongkan saat edit untuk mempertahankan password.',
            },
            {
                key: 'password_confirmation',
                label: 'Konfirmasi password',
                type: 'password',
                min: 12,
            },
        ],
    },
    {
        key: 'activity',
        label: 'Aktivitas',
        singular: 'aktivitas',
        description:
            'Jejak perubahan brand. Log hanya-baca, tanpa nilai data sensitif.',
        icon: Activity,
        readonly: true,
        fields: [],
    },
];
export const sectionModule: Module = {
    key: 'sections',
    label: 'Section',
    singular: 'section',
    description: 'Blok konten yang aman, tanpa HTML atau JavaScript.',
    icon: LayoutDashboard,
    fields: [
        {
            key: 'type',
            label: 'Jenis section',
            type: 'select',
            required: true,
            options: [
                'hero',
                'text',
                'products',
                'gallery',
                'contact',
                'articles',
            ],
        },
        { key: 'position', label: 'Urutan', type: 'number', min: 0, max: 1000 },
        { key: 'visible', label: 'Tampilkan section', type: 'checkbox' },
        { key: 'config.heading', label: 'Heading', max: 160 },
        { key: 'config.text', label: 'Teks', type: 'textarea', max: 10000 },
        { key: 'config.button_label', label: 'Label tombol', max: 80 },
        {
            key: 'config.button_url',
            label: 'URL tombol HTTPS',
            type: 'url',
            pattern: 'https://.*',
            max: 500,
        },
        {
            key: 'config.limit',
            label: 'Batas item',
            type: 'number',
            min: 1,
            max: 24,
        },
    ],
};
