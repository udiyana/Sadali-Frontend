import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../resources/js/cms/adapter.ts');
test('live normalizes central users paginator and rejects non-JSON successful responses', async () => {
    const { createAdapter } = await load();
    const adapter = createAdapter({
        demo: false,
        fetcher: async () =>
            new Response(
                JSON.stringify({
                    data: [{ id: 2 }],
                    current_page: 2,
                    last_page: 4,
                    per_page: 8,
                    total: 27,
                }),
            ),
    });
    assert.equal(
        (await adapter.request('users', { query: { page: 2 } })).meta.last_page,
        4,
    );
    const malformed = createAdapter({
        demo: false,
        fetcher: async () => new Response('<html>login</html>'),
    });
    await assert.rejects(malformed.request('brands'));
});
test('demo prevents root brand count changes and validates content before persisting', async () => {
    const { createAdapter, ApiError } = await load();
    const adapter = createAdapter({ demo: true });
    await assert.rejects(
        adapter.request('brands', {
            method: 'POST',
            body: { name: 'Fourth', slug: 'fourth' },
        }),
        (e) => e instanceof ApiError && e.status === 403,
    );
    await assert.rejects(
        adapter.request('brands/1', { method: 'DELETE' }),
        (e) => e.status === 403,
    );
    await assert.rejects(
        adapter.request('brands/1/pages', {
            method: 'POST',
            body: { title: '', slug: 'INVALID SLUG' },
        }),
        (e) => e.status === 422 && Boolean(e.fields.title && e.fields.slug),
    );
    assert.equal((await adapter.request('brands')).meta.total, 3);
});
test('permissions deny editor publishing and changes to published records or published banner pages', async () => {
    const { permissions } = await load();
    const editor = permissions(
        { id: 4, is_super_admin: false },
        'company_editor',
    );
    assert.equal(editor.admin, false);
    assert.equal(editor.canEdit({ id: 1, status: 'draft' }), true);
    assert.equal(editor.canEdit({ id: 1, status: 'published' }), false);
    assert.equal(
        editor.canEdit(
            { id: 1, status: 'draft' },
            { id: 2, status: 'published' },
        ),
        false,
    );
    assert.equal(
        permissions(null, undefined).canEdit({ id: 1, status: 'draft' }),
        false,
    );
    assert.equal(permissions({ id: 1, is_super_admin: true }).admin, true);
});
test('demo CRUD is scoped, persisted, paginated and strips passwords', async () => {
    const { createAdapter, DEMO_KEY } = await load();
    const map = new Map();
    const storage = {
        getItem: (k) => map.get(k) ?? null,
        setItem: (k, v) => map.set(k, v),
    };
    const adapter = createAdapter({ demo: true, storage });
    const created = await adapter.request('brands/1/pages', {
        method: 'POST',
        body: {
            title: 'Test page',
            slug: 'test-page',
            status: 'draft',
            body: 'Plain text',
        },
    });
    assert.equal(
        (await adapter.request(`brands/1/pages/${created.data.id}/editor`)).data
            .page.body,
        'Plain text',
    );
    await assert.rejects(adapter.request(`brands/2/pages/${created.data.id}`));
    const restarted = createAdapter({ demo: true, storage });
    assert.equal(
        (await restarted.request(`brands/1/pages/${created.data.id}`)).data
            .title,
        'Test page',
    );
    const list = await restarted.request('brands/1/pages', {
        query: { per_page: 1, page: 2 },
    });
    assert.equal(list.data.length, 1);
    assert.equal(list.meta.current_page, 2);
    await adapter.request('users', {
        method: 'POST',
        body: {
            name: 'Demo member',
            email: 'demo@example.test',
            password: 'never-persist-secret',
            password_confirmation: 'never-persist-secret',
        },
    });
    assert.ok(!map.get(DEMO_KEY).includes('never-persist-secret'));
    await adapter.request(`brands/1/pages/${created.data.id}`, {
        method: 'DELETE',
    });
    await assert.rejects(adapter.request(`brands/1/pages/${created.data.id}`));
});
test('live preserves validation and session errors and accepts empty deletion', async () => {
    const { createAdapter, ApiError } = await load();
    for (const status of [401, 403, 419, 422]) {
        const adapter = createAdapter({
            demo: false,
            cookie: () => '',
            fetcher: async () =>
                new Response(
                    JSON.stringify({
                        message: 'Invalid',
                        errors: { title: ['Required'] },
                    }),
                    { status },
                ),
        });
        await assert.rejects(
            adapter.request('brands'),
            (error) =>
                error instanceof ApiError &&
                error.status === status &&
                error.fields.title[0] === 'Required',
        );
    }
    const adapter = createAdapter({
        demo: false,
        cookie: () => '',
        fetcher: async () => new Response(null, { status: 204 }),
    });
    assert.equal(
        (await adapter.request('brands/1/pages/1', { method: 'DELETE' })).data,
        null,
    );
});
test('demo lists exactly three fictional brands without fetching', async () => {
    const { createAdapter } = await load();
    const adapter = createAdapter({
        demo: true,
        fetcher: () => {
            throw Error('network forbidden');
        },
    });
    const result = await adapter.request('brands');
    assert.deepEqual(
        result.data.map((x) => x.name),
        ['Nusa Stay', 'Sora Kitchen', 'Aruna Wellness'],
    );
    assert.equal(result.meta.total, 3);
});
test('live mutations send decoded CSRF, same-origin credentials and never fallback', async () => {
    const { createAdapter } = await load();
    let seen;
    const adapter = createAdapter({
        demo: false,
        cookie: () => 'XSRF-TOKEN=a%2Bb%3D',
        fetcher: async (url, init) => {
            seen = { url, ...init };
            return new Response(
                JSON.stringify({ data: { id: 10, title: 'New' } }),
                { status: 201 },
            );
        },
    });
    const result = await adapter.request('brands/1/pages', {
        method: 'POST',
        body: { title: 'New', slug: 'new' },
    });
    assert.equal(result.data.id, 10);
    assert.equal(seen.url, '/api/v1/cms/brands/1/pages');
    assert.equal(seen.credentials, 'same-origin');
    assert.equal(seen.headers['X-XSRF-TOKEN'], 'a+b=');
    assert.equal(seen.headers.Accept, 'application/json');
});
