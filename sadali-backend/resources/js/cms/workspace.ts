import type { RecordData } from './adapter';

export function resolveWorkspaceBrand(
    demo: boolean,
    slug: string | null,
    liveBrand: RecordData | null,
    demoBrands: RecordData[],
): RecordData | null {
    if (slug === null) return null;
    return demo
        ? (demoBrands.find((brand) => brand.slug === slug) ?? null)
        : liveBrand?.slug === slug
          ? liveBrand
          : null;
}

export function workspaceUrl(demo: boolean, slug: string | null): string {
    const root = demo ? '/cms/demo' : '/cms';
    if (slug === null) return root;
    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        (!demo && slug === 'demo')
    ) {
        throw new Error('Slug workspace tidak valid.');
    }
    return `${root}/${encodeURIComponent(slug)}`;
}
