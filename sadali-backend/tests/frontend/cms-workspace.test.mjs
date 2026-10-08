import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const helperUrl = new URL(
    '../../resources/js/cms/workspace.ts',
    import.meta.url,
);

test('Workspace selection resolves only the exact URL slug with no fallback', async () => {
    const workspace = await import(helperUrl.href);
    assert.equal(typeof workspace.resolveWorkspaceBrand, 'function');
    const brands = [
        { id: 1, slug: 'nusa-stay' },
        { id: 2, slug: 'sora-kitchen' },
    ];
    assert.equal(
        workspace.resolveWorkspaceBrand(true, 'sora-kitchen', null, brands),
        brands[1],
    );
    assert.equal(
        workspace.resolveWorkspaceBrand(true, 'unknown', null, brands),
        null,
    );
    assert.equal(
        workspace.resolveWorkspaceBrand(true, null, null, brands),
        null,
    );
    assert.equal(
        workspace.resolveWorkspaceBrand(false, 'nusa-stay', brands[0], brands),
        brands[0],
    );
    assert.equal(
        workspace.resolveWorkspaceBrand(
            false,
            'sora-kitchen',
            brands[0],
            brands,
        ),
        null,
    );
    assert.equal(
        workspace.resolveWorkspaceBrand(false, 'nusa-stay', null, brands),
        null,
    );
});

test('CMS UI binds initial brand to server slug and switches URLs behind editor protection', () => {
    const source = readFileSync(
        new URL('../../resources/js/pages/cms/index.tsx', import.meta.url),
        'utf8',
    );
    assert.match(
        source,
        /resolveWorkspaceBrand\(demo, cmsBrandSlug, cmsBrand, demoBrands\)/,
    );
    assert.match(source, /window\.location\.assign\(\s*workspaceUrl\(demo,/);
    assert.doesNotMatch(source, /brands\[0\]/);
    assert.match(source, /if \(editor \|\| deleting \|\| detailBusy\) return;/);
    const sidebar = source.slice(
        source.indexOf('<aside'),
        source.indexOf('</aside>'),
    );
    assert.match(sidebar, /aria-label="Pilih brand workspace"/);
    assert.match(sidebar, /switchWorkspace\(/);
    assert.match(source, /moduleKey === 'overview' && !workspaceMissing/);
});

test('Workspace URLs validate and encode a single brand slug', async () => {
    let workspace;
    try {
        workspace = await import(helperUrl.href);
    } catch {
        workspace = {};
    }
    assert.equal(
        typeof workspace.workspaceUrl,
        'function',
        'workspace URL helper exists',
    );
    assert.equal(workspace.workspaceUrl(false, 'nusa-stay'), '/cms/nusa-stay');
    assert.equal(
        workspace.workspaceUrl(true, 'sora-kitchen'),
        '/cms/demo/sora-kitchen',
    );
    assert.equal(workspace.workspaceUrl(false, null), '/cms');
    assert.equal(workspace.workspaceUrl(true, null), '/cms/demo');
    for (const slug of ['', '../cms', 'a/b', 'a%2fb', ' a ', 'Brand', 'demo']) {
        assert.throws(() => workspace.workspaceUrl(false, slug));
    }
});
