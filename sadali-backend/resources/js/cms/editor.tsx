import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Loader2, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { ApiError, type RecordData } from './adapter';
import { type Field, type Module } from './config';
import { serializeFields } from './payload';
import { VerificationPendingError } from './write';
export const text = (value: unknown) =>
    typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : '';
function valueAt(record: Record<string, unknown>, key: string): unknown {
    const [parent, child] = key.split('.');
    return child
        ? (record[parent] as Record<string, unknown> | undefined)?.[child]
        : record[key];
}
export function errorText(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401)
            return 'Anda belum masuk. Silakan login untuk melanjutkan.';
        if (error.status === 403)
            return 'Anda tidak memiliki izin untuk tindakan ini.';
        if (error.status === 419)
            return 'Session kedaluwarsa. Muat ulang dan login kembali; perubahan belum disimpan.';
        return error.message;
    }
    return error instanceof Error
        ? error.message
        : 'Terjadi kesalahan. Silakan coba lagi.';
}
export type Editor = {
    module: Module;
    record: RecordData | null;
    path: string;
    method: string;
    pageId?: number;
};
export function RecordEditor({
    editor,
    brands,
    pages,
    canPublish,
    demo,
    onSave,
    onClose,
    onPageNext,
    pageNumber,
    hasPageNext,
}: {
    editor: Editor;
    brands: RecordData[];
    pages: RecordData[];
    canPublish: boolean;
    demo: boolean;
    onSave: (body: Record<string, unknown>) => Promise<void>;
    onClose: (verificationPending?: boolean) => void;
    onPageNext: (direction: number) => void;
    pageNumber: number;
    hasPageNext: boolean;
}) {
    const [values, setValues] = useState<Record<string, string | boolean>>(() =>
        Object.fromEntries(
            editor.module.fields.map((field) => [
                field.key,
                field.type === 'checkbox'
                    ? Boolean(valueAt(editor.record ?? {}, field.key) ?? true)
                    : text(
                          valueAt(editor.record ?? {}, field.key) ??
                              (field.type === 'select'
                                  ? field.options?.[0]
                                  : field.type === 'color'
                                    ? '#087f72'
                                    : field.key === 'position'
                                      ? 0
                                      : ''),
                      ),
            ]),
        ),
    );
    const [memberships, setMemberships] = useState<
        { company_id: number; role: string }[]
    >(() =>
        Array.isArray(editor.record?.memberships)
            ? (
                  editor.record.memberships as {
                      company_id: number;
                      role: string;
                  }[]
              ).map((item) => ({
                  company_id: item.company_id,
                  role: item.role,
              }))
            : [],
    );
    const [busy, setBusy] = useState(false);
    const [verificationPending, setVerificationPending] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [discard, setDiscard] = useState(false);
    const baseline = useRef(JSON.stringify({ values, memberships }));
    const dirty = JSON.stringify({ values, memberships }) !== baseline.current;
    const focused = useRef<HTMLElement | null>(
        typeof document !== 'undefined'
            ? (document.activeElement as HTMLElement)
            : null,
    );
    useEffect(() => {
        const element = focused.current;
        return () => {
            requestAnimationFrame(() => {
                if (element?.isConnected) element.focus();
                else
                    document
                        .querySelector<HTMLElement>('.cms-page-heading h1')
                        ?.focus();
            });
        };
    }, []);
    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (dirty && !verificationPending) event.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty, verificationPending]);
    const close = () => {
        if (busy) return;
        if (verificationPending) onClose(true);
        else if (dirty) setDiscard(true);
        else onClose();
    };
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError('');
        setErrors({});
        const body = serializeFields(editor.module.fields, values, demo);
        if (editor.module.key === 'users') body.memberships = memberships;
        if (editor.pageId) body.page_id = editor.pageId;
        try {
            await onSave(body);
            onClose();
        } catch (failure) {
            if (failure instanceof VerificationPendingError) {
                setVerificationPending(true);
                setValues((previous) =>
                    Object.fromEntries(
                        Object.entries(previous).map(([key, value]) => [
                            key,
                            key.startsWith('password') ? '' : value,
                        ]),
                    ),
                );
            }
            setError(errorText(failure));
            if (failure instanceof ApiError) setErrors(failure.fields);
        } finally {
            setBusy(false);
        }
    }
    function renderField(field: Field) {
        if (field.type === 'password' && demo) return null;
        const id = `cms-field-${field.key}`;
        const fieldErrors = errors[field.key];
        const common = {
            id,
            name: field.key,
            disabled: busy || verificationPending,
            required:
                field.required || (field.type === 'password' && !editor.record),
            'aria-invalid': Boolean(fieldErrors),
            'aria-describedby': `${id}-help`,
            onChange: (
                event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >,
            ) =>
                setValues((previous) => ({
                    ...previous,
                    [field.key]:
                        field.type === 'checkbox'
                            ? (event.target as HTMLInputElement).checked
                            : event.target.value,
                })),
        };
        const options =
            (field.key === 'status' && !canPublish
                ? field.options?.filter((option) => option !== 'published')
                : field.options) ?? [];
        return (
            <div
                key={field.key}
                className={
                    field.type === 'textarea'
                        ? 'cms-field cms-wide'
                        : 'cms-field'
                }
            >
                <label htmlFor={id}>
                    {field.label}
                    {common.required && (
                        <span className="cms-required"> *</span>
                    )}
                </label>
                {field.type === 'select' ? (
                    <>
                        <select {...common} value={text(values[field.key])}>
                            {field.key === 'page_id' ? (
                                <>
                                    <option value="">Pilih halaman…</option>
                                    {pages
                                        .filter(
                                            (page) =>
                                                canPublish ||
                                                page.status !== 'published',
                                        )
                                        .map((page) => (
                                            <option
                                                key={page.id}
                                                value={page.id}
                                            >
                                                {text(page.title)} ·{' '}
                                                {text(page.status)}
                                            </option>
                                        ))}
                                </>
                            ) : (
                                options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))
                            )}
                        </select>
                        {field.key === 'page_id' && (
                            <div className="cms-inline">
                                <button
                                    type="button"
                                    className="cms-text-button"
                                    disabled={
                                        pageNumber === 1 ||
                                        busy ||
                                        verificationPending
                                    }
                                    onClick={() => onPageNext(-1)}
                                >
                                    Sebelumnya
                                </button>
                                <span className="cms-muted">
                                    Halaman {pageNumber}
                                </span>
                                <button
                                    type="button"
                                    className="cms-text-button"
                                    disabled={
                                        !hasPageNext ||
                                        busy ||
                                        verificationPending
                                    }
                                    onClick={() => onPageNext(1)}
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </>
                ) : field.type === 'textarea' ? (
                    <textarea
                        {...common}
                        value={text(values[field.key])}
                        maxLength={field.max}
                        rows={field.key === 'body' ? 7 : 3}
                    />
                ) : field.type === 'checkbox' ? (
                    <input
                        {...common}
                        type="checkbox"
                        checked={Boolean(values[field.key])}
                    />
                ) : (
                    <input
                        {...common}
                        type={field.type ?? 'text'}
                        value={text(values[field.key])}
                        pattern={field.pattern}
                        maxLength={
                            field.type === 'number' ? undefined : field.max
                        }
                        minLength={
                            field.type === 'password' ? field.min : undefined
                        }
                        min={field.type === 'number' ? field.min : undefined}
                        max={field.type === 'number' ? field.max : undefined}
                        step={
                            field.key === 'price'
                                ? '0.01'
                                : field.type === 'number'
                                  ? '1'
                                  : undefined
                        }
                        autoComplete={
                            field.type === 'password' ? 'new-password' : 'off'
                        }
                    />
                )}
                <div id={`${id}-help`}>
                    {field.hint && <p className="cms-hint">{field.hint}</p>}
                    {fieldErrors?.map((message) => (
                        <p className="cms-field-error" key={message}>
                            {message}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <>
            <Dialog
                open
                onOpenChange={(open) => {
                    if (!open) close();
                }}
            >
                <DialogContent
                    className="cms-dialog"
                    onEscapeKeyDown={(event) => {
                        event.preventDefault();
                        close();
                    }}
                    onPointerDownOutside={(event) => {
                        event.preventDefault();
                        close();
                    }}
                >
                    <DialogTitle>
                        {editor.record ? 'Edit' : 'Tambah'}{' '}
                        {editor.module.singular}
                    </DialogTitle>
                    <DialogDescription>
                        {editor.module.description}
                    </DialogDescription>
                    <form onSubmit={submit} className="cms-editor-form">
                        {demo && (
                            <div className="cms-notice">
                                Perubahan hanya disimpan di browser ini, bukan
                                database.{' '}
                                {editor.module.key === 'users' &&
                                    'Tidak membuat akun atau password nyata.'}
                            </div>
                        )}
                        {error && (
                            <div className="cms-error" role="alert">
                                <strong>
                                    {verificationPending
                                        ? 'Tersimpan; menunggu verifikasi'
                                        : 'Belum tersimpan'}
                                </strong>
                                <p>{error}</p>
                                {Object.entries(errors)
                                    .filter(
                                        ([key]) =>
                                            !editor.module.fields.some(
                                                (field) => field.key === key,
                                            ),
                                    )
                                    .map(([key, messages]) => (
                                        <p key={key}>
                                            {key}: {messages.join(' ')}
                                        </p>
                                    ))}
                            </div>
                        )}
                        <div className="cms-form-grid">
                            {editor.module.fields.map(renderField)}
                        </div>
                        {editor.module.key === 'users' && (
                            <fieldset className="cms-memberships">
                                <legend>Akses brand</legend>
                                <p className="cms-hint">
                                    Penyimpanan mengganti seluruh membership.
                                    Akses brand di halaman lain tetap
                                    dipertahankan.
                                </p>
                                {brands.map((brand) => (
                                    <label key={brand.id}>
                                        <span>{text(brand.name)}</span>
                                        <select
                                            aria-label={`Role ${text(brand.name)}`}
                                            disabled={
                                                busy || verificationPending
                                            }
                                            value={
                                                memberships.find(
                                                    (item) =>
                                                        item.company_id ===
                                                        brand.id,
                                                )?.role ?? ''
                                            }
                                            onChange={(event) =>
                                                setMemberships((previous) => [
                                                    ...previous.filter(
                                                        (item) =>
                                                            item.company_id !==
                                                            brand.id,
                                                    ),
                                                    ...(event.target.value
                                                        ? [
                                                              {
                                                                  company_id:
                                                                      brand.id,
                                                                  role: event
                                                                      .target
                                                                      .value,
                                                              },
                                                          ]
                                                        : []),
                                                ])
                                            }
                                        >
                                            <option value="">
                                                Tanpa akses
                                            </option>
                                            <option value="company_admin">
                                                Administrator
                                            </option>
                                            <option value="company_editor">
                                                Editor
                                            </option>
                                        </select>
                                    </label>
                                ))}
                            </fieldset>
                        )}
                        <footer className="cms-form-footer">
                            <span className="cms-muted">
                                {verificationPending ? (
                                    'Data tersimpan; verifikasi belum selesai'
                                ) : dirty ? (
                                    'Perubahan belum disimpan'
                                ) : (
                                    <>
                                        <Check size={14} /> Siap diedit
                                    </>
                                )}
                            </span>
                            <div className="cms-inline">
                                <button
                                    type="button"
                                    className="cms-button"
                                    onClick={close}
                                    disabled={busy}
                                >
                                    {verificationPending ? 'Tutup' : 'Batal'}
                                </button>
                                <button
                                    className="cms-button cms-primary"
                                    disabled={busy}
                                >
                                    {busy ? (
                                        <Loader2
                                            className="cms-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <Save size={16} />
                                    )}{' '}
                                    {busy
                                        ? verificationPending
                                            ? 'Memverifikasi…'
                                            : 'Menyimpan…'
                                        : verificationPending
                                          ? 'Coba verifikasi'
                                          : 'Simpan perubahan'}
                                </button>
                            </div>
                        </footer>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={discard} onOpenChange={setDiscard}>
                <DialogContent className="cms-dialog cms-small-dialog">
                    <DialogTitle>Abaikan perubahan?</DialogTitle>
                    <DialogDescription>
                        Perubahan yang belum disimpan akan hilang. Anda dapat
                        kembali ke form untuk melanjutkan.
                    </DialogDescription>
                    <div className="cms-dialog-actions">
                        <button
                            className="cms-button"
                            onClick={() => setDiscard(false)}
                        >
                            Lanjutkan mengedit
                        </button>
                        <button
                            className="cms-button cms-danger"
                            onClick={() => onClose()}
                        >
                            Abaikan perubahan
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
