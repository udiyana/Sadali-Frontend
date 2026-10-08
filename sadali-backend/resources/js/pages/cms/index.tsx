import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    CircleHelp,
    FileText,
    Globe,
    Layers3,
    LayoutGrid,
    Loader2,
    LockKeyhole,
    Menu,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ApiError,
    createAdapter,
    demoBrands,
    permissions,
    type Envelope,
    type RecordData,
} from '@/cms/adapter';
import { modules, sectionModule, type Module } from '@/cms/config';
import {
    bannerParentIds,
    canEditBanner,
    createBannerPageResolver,
} from '@/cms/banner-pages';
import { errorText, RecordEditor, text, type Editor } from '@/cms/editor';
import { createWriteCoordinator, verificationMessage } from '@/cms/write';
import { openPageSelection } from '@/cms/navigation';
import { resolveWorkspaceBrand, workspaceUrl } from '@/cms/workspace';
import { resolveDriver } from '@/cms/drivers';
import '../../cms/cms.css';
type User = {
    id: number;
    name: string;
    email: string;
    is_super_admin: boolean;
};
type Props = {
    demo: boolean;
    cmsUser: User | null;
    cmsRoles: Record<string, 'company_admin' | 'company_editor'>;
    cmsBrand?: RecordData | null;
    cmsBrandSlug?: string | null;
};
type Adapter = ReturnType<typeof createAdapter>;
const list = (result: Envelope | null): RecordData[] =>
    Array.isArray(result?.data) ? result.data : [];
