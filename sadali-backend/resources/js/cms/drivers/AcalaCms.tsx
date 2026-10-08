import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ApiError,
    createAdapter,
    permissions,
    type Envelope,
    type RecordData,
} from '../adapter';
import { errorText, text } from '../editor';
import { createWriteCoordinator, VerificationPendingError } from '../write';
import { workspaceUrl } from '../workspace';
import {
    customEditable,
    initialValues,
    parseDefinition,
    serializeCustom,
    type CustomModule,
    type Definition,
} from './schema';

export type DriverProps = {
    demo: boolean;
    cmsUser: {
        id: number;
        name: string;
        email: string;
        is_super_admin: boolean;
    } | null;
    cmsRoles: Record<string, 'company_admin' | 'company_editor'>;
    cmsBrand?: RecordData | null;
    cmsBrandSlug?: string | null;
};
type Adapter = ReturnType<typeof createAdapter>;
function useRead(
    adapter: Adapter,
    path: string | null,
    query: Record<string, string | number>,
    revision: number,
) {
    const serialized = JSON.stringify(query);
    const readKey = JSON.stringify([path, serialized, revision]);
    const [state, setState] = useState<{
        data: Envelope | null;
        error: string;
        loading: boolean;
        key: string;
    }>({ data: null, error: '', loading: Boolean(path), key: readKey });
    useEffect(() => {
        const controller = new AbortController();
        setState({
            data: null,
            error: '',
            loading: Boolean(path),
            key: readKey,
        });
        if (path)
            void adapter
                .request(path, {
                    query: JSON.parse(serialized),
                    signal: controller.signal,
                })
                .then((data) => {
                    if (!controller.signal.aborted)
                        setState({
                            data,
                            error: '',
                            loading: false,
                            key: readKey,
                        });
                })
                .catch((failure) => {
                    if (!controller.signal.aborted)
                        setState({
                            data: null,
                            error: errorText(failure),
                            loading: false,
                            key: readKey,
                        });
                });
        return () => controller.abort();
    }, [adapter, path, serialized, revision, readKey]);
    return state.key === readKey
        ? state
        : { data: null, error: '', loading: Boolean(path), key: readKey };
}
function ReadState({
    loading,
    error,
    retry,
}: {
    loading: boolean;
    error: string;
    retry: () => void;
}) {
    return loading ? (
        <p role="status" className="cms-state">
            Memuat konten Acala…
        </p>
    ) : error ? (
        <div role="alert" className="cms-error">
            <p>{error}</p>
            <button className="cms-button" onClick={retry}>
                Coba GET lagi
            </button>{' '}
            <a href="/login">Login</a>
        </div>
    ) : null;
}
function AcalaEditor({
    adapter,
    module,
    record,
    root,
    pageKey,
    admin,
    close,
    saved,
}: {
    adapter: Adapter;
    module: CustomModule;
    record: RecordData | null;
    root: string;
    pageKey: string;
    admin: boolean;
    close: () => void;
    saved: () => void;
}) {
    const [values, setValues] = useState(() =>
        initialValues(module, record ?? { page: pageKey }),
    );
    const [baseline] = useState(() => JSON.stringify(values));
    const dirty = JSON.stringify(values) !== baseline;
    const [busy, setBusy] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [fields, setFields] = useState<Record<string, string[]>>({});
    const coordinator = useMemo(() => createWriteCoordinator(), []);
    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (dirty || pending) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty, pending]);
    function dismiss() {
        if (busy) return;
        if (
            (dirty || pending) &&
            !window.confirm(
                pending
                    ? 'Data mungkin sudah tersimpan. Tutup tanpa verifikasi?'
                    : 'Buang perubahan yang belum disimpan?',
            )
        )
            return;
        close();
    }
    async function save() {
        if (busy) return;
        setBusy(true);
        setError('');
        setFields({});
        try {
            const body = pending ? {} : serializeCustom(module, values, admin);
            await coordinator.save(
                (path, options) => adapter.request(path, options),
                {
                    path: record ? `${root}/${record.id}` : root,
                    method: record ? 'PATCH' : 'POST',
                },
                body,
            );
            saved();
            close();
        } catch (failure) {
            setPending(failure instanceof VerificationPendingError);
            setError(errorText(failure));
            if (failure instanceof ApiError) setFields(failure.fields);
        } finally {
            setBusy(false);
        }
    }
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) dismiss();
            }}
        >
            <DialogContent className="cms-dialog">
                <DialogTitle>
                    {record ? 'Edit' : 'Tambah'} {module.label}
                </DialogTitle>
                <DialogDescription>
                    Konten khusus Acala. JSON dipertahankan; gambar memakai
                    URL/path, bukan upload.{' '}
                    {admin ? '' : 'Editor hanya dapat mengelola draft.'}
                </DialogDescription>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void save();
                    }}
                >
                    <fieldset
                        disabled={busy || pending}
                        className="cms-form-grid"
                    >
                        {module.fields.map((field) => (
                            <label className="cms-field" key={field.key}>
                                <span>
                                    {field.label}
                                    {field.required ? ' *' : ''}
                                </span>
                                {field.type === 'checkbox' ? (
                                    <input
                                        type="checkbox"
                                        checked={Boolean(values[field.key])}
                                        disabled={
                                            !admin &&
                                            field.key === 'is_published'
                                        }
                                        onChange={(event) =>
                                            setValues((v) => ({
                                                ...v,
                                                [field.key]:
                                                    event.target.checked,
                                            }))
                                        }
                                    />
                                ) : field.type === 'json' ||
                                  field.type === 'textarea' ? (
                                    <textarea
                                        rows={field.type === 'json' ? 10 : 4}
                                        value={String(values[field.key] ?? '')}
                                        required={field.required}
                                        maxLength={field.max}
                                        onChange={(event) =>
                                            setValues((v) => ({
                                                ...v,
                                                [field.key]: event.target.value,
                                            }))
                                        }
                                        spellCheck={field.type !== 'json'}
                                    />
                                ) : (
                                    <input
                                        type={
                                            field.type === 'number'
                                                ? 'number'
                                                : 'text'
                                        }
                                        min={
                                            field.type === 'number'
                                                ? 0
                                                : undefined
                                        }
                                        step={
                                            field.type === 'number'
                                                ? 1
                                                : undefined
                                        }
                                        required={field.required}
                                        maxLength={field.max}
                                        value={String(values[field.key] ?? '')}
                                        readOnly={
                                            field.key === 'page' &&
                                            module.key === 'content-blocks'
                                        }
                                        onChange={(event) =>
                                            setValues((v) => ({
                                                ...v,
                                                [field.key]: event.target.value,
                                            }))
                                        }
                                    />
                                )}
                                {fields[field.key] && (
                                    <small role="alert">
                                        {fields[field.key].join(' ')}
                                    </small>
                                )}
                            </label>
                        ))}
                    </fieldset>
                    {error && (
                        <p className="cms-error" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="cms-dialog-footer">
                        <button
                            type="button"
                            className="cms-button"
                            disabled={busy}
                            onClick={dismiss}
                        >
                            Tutup
                        </button>
                        <button
                            className="cms-button cms-primary"
                            disabled={busy}
                        >
                            {busy
                                ? 'Memverifikasi…'
                                : pending
                                  ? 'Verifikasi ulang (GET saja)'
                                  : 'Simpan & verifikasi'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
export default function AcalaCms({
    cmsBrand: brand,
    cmsUser,
    cmsRoles,
}: DriverProps) {
    const dummyData =
        typeof brand?.settings === 'object' &&
        brand.settings !== null &&
        'cms_data_mode' in brand.settings &&
        brand.settings.cms_data_mode === 'dummy';
    const adapter = useMemo(() => createAdapter({ demo: false }), []);
    const [revision, setRevision] = useState(0);
    const [brandPage, setBrandPage] = useState(1);
    const [moduleKey, setModuleKey] = useState('content-blocks');
    const [pageKey, setPageKey] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<RecordData | null | undefined>(
        undefined,
    );
    const [editor, setEditor] = useState<{
        record: RecordData | null;
        module: CustomModule;
    } | null>(null);
    const [sidebar, setSidebar] = useState(false);
    const [notice, setNotice] = useState('');
    useEffect(() => {
        if (!sidebar) return;
        const previous = document.activeElement as HTMLElement | null;
        const nodes = Array.from(
            document.querySelectorAll<HTMLElement>(
                '.cms-sidebar a, .cms-sidebar button:not(:disabled), .cms-sidebar select:not(:disabled)',
            ),
        );
        nodes[0]?.focus();
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSidebar(false);
            if (event.key === 'Tab' && nodes.length) {
                if (event.shiftKey && document.activeElement === nodes[0]) {
                    event.preventDefault();
                    nodes.at(-1)?.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === nodes.at(-1)
                ) {
                    event.preventDefault();
                    nodes[0]?.focus();
                }
            }
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
            previous?.focus();
        };
    }, [sidebar]);
    const base = brand ? `brands/${brand.id}` : null;
    const access = permissions(
        cmsUser,
        cmsRoles[String(brand?.id)] ??
            text((brand?.pivot as Record<string, unknown> | undefined)?.role),
    );
    const refresh = () => setRevision((v) => v + 1);
    const definitionRead = useRead(
        adapter,
        base ? `${base}/definition` : null,
        {},
        revision,
    );
    const brandsRead = useRead(
        adapter,
        'brands',
        { page: brandPage, per_page: 20 },
        revision,
    );
    let definition: Definition | null = null;
    let definitionError = definitionRead.error;
    if (definitionRead.data) {
        try {
            definition = parseDefinition(definitionRead.data.data);
        } catch (failure) {
            definitionError = errorText(failure);
        }
    }
    const defaultPage = definition?.pages[0] ?? '';
    useEffect(() => {
        if (!pageKey && defaultPage) setPageKey(defaultPage);
    }, [pageKey, defaultPage]);
    const module = definition?.modules.find((m) => m.key === moduleKey);
    const root = base && module ? `${base}/${module.key}` : null;
    const collection = useRead(
        adapter,
        root && (moduleKey !== 'content-blocks' || pageKey) ? root : null,
        {
            page,
            per_page: 20,
            ...(moduleKey === 'content-blocks' ? { page_key: pageKey } : {}),
        },
        revision,
    );
    const detail = useRead(
        adapter,
        selected && root ? `${root}/${selected.id}` : null,
        {},
        revision,
    );
    useEffect(() => {
        if (
            selected &&
            module &&
            detail.data?.data &&
            !Array.isArray(detail.data.data)
        ) {
            if (
                customEditable(access, detail.data.data, module.key) &&
                detail.data.data.key !== 'site_scripts'
            )
                setEditor({ record: detail.data.data, module });
            setSelected(undefined);
        }
    }, [detail.data, selected, module, access]);
    const rows = Array.isArray(collection.data?.data)
        ? collection.data.data.filter((r) => r.key !== 'site_scripts')
        : [];
    const brands = Array.isArray(brandsRead.data?.data)
        ? brandsRead.data.data
        : [];
    const locked = Boolean(editor || selected);
    return (
        <div className="cms-app">
            <Head title="Acala CMS" />
            {sidebar && (
                <button
                    className="cms-sidebar-scrim"
                    aria-label="Tutup navigasi"
                    onClick={() => setSidebar(false)}
                />
            )}
            <aside
                className={`cms-sidebar ${sidebar ? 'cms-sidebar-open' : ''}`}
                aria-label="Navigasi CMS Acala"
                role={sidebar ? 'dialog' : undefined}
                aria-modal={sidebar || undefined}
            >
                <a className="cms-wordmark" href="/cms">
                    brandspace
                </a>
                <div className="cms-workspace-label">
                    <strong>{text(brand?.name)}</strong>
                </div>
                <label className="cms-brand-picker cms-workspace-picker">
                    <span>Pilih brand workspace</span>
                    <select
                        aria-label="Pilih brand workspace"
                        value={brand?.id ?? ''}
                        disabled={locked}
                        onChange={(event) => {
                            const target = brands.find(
                                (b) => b.id === Number(event.target.value),
                            );
                            if (target)
                                window.location.assign(
                                    workspaceUrl(false, text(target.slug)),
                                );
                        }}
                    >
                        {brand && !brands.some((b) => b.id === brand.id) && (
                            <option value={brand.id}>{text(brand.name)}</option>
                        )}
                        {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                                {text(b.name)}
                            </option>
                        ))}
                    </select>
                </label>
                <ReadState {...brandsRead} retry={refresh} />
                {(brandsRead.data?.meta?.last_page ?? 1) > 1 && (
                    <div className="cms-inline">
                        <button
                            className="cms-button"
                            disabled={brandPage <= 1 || locked}
                            onClick={() => setBrandPage((p) => p - 1)}
                        >
                            Brand sebelumnya
                        </button>
                        <button
                            className="cms-button"
                            disabled={
                                brandPage >=
                                    (brandsRead.data?.meta?.last_page ?? 1) ||
                                locked
                            }
                            onClick={() => setBrandPage((p) => p + 1)}
                        >
                            Brand berikutnya
                        </button>
                    </div>
                )}
                <nav>
                    {definition?.modules.map((m) => (
                        <button
                            className={`cms-nav-item ${m.key === moduleKey ? 'cms-nav-active' : ''}`}
                            key={m.key}
                            disabled={locked}
                            aria-current={
                                m.key === moduleKey ? 'page' : undefined
                            }
                            onClick={() => {
                                setModuleKey(m.key);
                                setSidebar(false);
                                setPage(1);
                                setSelected(undefined);
                                setNotice('');
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </nav>
                <div className="cms-sidebar-bottom">
                    <p>{cmsUser?.name}</p>
                    <small>
                        {access.admin ? 'Administrator' : 'Editor — draft saja'}
                    </small>
                </div>
            </aside>
            <div className="cms-main" inert={sidebar}>
                <header className="cms-topbar">
                    <button
                        className="cms-button cms-icon-button cms-mobile-menu"
                        aria-label="Buka navigasi"
                        onClick={() => setSidebar(true)}
                    >
                        ☰
                    </button>
                    <strong>Workspace / Acala</strong>
                    <span className="cms-live-badge">Live API</span>
                    {dummyData && (
                        <span className="cms-live-badge">Data dummy</span>
                    )}
                    <a href="/cms">Semua brand</a>
                </header>
                <main className="cms-content">
                    <div className="cms-page-heading">
                        <div>
                            <p className="cms-eyebrow">KONTEN WEBSITE ACALA</p>
                            <h1>{module?.label ?? 'CMS Acala'}</h1>
                            <p>
                                Halaman, dataset, dan slot gambar dari website
                                Acala. Modul generic tidak dicampur.
                            </p>
                        </div>
                        <button
                            className="cms-button"
                            disabled={locked}
                            onClick={refresh}
                        >
                            Muat ulang (GET)
                        </button>
                    </div>
                    <ReadState
                        loading={definitionRead.loading}
                        error={definitionError}
                        retry={refresh}
                    />
                    {notice && (
                        <p role="status" className="cms-notice">
                            {notice}
                        </p>
                    )}
                    {module && root && !definitionError && (
                        <section className="cms-card cms-table-card">
                            <div className="cms-table-toolbar">
                                {module.key === 'content-blocks' && (
                                    <label>
                                        Pilih halaman{' '}
                                        <select
                                            aria-label="Pilih halaman Acala"
                                            value={pageKey}
                                            disabled={locked}
                                            onChange={(event) => {
                                                setPageKey(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            {definition?.pages.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                                {customEditable(
                                    access,
                                    undefined,
                                    module.key,
                                ) && (
                                    <button
                                        className="cms-button cms-primary"
                                        disabled={
                                            locked ||
                                            (module.key === 'content-blocks' &&
                                                !pageKey)
                                        }
                                        onClick={() =>
                                            setEditor({ record: null, module })
                                        }
                                    >
                                        Tambah {module.label}
                                    </button>
                                )}
                            </div>
                            <ReadState {...collection} retry={refresh} />
                            <ReadState
                                loading={Boolean(selected) && detail.loading}
                                error={selected ? detail.error : ''}
                                retry={refresh}
                            />
                            {!collection.loading && !collection.error && (
                                <>
                                    <div className="cms-table-scroll">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Konten</th>
                                                    <th>Status / Grup</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td>
                                                            <strong>
                                                                {text(
                                                                    row.label ||
                                                                        row.title ||
                                                                        row.key ||
                                                                        row.section,
                                                                )}
                                                            </strong>
                                                            <small>
                                                                {' '}
                                                                {text(
                                                                    row.page ||
                                                                        row.key,
                                                                )}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            {module.key ===
                                                            'image-slots'
                                                                ? text(
                                                                      row.group,
                                                                  )
                                                                : row.is_published
                                                                  ? 'Terbit'
                                                                  : 'Draft'}
                                                        </td>
                                                        <td>
                                                            {customEditable(
                                                                access,
                                                                row,
                                                                module.key,
                                                            ) ? (
                                                                <button
                                                                    className="cms-button"
                                                                    disabled={
                                                                        locked
                                                                    }
                                                                    onClick={() => {
                                                                        setSelected(
                                                                            row,
                                                                        );
                                                                        setNotice(
                                                                            '',
                                                                        );
                                                                    }}
                                                                >
                                                                    Edit detail
                                                                </button>
                                                            ) : (
                                                                <span>
                                                                    Hanya
                                                                    administrator
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {!rows.length && (
                                        <p className="cms-state">
                                            Belum ada konten untuk pilihan ini.
                                        </p>
                                    )}
                                    <div className="cms-pagination">
                                        <span>
                                            Halaman {page} /{' '}
                                            {collection.data?.meta?.last_page ??
                                                1}
                                        </span>
                                        <div className="cms-inline">
                                            <button
                                                className="cms-button"
                                                disabled={locked || page <= 1}
                                                onClick={() =>
                                                    setPage((p) => p - 1)
                                                }
                                            >
                                                Sebelumnya
                                            </button>
                                            <button
                                                className="cms-button"
                                                disabled={
                                                    locked ||
                                                    page >=
                                                        (collection.data?.meta
                                                            ?.last_page ?? 1)
                                                }
                                                onClick={() =>
                                                    setPage((p) => p + 1)
                                                }
                                            >
                                                Berikutnya
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {selected && detail.error && (
                                <button
                                    className="cms-button"
                                    onClick={() => setSelected(undefined)}
                                >
                                    Batalkan pemilihan
                                </button>
                            )}
                        </section>
                    )}
                    {editor && root && (
                        <AcalaEditor
                            adapter={adapter}
                            module={editor.module}
                            record={editor.record}
                            root={root}
                            pageKey={pageKey}
                            admin={access.admin}
                            close={() => setEditor(null)}
                            saved={() => {
                                setNotice(
                                    'Perubahan tersimpan dan telah diverifikasi melalui GET.',
                                );
                                refresh();
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
