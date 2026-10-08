import type { Envelope, RecordData, RequestOptions } from './adapter';

type Request = (path: string, options?: RequestOptions) => Promise<Envelope>;

export function bannerParentIds(records: RecordData[]): number[] {
    return [...new Set(records.map((record) => Number(record.page_id)))].filter(
        (id) => Number.isSafeInteger(id) && id > 0,
    );
}

// One instance per brand/revision. Only parents referenced by this batch load.
export function createBannerPageResolver(request: Request, base: string) {
    const cache = new Map<number, Promise<RecordData>>();
    async function resolve(records: RecordData[], signal: AbortSignal) {
        const ids = bannerParentIds(records);
        for (const id of cache.keys()) {
            if (!ids.includes(id)) cache.delete(id);
        }
        const pages = await Promise.all(
            ids.map((id) => {
                let pending = cache.get(id);
                if (!pending) {
                    pending = request(`${base}/pages/${id}`, { signal })
                        .then((result) => {
                            const page = result.data;
                            if (
                                !page ||
                                Array.isArray(page) ||
                                page.id !== id ||
                                !['draft', 'archived', 'published'].includes(
                                    String(page.status),
                                )
                            ) {
                                throw new Error(
                                    'Status halaman banner belum dapat diverifikasi. Coba lagi.',
                                );
                            }
                            return page;
                        })
                        .catch((error) => {
                            if (cache.get(id) === pending) cache.delete(id);
                            throw error;
                        });
                    cache.set(id, pending);
                }
                return pending;
            }),
        );
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        return new Map(pages.map((page) => [page.id, page]));
    }
    return { resolve };
}

export function canEditBanner(
    record: RecordData,
    parent: RecordData | undefined,
    access: {
        admin: boolean;
        canEdit: (record?: RecordData, page?: RecordData) => boolean;
    },
): boolean {
    return (
        access.admin ||
        Boolean(
            parent &&
            parent.id === Number(record.page_id) &&
            ['draft', 'archived', 'published'].includes(
                String(parent.status),
            ) &&
            access.canEdit(record, parent),
        )
    );
}
