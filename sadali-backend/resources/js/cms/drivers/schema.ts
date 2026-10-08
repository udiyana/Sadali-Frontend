export type CustomKey = 'content-blocks' | 'datasets' | 'image-slots';
export type CustomField = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'checkbox' | 'json';
    required?: boolean;
    max?: number;
};
export type CustomModule = {
    key: CustomKey;
    label: string;
    fields: CustomField[];
};
export type Definition = {
    driver: 'acala';
    name: string;
    modules: CustomModule[];
    pages: string[];
    datasets: Record<string, unknown>[];
};
const allowed: Record<CustomKey, string[]> = {
    'content-blocks': [
        'page',
        'section',
        'label',
        'eyebrow',
        'title',
        'subtitle',
        'body',
        'image',
        'cta_label',
        'cta_url',
        'metadata',
        'sort_order',
        'is_published',
    ],
    datasets: [
        'key',
        'label',
        'description',
        'data',
        'sort_order',
        'is_published',
    ],
    'image-slots': ['key', 'group', 'label', 'path', 'alt'],
};
export type Values = Record<string, string | boolean>;
function scalar(value: unknown): string {
    return typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
        ? String(value)
        : '';
}
export function initialValues(
    module: CustomModule,
    record: Record<string, unknown> = {},
): Values {
    return Object.fromEntries(
        module.fields.map((f) => [
            f.key,
            f.type === 'checkbox'
                ? Boolean(record[f.key] ?? false)
                : f.type === 'json'
                  ? record[f.key] === undefined ||
                    (f.key !== 'data' && record[f.key] === null)
                      ? ''
                      : JSON.stringify(record[f.key], null, 2)
                  : scalar(record[f.key] ?? (f.type === 'number' ? 0 : '')),
        ]),
    );
}
export function customEditable(
    access: { admin: boolean; canEdit: () => boolean },
    record?: Record<string, unknown>,
    module?: CustomKey,
): boolean {
    return (
        access.admin ||
        (module !== 'image-slots' &&
            access.canEdit() &&
            record?.is_published !== true &&
            record?.is_published !== 1)
    );
}
export function serializeCustom(
    module: CustomModule,
    values: Values,
    admin: boolean,
): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const f of module.fields) {
        const v = values[f.key] ?? '';
        if (f.required && (v === '' || (typeof v === 'string' && !v.trim())))
            throw new Error(`${f.label} wajib diisi.`);
        if (f.max && typeof v === 'string' && v.length > f.max)
            throw new Error(`${f.label}: maksimum ${f.max} karakter.`);
        if (f.type === 'json') {
            let parsed: unknown;
            try {
                parsed = v === '' && !f.required ? null : JSON.parse(String(v));
            } catch {
                throw new Error(`${f.label}: JSON tidak valid.`);
            }
            body[f.key] = parsed;
        } else if (f.type === 'number') {
            const number = Number(v);
            if (v === '' || !Number.isSafeInteger(number) || number < 0)
                throw new Error(`${f.label} harus bilangan bulat non-negatif.`);
            body[f.key] = number;
        } else if (f.type === 'checkbox')
            body[f.key] =
                f.key === 'is_published' && !admin ? false : Boolean(v);
        else body[f.key] = v === '' && !f.required ? null : v;
    }
    if (module.key === 'datasets' && body.key === 'site_scripts')
        throw new Error('Dataset script tidak tersedia di CMS ini.');
    return body;
}
export function driverFor(
    value: unknown,
    demo: boolean,
): 'generic' | 'acala' | null {
    if (demo || value == null || value === 'generic') return 'generic';
    return value === 'acala' ? 'acala' : null;
}
export function parseDefinition(value: unknown): Definition {
    const d = value as Definition;
    if (
        !d ||
        d.driver !== 'acala' ||
        typeof d.name !== 'string' ||
        !Array.isArray(d.pages) ||
        !d.pages.every((p) => typeof p === 'string') ||
        !Array.isArray(d.modules) ||
        !Array.isArray(d.datasets)
    )
        throw new Error('Definisi CMS Acala tidak valid.');
    const keys = new Set<string>();
    for (const module of d.modules) {
        if (
            !module ||
            !Object.hasOwn(allowed, module.key) ||
            keys.has(module.key) ||
            typeof module.label !== 'string' ||
            !Array.isArray(module.fields)
        )
            throw new Error('Modul CMS tidak didukung.');
        keys.add(module.key);
        const fields = new Set<string>();
        for (const f of module.fields) {
            if (
                !f ||
                !allowed[module.key].includes(f.key) ||
                fields.has(f.key) ||
                typeof f.label !== 'string' ||
                !['text', 'textarea', 'number', 'checkbox', 'json'].includes(
                    f.type,
                ) ||
                (f.required !== undefined && typeof f.required !== 'boolean') ||
                (f.max !== undefined && (!Number.isFinite(f.max) || f.max < 0))
            )
                throw new Error('Field CMS tidak didukung.');
            const expected = ['data', 'metadata'].includes(f.key)
                ? 'json'
                : f.key === 'sort_order'
                  ? 'number'
                  : f.key === 'is_published'
                    ? 'checkbox'
                    : null;
            if (expected && f.type !== expected)
                throw new Error('Tipe field CMS tidak cocok.');
            fields.add(f.key);
        }
    }
    return d;
}
