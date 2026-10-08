import test from 'node:test';
import assert from 'node:assert/strict';
import { permissions } from '../../resources/js/cms/adapter.ts';
import {
    bannerParentIds,
    canEditBanner,
    createBannerPageResolver,
} from '../../resources/js/cms/banner-pages.ts';

const access = permissions({ id: 1, is_super_admin: false }, 'company_editor');
test('Banner permission resolves a parent outside the current picker batch', async () => {
    const calls = [];
    const resolver = createBannerPageResolver(async (path) => {
        calls.push(path);
        return { data: { id: 27, status: 'draft' } };
    }, 'brands/1');
    const record = { id: 7, page_id: 27, status: 'draft' };
    const pages = await resolver.resolve(
        [record, record],
        new AbortController().signal,
    );
    assert.equal(canEditBanner(record, pages.get(27), access), true);
    await resolver.resolve([record], new AbortController().signal);
    assert.deepEqual(calls, ['brands/1/pages/27']);
    assert.deepEqual(bannerParentIds([record, record]), [27]);
});

test('Parent cache stays bounded to the current batch', async () => {
    const calls = [];
    const resolver = createBannerPageResolver(async (path) => {
        calls.push(path);
        return {
            data: { id: Number(path.split('/').at(-1)), status: 'draft' },
        };
    }, 'brands/1');
    for (const id of [27, 28, 27]) {
        await resolver.resolve(
            [{ id, page_id: id }],
            new AbortController().signal,
        );
    }
    assert.deepEqual(calls, [
        'brands/1/pages/27',
        'brands/1/pages/28',
        'brands/1/pages/27',
    ]);
});

test('Banner parent errors fail closed and retry without a whole-tree request', async () => {
    let attempts = 0;
    const resolver = createBannerPageResolver(async () => {
        if (++attempts === 1) throw new Error('offline');
        return { data: { id: 27, status: 'published' } };
    }, 'brands/1');
    const record = { id: 7, page_id: 27, status: 'draft' };
    const signal = new AbortController().signal;
    assert.equal(canEditBanner(record, undefined, access), false);
    await assert.rejects(resolver.resolve([record], signal), /offline/);
    const pages = await resolver.resolve([record], signal);
    assert.equal(canEditBanner(record, pages.get(27), access), false);
    assert.equal(attempts, 2);
});

test('Resolvers cannot carry permissions across brands or malformed metadata', async () => {
    const calls = [];
    const request = async (path) => {
        calls.push(path);
        return { data: { id: 27 } };
    };
    const record = { id: 7, page_id: 27, status: 'draft' };
    for (const base of ['brands/1', 'brands/2']) {
        await assert.rejects(
            createBannerPageResolver(request, base).resolve(
                [record],
                new AbortController().signal,
            ),
            /verifikasi/,
        );
    }
    assert.deepEqual(calls, ['brands/1/pages/27', 'brands/2/pages/27']);
    assert.equal(canEditBanner(record, { id: 27 }, access), false);
    assert.equal(
        canEditBanner(record, { id: 28, status: 'draft' }, access),
        false,
    );
});

test('Aborted batches never expose cached page metadata', async () => {
    const resolver = createBannerPageResolver(
        async () => ({ data: { id: 27, status: 'draft' } }),
        'brands/1',
    );
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
        resolver.resolve([{ id: 7, page_id: 27 }], controller.signal),
        { name: 'AbortError' },
    );
});
