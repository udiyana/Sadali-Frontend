import type { Envelope, RecordData, RequestOptions } from './adapter';

type Request = (path: string, options?: RequestOptions) => Promise<Envelope>;
type Mutation = { path: string; method: string };
type Committed = {
    target: string | null;
    id?: number;
    body: Record<string, unknown>;
};
export const verificationMessage =
    'Data sudah tersimpan, namun verifikasi belum berhasil. Coba verifikasi ulang; jangan membuat data yang sama lagi.';

export class VerificationPendingError extends Error {
    constructor() {
        super(verificationMessage);
        this.name = 'VerificationPendingError';
    }
}

// Memory only, scoped to one mounted editor. A committed mutation is never sent twice.
export function createWriteCoordinator() {
    let committed: Committed | null = null;
    let inFlight: Promise<Envelope> | null = null;
    async function run(
        request: Request,
        mutation: Mutation,
        body: Record<string, unknown>,
    ) {
        if (!committed) {
            const result = await request(mutation.path, {
                method: mutation.method,
                body,
            });
            const saved = result.data as RecordData | null;
            const id =
                saved &&
                !Array.isArray(saved) &&
                Number.isSafeInteger(saved.id) &&
                saved.id > 0
                    ? saved.id
                    : undefined;
            committed = {
                target:
                    mutation.method === 'POST'
                        ? id
                            ? `${mutation.path}/${id}`
                            : null
                        : mutation.path,
                id,
                body: Object.fromEntries(
                    Object.entries(body).filter(
                        ([key]) => !key.startsWith('password'),
                    ),
                ),
            };
        }
        try {
            if (!committed.target) throw new Error('Missing created ID');
            const verified = await request(committed.target);
            const record = verified.data;
            if (
                !record ||
                Array.isArray(record) ||
                (committed.id && record.id !== committed.id)
            ) {
                throw new Error('Invalid readback');
            }
            return verified;
        } catch {
            // Do not retain transport errors or sensitive request bodies in error objects.
            throw new VerificationPendingError();
        }
    }
    return {
        get committed() {
            return committed;
        },
        save(
            request: Request,
            mutation: Mutation,
            body: Record<string, unknown>,
        ) {
            if (!inFlight) {
                inFlight = run(request, mutation, body).finally(() => {
                    inFlight = null;
                });
            }
            return inFlight;
        },
    };
}
