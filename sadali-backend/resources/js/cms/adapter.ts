export type RecordData = { id: number; [key: string]: unknown };
export type Envelope = {
    data: RecordData[] | RecordData | null;
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    links?: Record<string, string | null>;
};
export type RequestOptions = {
    method?: string;
    body?: Record<string, unknown>;
    query?: Record<string, string | number>;
    signal?: AbortSignal;
};
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type Options = {
    demo: boolean;
    storage?: StorageLike;
    fetcher?: typeof fetch;
    cookie?: () => string;
};
export class ApiError extends Error {
    status: number;
    fields: Record<string, string[]>;
    constructor(
        status: number,
        message: string,
        fields: Record<string, string[]> = {},
    ) {
        super(message);
        this.status = status;
        this.fields = fields;
    }
}
export function permissions(
    user: { id: number; is_super_admin: boolean } | null,
    role?: string,
) {
    const superAdmin = Boolean(user?.is_super_admin);
    const admin = Boolean(user) && (superAdmin || role === 'company_admin');
    const editor = Boolean(user) && role === 'company_editor';
    return {
        admin,
        superAdmin,
        canEdit: (record?: RecordData, page?: RecordData) =>
            admin ||
            (editor &&
                record?.status !== 'published' &&
                page?.status !== 'published'),
    };
}
export const DEMO_KEY = 'rbi.cms.demo.v1';
export const demoBrands: RecordData[] = [
    {
        id: 1,
        name: 'Nusa Stay',
        slug: 'nusa-stay',
        status: 'published',
        active: true,
        initials: 'NS',
        description: 'Ruang singgah, pengalaman menginap yang hangat.',
        settings: {
            template: 'catalog',
            font: 'system',
            primary: '#087f72',
            secondary: '#e6f2ed',
        },
    },
    {
        id: 2,
        name: 'Sora Kitchen',
        slug: 'sora-kitchen',
        status: 'draft',
        active: false,
        initials: 'SK',
        description: 'Hidangan musiman dan cerita dari dapur.',
        settings: {
            template: 'catalog',
            font: 'inter',
            primary: '#a56436',
            secondary: '#f8eee4',
        },
    },
    {
        id: 3,
        name: 'Aruna Wellness',
        slug: 'aruna-wellness',
        status: 'published',
        active: true,
        initials: 'AW',
        description: 'Perawatan mindful untuk keseimbangan sehari-hari.',
        settings: {
            template: 'services',
            font: 'noto-sans',
            primary: '#726095',
            secondary: '#f0eaf7',
        },
    },
];
const scalar = (value: unknown): string =>
    typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : '';