function useResource(
    adapter: Adapter,
    path: string | null,
    query: Record<string, string | number>,
    revision: number,
) {
    const [data, setData] = useState<Envelope | null>(null);
    const [loading, setLoading] = useState(Boolean(path));
    const [error, setError] = useState('');
    const serialized = JSON.stringify(query);
    useEffect(() => {
        const controller = new AbortController();
        setData(null);
        setError('');
        setLoading(Boolean(path));
        if (!path) return () => controller.abort();
        void adapter
            .request(path, {
                query: JSON.parse(serialized),
                signal: controller.signal,
            })
            .then((result) => {
                if (!controller.signal.aborted) setData(result);
            })
            .catch((failure) => {
                if (!controller.signal.aborted) setError(errorText(failure));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [adapter, path, serialized, revision]);
    return { data, loading, error };
}
function Badge({ status }: { status: unknown }) {
    return (
        <span className={`cms-badge cms-status-${text(status)}`}>
            {status === 'published'
                ? 'Terbit'
                : status === 'draft'
                  ? 'Draft'
                  : status === 'archived'
                    ? 'Arsip'
                    : text(status) || 'Privat'}
        </span>
    );
}
function BrandMark({
    brand,
    large = false,
}: {
    brand: RecordData;
    large?: boolean;
}) {
    const settings = brand.settings as Record<string, string> | undefined;
    const primary = /^#[\da-f]{6}$/i.test(settings?.primary ?? '')
        ? settings?.primary
        : '#087f72';
    const secondary = /^#[\da-f]{6}$/i.test(settings?.secondary ?? '')
        ? settings?.secondary
        : '#e8f3f0';
    return (
        <span
            className={`cms-brand-mark ${large ? 'cms-brand-mark-large' : ''}`}
            style={{ color: primary, background: secondary }}
        >
            {text(brand.initials) ||
                text(brand.name)
                    .split(' ')
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join('')
                    .toUpperCase()}
        </span>
    );
}
function Pagination({
    data,
    page,
    onChange,
    noun = 'data',
}: {
    data: Envelope | null;
    page: number;
    onChange: (value: number) => void;
    noun?: string;
}) {
    const meta = data?.meta;
    const last = meta?.last_page ?? 1;
    return (
        <div className="cms-pagination">
            <span>
                {meta
                    ? `${meta.total} ${noun} · Halaman ${page} dari ${last}`
                    : 'Belum ada data'}
            </span>
            <div className="cms-inline">
                <button
                    className="cms-button cms-icon-button"
                    aria-label="Halaman sebelumnya"
                    disabled={!data || page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft size={17} />
                </button>
                <button
                    className="cms-button cms-icon-button"
                    aria-label="Halaman berikutnya"
                    disabled={!data || page >= last}
                    onClick={() => onChange(page + 1)}
                >
                    <ChevronRight size={17} />
                </button>
            </div>
        </div>
    );
}
function State({
    loading,
    error,
    empty,
    retry,
    children,
}: {
    loading: boolean;
    error: string;
    empty?: boolean;
    retry: () => void;
    children: React.ReactNode;
}) {
    if (loading)
        return (
            <div className="cms-state" role="status">
                <Loader2 size={24} className="cms-spin" />
                <h3>Memuat konten…</h3>
                <p>Menyiapkan data yang Anda perlukan.</p>
            </div>
        );
    if (error)
        return (
            <div className="cms-state" role="alert">
                <CircleHelp size={28} />
                <h3>Konten belum dapat dimuat</h3>
                <p>{error}</p>
                <div className="cms-inline">
                    <button className="cms-button" onClick={retry}>
                        <RefreshCw size={16} /> Coba lagi
                    </button>
                    <a className="cms-button" href="/login">
                        Login
                    </a>
                </div>
            </div>
        );
    if (empty)
        return (
            <div className="cms-state">
                <Layers3 size={28} />
                <h3>Belum ada konten</h3>
                <p>Mulai dari satu item baru, atau ubah pencarian Anda.</p>
            </div>
        );
    return children;
}
export default function Cms(props: Props) {
    const Driver = resolveDriver(props);
    if (Driver === null)
        return (
            <div className="cms-card cms-state" role="alert">
                <h1>Driver CMS belum didukung</h1>
                <p>
                    Hubungi administrator untuk memasang driver yang terdaftar.
                </p>
                <a href="/cms">Kembali ke workspace</a>
            </div>
        );
    if (Driver) return <Driver {...props} />;
    return <GenericCms {...props} />;
}
function GenericCms({
    demo,
    cmsUser,
    cmsRoles,
    cmsBrand = null,
    cmsBrandSlug = null,
}: Props) {
    const adapter = useMemo(() => {
        let storage: Storage | undefined;
        if (demo) {
            try {
                storage = window.localStorage;
            } catch {
                /* Browser may disable local storage. */
            }
        }
        return createAdapter({ demo, storage });
    }, [demo]);
    const user = demo
        ? {
              id: 1,
              name: 'Admin Demo',
              email: 'admin@example.test',
              is_super_admin: true,
          }
        : cmsUser;
    const [moduleKey, setModuleKey] = useState('overview');
    const [brand, setBrand] = useState<RecordData | null>(() =>
        resolveWorkspaceBrand(demo, cmsBrandSlug, cmsBrand, demoBrands),
    );
    const workspaceMissing = cmsBrandSlug !== null && !brand;
    const [brandPage, setBrandPage] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [revision, setRevision] = useState(0);
    const [sidebar, setSidebar] = useState(false);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [deleting, setDeleting] = useState<{
        path: string;
        record: RecordData;
        label: string;
    } | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [detailBusy, setDetailBusy] = useState(false);
    const [selectedPage, setSelectedPage] = useState<RecordData | null>(null);
    const [sectionPage, setSectionPage] = useState(1);
    const [pickerPage, setPickerPage] = useState(1);
    const [help, setHelp] = useState(false);
    const deleteFocus = useRef<HTMLElement | null>(null);
    const detailController = useRef<AbortController | null>(null);
    const module = modules.find((item) => item.key === moduleKey)!;
    const access = permissions(
        user,
        cmsRoles[String(brand?.id)] ??
            text((brand?.pivot as Record<string, unknown> | undefined)?.role),
    );
    const brandsRequest = useResource(
        adapter,
        'brands',
        { page: brandPage, per_page: 12 },
        revision,
    );
    const brands = list(brandsRequest.data);
    const selectedBrandId = brand?.id;
    useEffect(() => {
        if (!selectedBrandId || !brandsRequest.data) return;
        const updated = list(brandsRequest.data).find(
            (item) => item.id === selectedBrandId,
        );
        if (updated) setBrand(updated);
    }, [brandsRequest.data, selectedBrandId]);
    const base = brand ? `brands/${brand.id}` : null;
    const serverFilters = ['pages', 'products', 'articles'].includes(moduleKey);
    const path =
        moduleKey === 'overview' ||
        moduleKey === 'settings' ||
        selectedPage ||
        (module.admin && !access.admin) ||
        (moduleKey === 'users' && !access.superAdmin)
            ? null
            : moduleKey === 'users'
              ? 'users'
              : base
                ? `${base}/${moduleKey}`
                : null;
    const resource = useResource(
        adapter,
        path,
        {
            page,
            per_page: 8,
            ...(serverFilters && search ? { search } : {}),
            ...(serverFilters && status ? { status } : {}),
        },
        revision,
    );
    const editorRequest = useResource(
        adapter,
        selectedPage && base ? `${base}/pages/${selectedPage.id}/editor` : null,
        { page: sectionPage, per_page: 8 },
        revision,
    );
    const bannerPages = useResource(
        adapter,
        base && (moduleKey === 'banners' || editor?.module.key === 'banners')
            ? `${base}/pages`
            : null,
        { page: pickerPage, per_page: 20 },
        revision,
    );
    const parentResolver = useMemo(
        () =>
            createBannerPageResolver(
                (path, options) => adapter.request(path, options),
                base ?? '',
            ),
        [adapter, base, revision],
    );
    const neededParents = JSON.stringify(
        moduleKey === 'banners' && !access.admin
            ? bannerParentIds(list(resource.data))
            : [],
    );
    const [parentState, setParentState] = useState<{
        resolver: typeof parentResolver;
        ids: string;
        pages: Map<number, RecordData>;
        error: string;
        loading: boolean;
    } | null>(null);
    useEffect(() => {
        const controller = new AbortController();
        const ids = JSON.parse(neededParents) as number[];
        setParentState({
            resolver: parentResolver,
            ids: neededParents,
            pages: new Map(),
            error: '',
            loading: ids.length > 0,
        });
        if (ids.length && base) {
            void parentResolver
                .resolve(
                    ids.map((id) => ({ id, page_id: id })),
                    controller.signal,
                )
                .then((pages) => {
                    if (!controller.signal.aborted)
                        setParentState({
                            resolver: parentResolver,
                            ids: neededParents,
                            pages,
                            error: '',
                            loading: false,
                        });
                })
                .catch((failure) => {
                    if (!controller.signal.aborted)
                        setParentState({
                            resolver: parentResolver,
                            ids: neededParents,
                            pages: new Map(),
                            error: errorText(failure),
                            loading: false,
                        });
                });
        }
        return () => controller.abort();
    }, [parentResolver, neededParents, base]);
    const parentsCurrent =
        parentState?.resolver === parentResolver &&
        parentState.ids === neededParents;
    const parentPages = parentsCurrent
        ? parentState.pages
        : new Map<number, RecordData>();
    const parentsLoading =
        neededParents !== '[]' && (!parentsCurrent || parentState.loading);
    const parentsError = parentsCurrent ? parentState.error : '';
    const [editorParent, setEditorParent] = useState<RecordData | null>(null);
    const pageOptions = [...list(bannerPages.data)];
    if (
        editor?.module.key === 'banners' &&
        editorParent &&
        !pageOptions.some((item) => item.id === editorParent.id)
    ) {
        pageOptions.unshift(editorParent);
    }
    const currentPage =
        editorRequest.data?.data && !Array.isArray(editorRequest.data.data)
            ? (editorRequest.data.data.page as RecordData | undefined)
            : selectedPage;
    const sections =
        editorRequest.data?.data && !Array.isArray(editorRequest.data.data)
            ? ((editorRequest.data.data.sections as RecordData[]) ?? [])
            : [];
    const rows = list(resource.data).filter(
        (record) =>
            serverFilters ||
            ((!search ||
                `${text(record.title)} ${text(record.name)} ${text(record.first_name)} ${text(record.email)} ${text(record.action)}`
                    .toLowerCase()
                    .includes(search.toLowerCase())) &&
                (!status || record.status === status)),
    );
    const refresh = () => setRevision((value) => value + 1);
    useEffect(() => () => detailController.current?.abort(), []);
    useEffect(() => {
        if (!sidebar) return;
        const previous = document.activeElement as HTMLElement | null;
        const buttons = Array.from(
            document.querySelectorAll<HTMLElement>('.cms-sidebar button'),
        );
        buttons[0]?.focus();
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setSidebar(false);
            if (event.key === 'Tab' && buttons.length) {
                if (event.shiftKey && document.activeElement === buttons[0]) {
                    event.preventDefault();
                    buttons.at(-1)?.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === buttons.at(-1)
                ) {
                    event.preventDefault();
                    buttons[0]?.focus();
                }
            }
        };
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
            previous?.focus();
        };
    }, [sidebar]);
    function navigate(key: string, targetBrand: RecordData | null = brand) {
        if (editor || deleting || detailBusy) return;
        if (targetBrand?.id !== brand?.id || (brand && targetBrand === null)) {
            switchWorkspace(targetBrand);
            return;
        }
        if (!brand && key !== 'overview' && key !== 'users') return;
        detailController.current?.abort();
        setDetailBusy(false);
        setModuleKey(key);
        setSelectedPage(null);
        setSectionPage(1);
        setPage(1);
        setPickerPage(1);
        setSearch('');
        setStatus('');
        setSidebar(false);
    }
    function switchWorkspace(targetBrand: RecordData | null) {
        if (editor || deleting || detailBusy) return;
        try {
            window.location.assign(
                workspaceUrl(demo, targetBrand ? text(targetBrand.slug) : null),
            );
        } catch (failure) {
            toast.error(errorText(failure));
        }
    }
    function openPage(record: RecordData) {
        openPageSelection(record, setSelectedPage, setSectionPage);
    }
    async function openEditor(
        target: Module,
        record: RecordData | null,
        explicitPath?: string,
    ) {
        if (target.key === 'banners' && !access.admin && record) {
            const parent = parentPages.get(Number(record.page_id));
            if (!canEditBanner(record, parent, access)) {
                toast.error(
                    'Halaman banner harus draft/arsip dan dimuat sebelum dapat diedit.',
                );
                return;
            }
        }
        const root =
            explicitPath ??
            (target.key === 'users'
                ? 'users'
                : target.key === 'settings'
                  ? base!
                  : `${base}/${target.key}`);
        setEditorParent(null);
        if (!record) {
            setEditor({
                module: target,
                record: null,
                path: root,
                method: 'POST',
                pageId:
                    target.key === 'sections' ? selectedPage?.id : undefined,
            });
            return;
        }
        detailController.current?.abort();
        const controller = new AbortController();
        detailController.current = controller;
        setDetailBusy(true);
        try {
            const result = await adapter.request(
                target.key === 'profile' || target.key === 'settings'
                    ? root
                    : `${root}/${record.id}`,
                { signal: controller.signal },
            );
            if (target.key === 'banners') {
                const detail = result.data as RecordData;
                const parents = await parentResolver.resolve(
                    [detail],
                    controller.signal,
                );
                const parent = parents.get(Number(detail.page_id));
                if (!canEditBanner(detail, parent, access)) {
                    throw new Error(
                        'Halaman banner harus draft/arsip sebelum dapat diedit.',
                    );
                }
                if (!controller.signal.aborted) setEditorParent(parent ?? null);
            }
            if (!controller.signal.aborted)
                setEditor({
                    module: target,
                    record: result.data as RecordData,
                    path:
                        target.key === 'profile' || target.key === 'settings'
                            ? root
                            : `${root}/${record.id}`,
                    method: target.key === 'profile' ? 'PUT' : 'PATCH',
                    pageId:
                        target.key === 'sections'
                            ? selectedPage?.id
                            : undefined,
                });
        } catch (failure) {
            if (!controller.signal.aborted) toast.error(errorText(failure));
        } finally {
            if (!controller.signal.aborted) setDetailBusy(false);
        }
    }
    const writeCoordinator = useMemo(() => createWriteCoordinator(), [editor]);
    async function save(body: Record<string, unknown>) {
        if (!editor) return;
        const verified = await writeCoordinator.save(
            (path, options) => adapter.request(path, options),
            editor,
            body,
        );
        if (editor.module.key === 'settings' && brand)
            setBrand(verified.data as RecordData);
        refresh();
        toast.success(
            demo
                ? 'Perubahan demo tersimpan di browser.'
                : 'Perubahan berhasil disimpan.',
        );
    }
    function askDelete(record: RecordData, root: string, label: string) {
        deleteFocus.current = document.activeElement as HTMLElement;
        setDeleteError('');
        setDeleting({ path: `${root}/${record.id}`, record, label });
    }
    async function remove() {
        if (!deleting) return;
        setDeleteBusy(true);
        setDeleteError('');
        try {
            await adapter.request(deleting.path, { method: 'DELETE' });
            try {
                await adapter.request(deleting.path);
                throw new Error(
                    'Penghapusan belum terverifikasi. Muat ulang data sebelum mencoba lagi.',
                );
            } catch (verificationError) {
                if (
                    !(
                        verificationError instanceof ApiError &&
                        verificationError.status === 404
                    )
                )
                    throw verificationError;
            }
            refresh();
            setDeleting(null);
            toast.success(
                demo
                    ? 'Item demo dihapus dari browser.'
                    : 'Item berhasil dihapus.',
            );
        } catch (failure) {
            setDeleteError(errorText(failure));
        } finally {
            setDeleteBusy(false);
        }
    }
    const canManage =
        moduleKey === 'users'
            ? access.superAdmin
            : !module.admin || access.admin;
    function editable(record: RecordData) {
        if (moduleKey === 'banners' && !access.admin) {
            return canEditBanner(
                record,
                parentPages.get(Number(record.page_id)),
                access,
            );
        }
        return moduleKey === 'users'
            ? access.superAdmin
            : access.canEdit(record);
    }
    const groups = [
        { label: 'WORKSPACE', keys: ['overview'] },
        {
            label: 'KONTEN WEBSITE',
            keys: ['pages', 'articles', 'products', 'banners'],
        },
        { label: 'OPERASIONAL', keys: ['properties', 'services', 'guests'] },
        {
            label: 'PENGELOLAAN',
            keys: ['profile', 'settings', 'users', 'activity'],
        },
    ];
    return (
        <div className="cms-app">
            <Head title="Brand workspace" />
            {sidebar && (
                <button
                    className="cms-sidebar-scrim"
                    aria-label="Tutup navigasi"
                    onClick={() => setSidebar(false)}
                />
            )}
            <aside
                className={`cms-sidebar ${sidebar ? 'cms-sidebar-open' : ''}`}
                aria-label="Navigasi CMS"
                role={sidebar ? 'dialog' : undefined}
                aria-modal={sidebar || undefined}
            >
                <button
                    className="cms-wordmark"
                    onClick={() => navigate('overview')}
                >
                    <span className="cms-logo">
                        <Layers3 size={23} />
                    </span>
                    <span>
                        brand<span className="cms-wordmark-dot">space</span>
                        <small>CONTENT MANAGEMENT</small>
                    </span>
                </button>
                <div className="cms-workspace-label">
                    <span className="cms-workspace-icon">
                        <LayoutGrid size={18} />
                    </span>
                    <div>
                        <strong>Brand workspace</strong>
                        <small>
                            {brand ? text(brand.name) : 'Pilih brand Anda'}
                        </small>
                    </div>
                    <ChevronsUpDown size={15} />
                </div>
                <label className="cms-brand-picker cms-workspace-picker">
                    <span className="cms-sr-only">Pilih brand workspace</span>
                    <select
                        aria-label="Pilih brand workspace"
                        value={brand?.id ?? ''}
                        disabled={Boolean(editor || deleting || detailBusy)}
                        onChange={(event) => {
                            const target = brands.find(
                                (item) =>
                                    item.id === Number(event.target.value),
                            );
                            if (target) switchWorkspace(target);
                        }}
                    >
                        <option value="" disabled>
                            Pilih brand
                        </option>
                        {brand &&
                            !brands.some((item) => item.id === brand.id) && (
                                <option value={brand.id}>
                                    {text(brand.name)}
                                </option>
                            )}
                        {brands.map((item) => (
                            <option key={item.id} value={item.id}>
                                {text(item.name)}
                            </option>
                        ))}
                    </select>
                </label>
                {brandsRequest.data &&
                    (brandsRequest.data.meta?.last_page ?? 1) > 1 && (
                        <Pagination
                            data={brandsRequest.data}
                            page={brandPage}
                            onChange={setBrandPage}
                            noun="brand"
                        />
                    )}
                <nav>
                    {groups.map((group) => (
                        <div className="cms-nav-group" key={group.label}>
                            <p>{group.label}</p>
                            {group.keys.map((key) => {
                                const item = modules.find(
                                    (candidate) => candidate.key === key,
                                )!;
                                if (key === 'users' && !user?.is_super_admin)
                                    return null;
                                if (
                                    (key === 'guests' ||
                                        key === 'profile' ||
                                        key === 'settings') &&
                                    brand &&
                                    !access.admin
                                )
                                    return null;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={key}
                                        className={`cms-nav-item ${moduleKey === key ? 'cms-nav-active' : ''}`}
                                        disabled={
                                            Boolean(
                                                editor ||
                                                deleting ||
                                                detailBusy,
                                            ) ||
                                            (!brand &&
                                                key !== 'overview' &&
                                                key !== 'users')
                                        }
                                        onClick={() => navigate(key)}
                                        aria-current={
                                            moduleKey === key
                                                ? 'page'
                                                : undefined
                                        }
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                        {key === 'overview' && !brand && (
                                            <span className="cms-nav-count">
                                                {brandsRequest.data?.meta
                                                    ?.total ?? '—'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>
                <div className="cms-sidebar-bottom">
                    <button
                        className="cms-nav-item"
                        onClick={() => setHelp(true)}
                    >
                        <CircleHelp size={18} />
                        Panduan workspace
                        <ArrowRight size={14} />
                    </button>
                    <div className="cms-person">
                        <span className="cms-avatar">
                            {user?.name?.slice(0, 1) ?? 'U'}
                        </span>
                        <div>
                            <strong>{user?.name ?? 'Pengguna'}</strong>
                            <small>
                                {demo
                                    ? 'Administrator demo'
                                    : user?.is_super_admin
                                      ? 'Super administrator'
                                      : 'Anggota workspace'}
                            </small>
                        </div>
                        <ShieldCheck size={17} />
                    </div>
                </div>
            </aside>
            <div className="cms-main" inert={sidebar}>
                <header className="cms-topbar">
                    <div className="cms-inline">
                        <button
                            className="cms-button cms-icon-button cms-mobile-menu"
                            aria-label="Buka navigasi"
                            onClick={() => setSidebar(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <span className="cms-breadcrumb">
                            Workspace <ChevronRight size={14} />{' '}
                            <strong>
                                {selectedPage ? 'Editor halaman' : module.label}
                            </strong>
                        </span>
                    </div>
                    <div className="cms-inline">
                        {demo ? (
                            <span className="cms-demo-badge">
                                <span /> MODE DEMO
                            </span>
                        ) : (
                            <span className="cms-live-badge">
                                <LockKeyhole size={12} /> Live API
                            </span>
                        )}
                        <a
                            className="cms-mode-link"
                            href={demo ? '/cms' : '/cms/demo'}
                        >
                            {demo ? 'Buka CMS live' : 'Coba demo'}
                            <ArrowRight size={14} />
                        </a>
                        <span className="cms-top-avatar">
                            {user?.name?.slice(0, 1) ?? 'U'}
                        </span>
                    </div>
                </header>
                <main className="cms-content">
                    {demo && (
                        <div className="cms-demo-notice">
                            <ShieldCheck size={16} />
                            <span>
                                <strong>Workspace demo.</strong> 3 brand fiktif.
                                Perubahan hanya di browser ini, tidak masuk
                                database atau membuat akun nyata.
                            </span>
                        </div>
                    )}
                    <div className="cms-page-heading">
                        <div>
                            <p className="cms-eyebrow">
                                {selectedPage
                                    ? text(brand?.name)
                                    : moduleKey === 'overview'
                                      ? 'BRAND WORKSPACE'
                                      : text(brand?.name) || 'WORKSPACE'}
                            </p>
                            <h1 tabIndex={-1}>
                                {selectedPage
                                    ? text(
                                          currentPage?.title ??
                                              selectedPage.title,
                                      )
                                    : moduleKey === 'overview'
                                      ? brand
                                          ? `Halo, ${text(brand.name)}.`
                                          : 'Semua brand, satu workspace.'
                                      : module.label}
                            </h1>
                            <p>
                                {selectedPage
                                    ? 'Edit konten dan susun section untuk halaman ini saja.'
                                    : module.description}
                            </p>
                        </div>
                        <div className="cms-heading-actions">
                            <button
                                className="cms-button cms-icon-button"
                                aria-label="Muat ulang data"
                                onClick={refresh}
                            >
                                <RefreshCw size={17} />
                            </button>
                        </div>
                    </div>
                    {detailBusy && (
                        <div className="cms-notice" role="status">
                            <Loader2 className="cms-spin" size={16} /> Memuat
                            detail lengkap…
                        </div>
                    )}
                    {workspaceMissing && (
                        <div className="cms-card cms-state" role="alert">
                            <h3>Workspace brand tidak ditemukan</h3>
                            <p>
                                Pilih brand yang tersedia melalui pemilih di
                                kiri.
                            </p>
                        </div>
                    )}
                    {moduleKey === 'overview' && !workspaceMissing && (
                        <>
                            {brand ? (
                                <>
                                    <div className="cms-selected-brand cms-card">
                                        <BrandMark brand={brand} large />
                                        <div>
                                            <h2>{text(brand.name)}</h2>
                                            <p>
                                                {text(brand.description) ||
                                                    'Kelola identitas dan konten website brand ini.'}
                                            </p>
                                            <div className="cms-inline">
                                                <Badge status={brand.status} />
                                                <span className="cms-muted">
                                                    /{text(brand.slug)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="cms-button"
                                            onClick={() =>
                                                navigate('overview', null)
                                            }
                                        >
                                            <ArrowLeft size={16} /> Semua brand
                                        </button>
                                    </div>
                                    <div className="cms-section-heading">
                                        <div>
                                            <h2>Mulai mengelola</h2>
                                            <p>
                                                Hanya modul yang Anda buka yang
                                                memuat data.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="cms-quick-grid">
                                        {modules
                                            .filter((item) =>
                                                [
                                                    'pages',
                                                    'services',
                                                    'properties',
                                                    'articles',
                                                ].includes(item.key),
                                            )
                                            .map((item) => (
                                                <button
                                                    key={item.key}
                                                    className="cms-card cms-quick-card"
                                                    onClick={() =>
                                                        navigate(item.key)
                                                    }
                                                >
                                                    <item.icon size={22} />
                                                    <h3>{item.label}</h3>
                                                    <p>{item.description}</p>
                                                    <span>
                                                        Kelola {item.singular}
                                                        <ArrowRight size={16} />
                                                    </span>
                                                </button>
                                            ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="cms-overview-strip">
                                        <div>
                                            <span className="cms-stat-icon">
                                                <Layers3 size={21} />
                                            </span>
                                            <div>
                                                <span className="cms-muted">
                                                    Brand tersedia
                                                </span>
                                                <strong>
                                                    {brandsRequest.data?.meta
                                                        ?.total ?? '—'}{' '}
                                                    <small>
                                                        brand di workspace
                                                    </small>
                                                </strong>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="cms-stat-icon">
                                                <ShieldCheck size={21} />
                                            </span>
                                            <div>
                                                <span className="cms-muted">
                                                    Lingkungan kerja
                                                </span>
                                                <strong>
                                                    {demo
                                                        ? 'Demo lokal'
                                                        : 'Live API'}
                                                    <small>
                                                        {demo
                                                            ? 'Aman untuk bereksperimen'
                                                            : 'Sesuai akses membership'}
                                                    </small>
                                                </strong>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="cms-stat-icon">
                                                <FileText size={21} />
                                            </span>
                                            <div>
                                                <span className="cms-muted">
                                                    Konten terorganisir
                                                </span>
                                                <strong>
                                                    Per brand
                                                    <small>
                                                        Halaman, layanan, dan
                                                        identitas
                                                    </small>
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cms-section-heading">
                                        <div>
                                            <h2>
                                                Brand Anda{' '}
                                                <span className="cms-count">
                                                    {brandsRequest.data?.meta
                                                        ?.total ?? '—'}
                                                </span>
                                            </h2>
                                            <p>
                                                Pilih brand untuk mulai
                                                mengelola konten dan pengalaman
                                                website.
                                            </p>
                                        </div>
                                        <span className="cms-subtle-label">
                                            <LayoutGrid size={15} /> Tampilan
                                            kartu
                                        </span>
                                    </div>
                                    <State
                                        {...brandsRequest}
                                        empty={!brands.length}
                                        retry={refresh}
                                    >
                                        <div className="cms-brand-grid">
                                            {brands.map((item) => (
                                                <article
                                                    className="cms-card cms-brand-card"
                                                    key={item.id}
                                                >
                                                    <div className="cms-brand-card-top">
                                                        <BrandMark
                                                            brand={item}
                                                            large
                                                        />
                                                        <Badge
                                                            status={item.status}
                                                        />
                                                    </div>
                                                    <h2>{text(item.name)}</h2>
                                                    <p>
                                                        {text(
                                                            item.description,
                                                        ) ||
                                                            'Kelola konten dan identitas website brand Anda.'}
                                                    </p>
                                                    <div className="cms-brand-domain">
                                                        <Globe size={14} />
                                                        {text(item.domain) ||
                                                            `/${text(item.slug)}`}
                                                        <span>
                                                            {demo
                                                                ? 'Fiktif'
                                                                : item.active
                                                                  ? 'Aktif'
                                                                  : 'Tidak aktif'}
                                                        </span>
                                                    </div>
                                                    <div className="cms-brand-card-footer">
                                                        <span>
                                                            <span
                                                                className={`cms-dot ${item.active ? 'cms-dot-active' : ''}`}
                                                            />{' '}
                                                            {item.active
                                                                ? 'Brand aktif'
                                                                : 'Dalam persiapan'}
                                                        </span>
                                                        <button
                                                            className="cms-text-button"
                                                            onClick={() =>
                                                                switchWorkspace(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            Kelola brand
                                                            <ArrowRight
                                                                size={16}
                                                            />
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </State>
                                    <Pagination
                                        data={brandsRequest.data}
                                        page={brandPage}
                                        onChange={setBrandPage}
                                        noun="brand"
                                    />
                                </>
                            )}
                            <div className="cms-guidance">
                                <span className="cms-guide-icon">
                                    <Layers3 size={25} />
                                </span>
                                <div>
                                    <h3>
                                        Konten yang rapi dimulai dari satu
                                        halaman.
                                    </h3>
                                    <p>
                                        Pilih brand, buka Halaman, lalu susun
                                        section. Semua perubahan terpisah sesuai
                                        brand yang dipilih.
                                    </p>
                                </div>
                                <button
                                    className="cms-button"
                                    onClick={() => setHelp(true)}
                                >
                                    Lihat panduan
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </>
                    )}
                    {moduleKey !== 'overview' &&
                        !brand &&
                        moduleKey !== 'users' && (
                            <div className="cms-card cms-state">
                                <Layers3 size={28} />
                                <h3>Pilih brand terlebih dahulu</h3>
                                <p>
                                    Gunakan pemilih brand di atas untuk membuka
                                    data yang tepat.
                                </p>
                                <button
                                    className="cms-button"
                                    onClick={() => navigate('overview', null)}
                                >
                                    Lihat brand
                                </button>
                            </div>
                        )}
                    {moduleKey !== 'overview' &&
                        (brand || moduleKey === 'users') &&
                        !canManage && (
                            <div className="cms-card cms-state">
                                <LockKeyhole size={26} />
                                <h3>Akses administrator diperlukan</h3>
                                <p>
                                    Modul ini tidak tersedia untuk role Anda
                                    pada brand yang dipilih.
                                </p>
                            </div>
                        )}
                    {canManage &&
                        (brand || moduleKey === 'users') &&
                        moduleKey !== 'overview' && (
                            <>
                                {selectedPage ? (
                                    <>
                                        <div className="cms-editor-toolbar">
                                            <button
                                                className="cms-button"
                                                onClick={() =>
                                                    setSelectedPage(null)
                                                }
                                            >
                                                <ArrowLeft size={16} /> Daftar
                                                halaman
                                            </button>
                                            <div className="cms-inline">
                                                <Badge
                                                    status={currentPage?.status}
                                                />
                                                {access.canEdit(
                                                    currentPage ?? undefined,
                                                ) && (
                                                    <button
                                                        className="cms-button cms-primary"
                                                        onClick={() =>
                                                            void openEditor(
                                                                module,
                                                                currentPage ??
                                                                    selectedPage,
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={16} />
                                                        Edit halaman & SEO
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <State
                                            {...editorRequest}
                                            retry={refresh}
                                        >
                                            <div className="cms-page-preview cms-card">
                                                <div className="cms-section-heading">
                                                    <div>
                                                        <p className="cms-eyebrow">
                                                            KONTEN HALAMAN
                                                        </p>
                                                        <h2>
                                                            {text(
                                                                currentPage?.title,
                                                            )}
                                                        </h2>
                                                    </div>
                                                    <span className="cms-muted">
                                                        /
                                                        {text(
                                                            currentPage?.slug,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="cms-body-preview">
                                                    {text(currentPage?.body) ||
                                                        'Belum ada konten teks.'}
                                                </p>
                                                <div className="cms-seo-preview">
                                                    <strong>
                                                        {text(
                                                            currentPage?.meta_title,
                                                        ) ||
                                                            text(
                                                                currentPage?.title,
                                                            )}
                                                    </strong>
                                                    <p>
                                                        {text(
                                                            currentPage?.meta_description,
                                                        ) ||
                                                            'Deskripsi SEO belum diisi.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="cms-section-heading">
                                                <div>
                                                    <h2>
                                                        Susunan section{' '}
                                                        <span className="cms-count">
                                                            {editorRequest.data
                                                                ?.meta?.total ??
                                                                '—'}
                                                        </span>
                                                    </h2>
                                                    <p>
                                                        Urutan berdasarkan
                                                        posisi, kemudian ID.
                                                        Teks biasa, tanpa kode
                                                        bebas.
                                                    </p>
                                                </div>
                                                {access.canEdit(
                                                    currentPage ?? undefined,
                                                ) && (
                                                    <button
                                                        className="cms-button cms-primary"
                                                        onClick={() =>
                                                            void openEditor(
                                                                sectionModule,
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        <Plus size={17} />
                                                        Tambah section
                                                    </button>
                                                )}
                                            </div>
                                            <div className="cms-section-list">
                                                {sections.length ? (
                                                    sections.map((section) => (
                                                        <div
                                                            className="cms-card cms-section-row"
                                                            key={section.id}
                                                        >
                                                            <span className="cms-section-position">
                                                                {text(
                                                                    section.position,
                                                                )}
                                                            </span>
                                                            <div>
                                                                <strong>
                                                                    {text(
                                                                        (
                                                                            section.config as Record<
                                                                                string,
                                                                                unknown
                                                                            >
                                                                        )
                                                                            ?.heading,
                                                                    ) ||
                                                                        text(
                                                                            section.type,
                                                                        )}
                                                                </strong>
                                                                <p>
                                                                    {text(
                                                                        section.type,
                                                                    )}{' '}
                                                                    ·{' '}
                                                                    {section.visible
                                                                        ? 'Terlihat'
                                                                        : 'Tersembunyi'}
                                                                </p>
                                                            </div>
                                                            {access.canEdit(
                                                                section,
                                                                currentPage ??
                                                                    undefined,
                                                            ) && (
                                                                <div className="cms-inline">
                                                                    <button
                                                                        className="cms-button cms-icon-button"
                                                                        aria-label={`Edit section ${section.id}`}
                                                                        onClick={() =>
                                                                            void openEditor(
                                                                                sectionModule,
                                                                                section,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        className="cms-button cms-icon-button"
                                                                        aria-label={`Hapus section ${section.id}`}
                                                                        onClick={() =>
                                                                            askDelete(
                                                                                section,
                                                                                `${base}/sections`,
                                                                                'section',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="cms-card cms-state">
                                                        <Layers3 size={24} />
                                                        <h3>
                                                            Halaman belum
                                                            memiliki section
                                                        </h3>
                                                        <p>
                                                            Tambahkan hero,
                                                            teks, katalog, atau
                                                            kontak untuk
                                                            menyusun halaman.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Pagination
                                                data={editorRequest.data}
                                                page={sectionPage}
                                                onChange={setSectionPage}
                                                noun="section"
                                            />
                                        </State>
                                    </>
                                ) : moduleKey === 'settings' ||
                                  moduleKey === 'profile' ? (
                                    <State
                                        loading={
                                            moduleKey === 'profile' &&
                                            resource.loading
                                        }
                                        error={
                                            moduleKey === 'profile'
                                                ? resource.error
                                                : ''
                                        }
                                        retry={refresh}
                                    >
                                        <div className="cms-card cms-settings-card">
                                            <div className="cms-inline">
                                                <BrandMark
                                                    brand={brand!}
                                                    large
                                                />
                                                <div>
                                                    <h2>{module.label}</h2>
                                                    <p>{module.description}</p>
                                                </div>
                                            </div>
                                            <dl>
                                                {(moduleKey === 'settings'
                                                    ? [
                                                          [
                                                              'Nama brand',
                                                              brand?.name,
                                                          ],
                                                          ['Slug', brand?.slug],
                                                          [
                                                              'Domain',
                                                              brand?.domain,
                                                          ],
                                                          [
                                                              'Status',
                                                              brand?.status,
                                                          ],
                                                          [
                                                              'Template',
                                                              (
                                                                  brand?.settings as Record<
                                                                      string,
                                                                      unknown
                                                                  >
                                                              )?.template,
                                                          ],
                                                          [
                                                              'Font',
                                                              (
                                                                  brand?.settings as Record<
                                                                      string,
                                                                      unknown
                                                                  >
                                                              )?.font,
                                                          ],
                                                      ]
                                                    : [
                                                          [
                                                              'Deskripsi',
                                                              (
                                                                  resource.data
                                                                      ?.data as RecordData
                                                              )?.description,
                                                          ],
                                                          [
                                                              'Email',
                                                              (
                                                                  resource.data
                                                                      ?.data as RecordData
                                                              )?.email,
                                                          ],
                                                          [
                                                              'Telepon',
                                                              (
                                                                  resource.data
                                                                      ?.data as RecordData
                                                              )?.phone,
                                                          ],
                                                          [
                                                              'Alamat',
                                                              (
                                                                  resource.data
                                                                      ?.data as RecordData
                                                              )?.address,
                                                          ],
                                                      ]
                                                ).map(([label, value]) => (
                                                    <div key={text(label)}>
                                                        <dt>{text(label)}</dt>
                                                        <dd>
                                                            {text(value) ||
                                                                'Belum diisi'}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>
                                            <button
                                                className="cms-button cms-primary"
                                                onClick={() =>
                                                    void openEditor(
                                                        module,
                                                        brand,
                                                    )
                                                }
                                            >
                                                <Pencil size={16} />
                                                Edit {module.singular}
                                            </button>
                                        </div>
                                    </State>
                                ) : (
                                    <div className="cms-card cms-table-card">
                                        <div className="cms-table-toolbar">
                                            <div className="cms-inline cms-filter-group">
                                                <label className="cms-search">
                                                    <Search size={17} />
                                                    <input
                                                        aria-label={`Cari ${module.label}`}
                                                        placeholder={`Cari ${module.singular}…`}
                                                        value={search}
                                                        onChange={(event) => {
                                                            setSearch(
                                                                event.target
                                                                    .value,
                                                            );
                                                            setPage(1);
                                                        }}
                                                    />
                                                </label>
                                                {moduleKey !== 'guests' &&
                                                    moduleKey !== 'users' &&
                                                    moduleKey !==
                                                        'activity' && (
                                                        <select
                                                            className="cms-status-filter"
                                                            aria-label="Filter status"
                                                            value={status}
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                setStatus(
                                                                    event.target
                                                                        .value,
                                                                );
                                                                setPage(1);
                                                            }}
                                                        >
                                                            <option value="">
                                                                Semua status
                                                            </option>
                                                            <option value="draft">
                                                                Draft
                                                            </option>
                                                            <option value="published">
                                                                Terbit
                                                            </option>
                                                            <option value="archived">
                                                                Arsip
                                                            </option>
                                                        </select>
                                                    )}
                                            </div>
                                            {!module.readonly &&
                                                access.canEdit() && (
                                                    <button
                                                        className="cms-button cms-primary"
                                                        onClick={() =>
                                                            void openEditor(
                                                                module,
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        <Plus size={17} />
                                                        Tambah {module.singular}
                                                    </button>
                                                )}
                                        </div>
                                        {!serverFilters &&
                                            (search || status) && (
                                                <p className="cms-filter-note">
                                                    Pencarian/filter berlaku
                                                    untuk halaman data yang
                                                    sedang dimuat, bukan seluruh
                                                    koleksi.
                                                </p>
                                            )}
                                        {moduleKey === 'banners' &&
                                            bannerPages.error && (
                                                <div
                                                    className="cms-error"
                                                    role="alert"
                                                >
                                                    Halaman banner belum dimuat:{' '}
                                                    {bannerPages.error}
                                                    <button
                                                        className="cms-text-button"
                                                        onClick={refresh}
                                                    >
                                                        Coba lagi
                                                    </button>
                                                </div>
                                            )}
                                        {moduleKey === 'banners' &&
                                            parentsLoading && (
                                                <div
                                                    className="cms-notice"
                                                    role="status"
                                                >
                                                    Memuat izin halaman banner…
                                                </div>
                                            )}
                                        {moduleKey === 'banners' &&
                                            parentsError && (
                                                <div
                                                    className="cms-error"
                                                    role="alert"
                                                >
                                                    Izin halaman banner belum
                                                    dapat diverifikasi:{' '}
                                                    {parentsError}
                                                    <button
                                                        className="cms-text-button"
                                                        onClick={refresh}
                                                    >
                                                        Coba lagi
                                                    </button>
                                                </div>
                                            )}
                                        <State
                                            {...resource}
                                            empty={!rows.length}
                                            retry={refresh}
                                        >
                                            <div className="cms-table-scroll">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                {moduleKey ===
                                                                'activity'
                                                                    ? 'Aktivitas'
                                                                    : moduleKey ===
                                                                            'guests' ||
                                                                        moduleKey ===
                                                                            'users'
                                                                      ? 'Nama'
                                                                      : 'Konten'}
                                                            </th>
                                                            <th>
                                                                {moduleKey ===
                                                                'activity'
                                                                    ? 'Objek'
                                                                    : moduleKey ===
                                                                            'guests' ||
                                                                        moduleKey ===
                                                                            'users'
                                                                      ? 'Email'
                                                                      : 'Status'}
                                                            </th>
                                                            <th>
                                                                {moduleKey ===
                                                                'activity'
                                                                    ? 'Waktu (UTC)'
                                                                    : 'Detail'}
                                                            </th>
                                                            {!module.readonly && (
                                                                <th className="cms-actions-heading">
                                                                    Aksi
                                                                </th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.map((record) => (
                                                            <tr key={record.id}>
                                                                <td>
                                                                    <div className="cms-table-name">
                                                                        <span className="cms-row-icon">
                                                                            <module.icon
                                                                                size={
                                                                                    18
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <div>
                                                                            {moduleKey ===
                                                                            'pages' ? (
                                                                                <button
                                                                                    className="cms-title-button"
                                                                                    onClick={() =>
                                                                                        openPage(
                                                                                            record,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {text(
                                                                                        record.title,
                                                                                    )}
                                                                                </button>
                                                                            ) : (
                                                                                <strong>
                                                                                    {text(
                                                                                        record.title ||
                                                                                            record.name ||
                                                                                            `${text(record.first_name)} ${text(record.last_name)}`.trim() ||
                                                                                            record.action,
                                                                                    )}
                                                                                </strong>
                                                                            )}
                                                                            <small>
                                                                                {text(
                                                                                    record.slug,
                                                                                ) ||
                                                                                    `ID ${record.id}`}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {moduleKey ===
                                                                    'activity' ? (
                                                                        `${text(record.subject_type)} #${text(record.subject_id)}`
                                                                    ) : moduleKey ===
                                                                          'guests' ||
                                                                      moduleKey ===
                                                                          'users' ? (
                                                                        text(
                                                                            record.email,
                                                                        ) || '—'
                                                                    ) : (
                                                                        <Badge
                                                                            status={
                                                                                record.status
                                                                            }
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="cms-muted">
                                                                    {moduleKey ===
                                                                    'activity'
                                                                        ? text(
                                                                              record.created_at,
                                                                          )
                                                                              .replace(
                                                                                  'T',
                                                                                  ' ',
                                                                              )
                                                                              .replace(
                                                                                  /\.\d+Z$/,
                                                                                  'Z',
                                                                              )
                                                                        : moduleKey ===
                                                                            'users'
                                                                          ? record.is_super_admin
                                                                              ? 'Super admin'
                                                                              : 'Anggota brand'
                                                                          : moduleKey ===
                                                                              'banners'
                                                                            ? `Halaman #${text(record.page_id)}`
                                                                            : moduleKey ===
                                                                                'products'
                                                                              ? text(
                                                                                    record.category,
                                                                                ) ||
                                                                                'Tanpa kategori'
                                                                              : text(
                                                                                    record.phone,
                                                                                ) ||
                                                                                text(
                                                                                    record.icon,
                                                                                ) ||
                                                                                text(
                                                                                    record.updated_at,
                                                                                ).slice(
                                                                                    0,
                                                                                    10,
                                                                                ) ||
                                                                                '—'}
                                                                </td>
                                                                {!module.readonly && (
                                                                    <td>
                                                                        <div className="cms-row-actions">
                                                                            {moduleKey ===
                                                                                'pages' && (
                                                                                <button
                                                                                    className="cms-button cms-icon-button"
                                                                                    aria-label={`Buka halaman ${text(record.title)}`}
                                                                                    onClick={() =>
                                                                                        openPage(
                                                                                            record,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <ArrowRight
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />
                                                                                </button>
                                                                            )}
                                                                            {editable(
                                                                                record,
                                                                            ) && (
                                                                                <>
                                                                                    <button
                                                                                        className="cms-button cms-icon-button"
                                                                                        aria-label={`Edit ${text(record.title || record.name || record.first_name)}`}
                                                                                        disabled={
                                                                                            detailBusy
                                                                                        }
                                                                                        onClick={() =>
                                                                                            void openEditor(
                                                                                                module,
                                                                                                record,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Pencil
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />
                                                                                    </button>
                                                                                    {!(
                                                                                        moduleKey ===
                                                                                            'users' &&
                                                                                        record.is_super_admin
                                                                                    ) && (
                                                                                        <button
                                                                                            className="cms-button cms-icon-button"
                                                                                            aria-label={`Hapus ${text(record.title || record.name || record.first_name)}`}
                                                                                            onClick={() =>
                                                                                                askDelete(
                                                                                                    record,
                                                                                                    path!,
                                                                                                    module.singular,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Trash2
                                                                                                size={
                                                                                                    16
                                                                                                }
                                                                                            />
                                                                                        </button>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {!editable(
                                                                                record,
                                                                            ) && (
                                                                                <span
                                                                                    title="Administrator diperlukan"
                                                                                    className="cms-muted"
                                                                                >
                                                                                    <LockKeyhole
                                                                                        size={
                                                                                            15
                                                                                        }
                                                                                    />
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </State>
                                        <Pagination
                                            data={resource.data}
                                            page={page}
                                            onChange={setPage}
                                            noun={module.label.toLowerCase()}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    <footer className="cms-page-footer">
                        <span>
                            brandspace <span>·</span> Workspace yang tumbuh
                            bersama brand Anda.
                        </span>
                        <span>
                            {demo
                                ? 'Data fiktif · Tersimpan lokal'
                                : 'Session aman · Tenant scoped'}
                        </span>
                    </footer>
                </main>
            </div>
            {editor && (
                <RecordEditor
                    key={`${editor.path}-${editor.record?.id ?? 'new'}`}
                    editor={editor}
                    brands={brands}
                    pages={pageOptions}
                    canPublish={access.admin}
                    demo={demo}
                    onSave={save}
                    onClose={(verificationPending) => {
                        if (verificationPending) {
                            refresh();
                            toast.warning(verificationMessage);
                        }
                        setEditor(null);
                    }}
                    pageNumber={pickerPage}
                    hasPageNext={
                        pickerPage < (bannerPages.data?.meta?.last_page ?? 1)
                    }
                    onPageNext={(direction) =>
                        setPickerPage((value) => value + direction)
                    }
                />
            )}
            <Dialog
                open={Boolean(deleting)}
                onOpenChange={(open) => {
                    if (!open && !deleteBusy) setDeleting(null);
                }}
            >
                <DialogContent
                    className="cms-dialog cms-small-dialog"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        requestAnimationFrame(() => {
                            if (deleteFocus.current?.isConnected)
                                deleteFocus.current.focus();
                            else
                                document
                                    .querySelector<HTMLElement>(
                                        '.cms-page-heading h1',
                                    )
                                    ?.focus();
                        });
                    }}
                    onEscapeKeyDown={(event) => {
                        if (deleteBusy) event.preventDefault();
                    }}
                >
                    <DialogTitle>Hapus {deleting?.label}?</DialogTitle>
                    <DialogDescription>
                        “
                        {text(
                            deleting?.record.title ||
                                deleting?.record.name ||
                                deleting?.record.first_name ||
                                deleting?.record.type,
                        )}
                        ” akan dihapus. Tindakan ini tidak dapat dibatalkan dari
                        CMS.{demo && ' Hanya mengubah data demo di browser.'}
                    </DialogDescription>
                    {deleteError && (
                        <div className="cms-error" role="alert">
                            {deleteError}
                        </div>
                    )}
                    <div className="cms-dialog-actions">
                        <button
                            className="cms-button"
                            disabled={deleteBusy}
                            onClick={() => setDeleting(null)}
                        >
                            Batal
                        </button>
                        <button
                            className="cms-button cms-danger"
                            disabled={deleteBusy}
                            onClick={() => void remove()}
                        >
                            {deleteBusy ? (
                                <Loader2 size={16} className="cms-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            Hapus {deleting?.label}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={help} onOpenChange={setHelp}>
                <DialogContent className="cms-dialog cms-small-dialog">
                    <DialogTitle>Kenali workspace Anda</DialogTitle>
                    <DialogDescription>
                        Alur sederhana untuk konten yang terorganisir.
                    </DialogDescription>
                    <ol className="cms-help-steps">
                        <li>
                            <strong>Pilih satu brand.</strong>
                            <p>
                                Setiap konten dan akses terpisah menurut brand.
                            </p>
                        </li>
                        <li>
                            <strong>Mulai dari Halaman.</strong>
                            <p>
                                Buka satu halaman untuk mengubah teks, SEO, dan
                                section yang dipaginasikan.
                            </p>
                        </li>
                        <li>
                            <strong>Simpan, lalu terbitkan.</strong>
                            <p>
                                Editor mengelola draft dan arsip. Administrator
                                dapat menerbitkan konten.
                            </p>
                        </li>
                    </ol>
                    <div className="cms-notice">
                        {demo
                            ? 'Demo memakai tiga brand fiktif dan localStorage. Tidak ada perubahan database, akun nyata, atau provisioning domain.'
                            : 'Mode live memakai session login dan API Laravel. Error tidak pernah diganti diam-diam dengan data demo.'}
                    </div>
                    <button
                        className="cms-button cms-primary"
                        onClick={() => setHelp(false)}
                    >
                        Mengerti
                        <CheckCircle2 size={16} />
                    </button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
