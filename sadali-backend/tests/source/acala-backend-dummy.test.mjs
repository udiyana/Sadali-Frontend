import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const snapshot = JSON.parse(fs.readFileSync(new URL('../../database/data/acala/backend-dummy.json', import.meta.url), 'utf8'));
test('Acala backend dummy snapshot names the requested backend and never claims an API export', () => {
    assert.equal(snapshot.source, 'Acala-Backend-gagal:repository-dummy');
    assert.equal(snapshot.provenance.live_database_available, false);
    assert.equal(snapshot.provenance.data_mode, 'dummy');
    assert.equal(snapshot.provenance.source_endpoint, '/api/cms/public-contents');
    assert.equal(snapshot.contents.length, 51);
    assert.equal(new Set(snapshot.contents.map(row => row.page)).size, 10);
    assert.equal(snapshot.datasets.length, 15);
    assert.equal(snapshot.images.length, 32);
    assert.deepEqual(snapshot.datasets.find(row => row.key === 'branches').data.map(row => row.slug), ['nusa-lembongan', 'nusa-dua']);
    for (const forbidden of ['site_scripts', 'users', 'auth', 'credentials', 'analytics']) {
        assert.equal(snapshot.datasets.some(row => row.key === forbidden), false);
    }
});
test('Dummy snapshot provenance hashes match actual Acala-Backend-gagal source contracts and seeds', () => {
    const root = process.env.RBI_ACALA_BACKEND_SOURCE ?? 'C:/laragon/www/Acala-Backend-gagal';
    for (const [file, expected] of Object.entries(snapshot.provenance.files)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root + '/' + file)).digest('hex'), expected, file);
    }
    const routes = fs.readFileSync(root + '/routes/api.php', 'utf8');
    assert.match(routes, /Route::get\('\/public-contents',\s*\[CmsContentController::class,\s*'index'\]/);
});