type DemoState = Record<string, RecordData[]>;
function initialState(): DemoState {
    const state: DemoState = {
        brands: structuredClone(demoBrands),
        users: [
            {
                id: 1,
                name: 'Admin Demo',
                email: 'admin@example.test',
                is_super_admin: true,
                memberships: [],
            },
        ],
    };
    for (const brand of demoBrands) {
        const brandName = scalar(brand.name);
        const id = brand.id;
        const base = `brands/${id}`;
        state[`${base}/pages`] = [
            'Beranda',
            'Tentang kami',
            'Kontak',
            'Pengalaman',
            'Pertanyaan umum',
        ].map((title, index) => ({
            id: id * 100 + index + 1,
            title,
            slug: ['home', 'tentang', 'kontak', 'pengalaman', 'faq'][index],
            body: `Contoh konten ${title.toLowerCase()} untuk ${brandName}. Seluruh data ini fiktif.`,
            status: index === 3 ? 'draft' : 'published',
            meta_title: title,
            meta_description: `Kenali ${brandName}.`,
            updated_at: '2026-10-05T08:00:00Z',
        }));
        const pageId = id * 100 + 1;
        state[`${base}/sections`] = [
            {
                id: id * 1000 + 1,
                page_id: pageId,
                type: 'hero',
                position: 0,
                visible: true,
                config: {
                    heading: `Selamat datang di ${brandName}`,
                    text: brand.description,
                },
            },
            {
                id: id * 1000 + 2,
                page_id: pageId,
                type: 'text',
                position: 1,
                visible: true,
                config: {
                    heading: 'Cerita kami',
                    text: 'Ruang untuk cerita dan pengalaman baru. Konten contoh, bukan bisnis nyata.',
                },
            },
        ];
        state[`${base}/services`] = (
            id === 1
                ? ['Airport transfer', 'Sarapan kamar', 'Tur lingkungan']
                : id === 2
                  ? ['Private dining', 'Katering acara', 'Kelas memasak']
                  : [
                        'Konsultasi wellness',
                        'Yoga privat',
                        'Perawatan relaksasi',
                    ]
        ).map((name, i) => ({
            id: id * 100 + i + 1,
            name,
            icon: 'sparkles',
            description: 'Layanan fiktif untuk demonstrasi CMS.',
            status: i === 2 ? 'draft' : 'published',
        }));
        state[`${base}/properties`] = [
            {
                id: id * 100 + 1,
                name: `${brandName} — Studio utama`,
                address: 'Alamat contoh — bukan lokasi operasional',
                phone: null,
                status: 'published',
            },
        ];
        state[`${base}/guests`] = [
            {
                id: id * 100 + 1,
                first_name: 'Tamu',
                last_name: 'Contoh',
                email: 'guest@example.test',
                phone: null,
            },
        ];
        state[`${base}/banners`] = [];
        state[`${base}/products`] = [
            {
                id: id * 100 + 1,
                title: 'Paket pengalaman',
                slug: 'paket-pengalaman',
                kind: 'service',
                category: 'Pilihan',
                body: 'Paket fiktif. Harga belum ditetapkan.',
                price: null,
                visible: true,
                status: 'draft',
            },
        ];
        state[`${base}/articles`] = [
            {
                id: id * 100 + 1,
                title: 'Awal cerita kami',
                slug: 'awal-cerita',
                body: 'Cerita fiktif untuk contoh pengelolaan artikel.',
                status: 'draft',
            },
        ];
        state[`${base}/profile`] = [
            {
                id,
                description: scalar(brand.description),
                email: 'hello@example.test',
                address: '',
                phone: '',
                whatsapp: '',
                meta_title: brand.name,
                meta_description: brand.description,
            },
        ];
        state[`${base}/activity`] = [
            {
                id: id * 100 + 1,
                action: 'page.updated',
                subject_type: 'Page',
                subject_id: pageId,
                created_at: '2026-10-05T08:00:00Z',
                changes: { fields: ['title'] },
            },
        ];
    }
    return state;
}
export function createAdapter(options: Options) {
    let state = initialState();
    if (options.demo && options.storage) {
        try {
            const saved = options.storage.getItem(DEMO_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed.brands) && parsed.brands.length === 3)
                    state = parsed;
            }
        } catch {
            /* Invalid local data is discarded, never replaced by live data. */
        }
    }
    return {
        async request(
            path: string,
            _request: RequestOptions = {},
        ): Promise<Envelope> {
            if (!options.demo) {
                const method = _request.method ?? 'GET';
                const headers: Record<string, string> = {
                    Accept: 'application/json',
                };
                if (method !== 'GET') {
                    headers['Content-Type'] = 'application/json';
                    const cookie = (options.cookie?.() ?? document.cookie)
                        .split('; ')
                        .find((value) => value.startsWith('XSRF-TOKEN='));
                    if (cookie)
                        headers['X-XSRF-TOKEN'] = decodeURIComponent(
                            cookie.slice(11),
                        );
                }
                const query = new URLSearchParams(
                    Object.entries(_request.query ?? {}).map(([key, value]) => [
                        key,
                        String(value),
                    ]),
                );
                const response = await (options.fetcher ?? fetch)(
                    `/api/v1/cms/${path}${query.size ? `?${query}` : ''}`,
                    {
                        method,
                        headers,
                        credentials: 'same-origin',
                        signal: _request.signal,
                        body: _request.body
                            ? JSON.stringify(_request.body)
                            : undefined,
                    },
                );
                if (response.status === 204) return { data: null };
                const payload = await response.json().catch(() => {
                    throw new ApiError(
                        response.status,
                        'Respons API bukan JSON. Session mungkin kedaluwarsa; muat ulang atau login kembali.',
                    );
                });
                if (payload.current_page && !payload.meta)
                    payload.meta = {
                        current_page: payload.current_page,
                        last_page: payload.last_page,
                        total: payload.total,
                        per_page: payload.per_page,
                    };
                if (!response.ok)
                    throw new ApiError(
                        response.status,
                        payload.message ??
                            `Permintaan gagal (${response.status}).`,
                        payload.errors ?? {},
                    );
                return payload;
            }
            const method = _request.method ?? 'GET';
            const parts = path.split('/');
            const editor = parts.at(-1) === 'editor';
            if (editor) parts.pop();
            const hasId = /^\d+$/.test(parts.at(-1) ?? '');
            const recordId = hasId ? Number(parts.pop()) : undefined;
            const key = parts.join('/');
            const collection = state[key];
            if (!collection)
                throw new ApiError(404, 'Data contoh tidak ditemukan.');
            const record =
                recordId === undefined
                    ? undefined
                    : collection.find((item) => item.id === recordId);
            if (recordId !== undefined && !record)
                throw new ApiError(404, 'Data tidak ditemukan di brand ini.');
            const body = { ..._request.body };
            delete body.password;
            delete body.password_confirmation;
            if (method !== 'GET') {
                if (
                    key === 'brands' &&
                    (method === 'POST' || method === 'DELETE')
                )
                    throw new ApiError(
                        403,
                        'Demo selalu memiliki tepat tiga brand.',
                    );
                const errors: Record<string, string[]> = {};
                const content = ['pages', 'articles', 'products'].includes(
                    parts.at(-1) ?? '',
                );
                if (content) {
                    if (
                        (method === 'POST' || 'title' in body) &&
                        !scalar(body.title).trim()
                    )
                        errors.title = ['Judul wajib diisi.'];
                    if (
                        (method === 'POST' || 'slug' in body) &&
                        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scalar(body.slug))
                    )
                        errors.slug = [
                            'Gunakan slug huruf kecil, angka, dan tanda hubung.',
                        ];
                    if (
                        body.slug &&
                        collection.some(
                            (item) =>
                                item.id !== recordId && item.slug === body.slug,
                        )
                    )
                        errors.slug = ['Slug sudah digunakan.'];
                }
                if (Object.keys(errors).length)
                    throw new ApiError(
                        422,
                        'Periksa kembali data yang diisi.',
                        errors,
                    );
                let result: RecordData | null = null;
                if (method === 'POST') {
                    result = {
                        id:
                            Math.max(0, ...collection.map((item) => item.id)) +
                            1,
                        status: 'draft',
                        ...body,
                    };
                    collection.push(result);
                } else if (method === 'DELETE' && record)
                    collection.splice(collection.indexOf(record), 1);
                else if (record) {
                    Object.assign(record, body);
                    result = record;
                } else if (parts.at(-1) === 'profile') {
                    Object.assign(collection[0], body);
                    result = collection[0];
                }
                options.storage?.setItem(DEMO_KEY, JSON.stringify(state));
                return { data: structuredClone(result) };
            }
            const paginate = (rows: RecordData[]) => {
                const page = Math.max(1, Number(_request.query?.page ?? 1));
                const per = Math.min(
                    100,
                    Math.max(1, Number(_request.query?.per_page ?? 20)),
                );
                return {
                    data: structuredClone(
                        rows.slice((page - 1) * per, page * per),
                    ),
                    meta: {
                        current_page: page,
                        last_page: Math.max(1, Math.ceil(rows.length / per)),
                        total: rows.length,
                        per_page: per,
                    },
                };
            };
            if (editor && record) {
                const sections = (
                    state[`brands/${parts[1]}/sections`] ?? []
                ).filter((item) => item.page_id === record.id);
                const result = paginate(sections);
                return {
                    ...result,
                    data: {
                        id: record.id,
                        page: structuredClone(record),
                        sections: result.data,
                    },
                };
            }
            if (record) return { data: structuredClone(record) };
            if (parts.at(-1) === 'profile')
                return { data: structuredClone(collection[0]) };
            let rows = collection;
            if (_request.query?.page_id)
                rows = rows.filter(
                    (item) => item.page_id === Number(_request.query?.page_id),
                );
            if (_request.query?.status)
                rows = rows.filter(
                    (item) => item.status === _request.query?.status,
                );
            if (_request.query?.search)
                rows = rows.filter((item) =>
                    scalar(item.title ?? item.name)
                        .toLowerCase()
                        .includes(String(_request.query?.search).toLowerCase()),
                );
            return paginate(rows);
        },
    };
}
