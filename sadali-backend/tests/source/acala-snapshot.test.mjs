import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = new URL('../../', import.meta.url);
const snapshot = JSON.parse(fs.readFileSync(new URL('database/data/acala/source.json', root), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(new URL('database/data/acala/assets-manifest.json', root), 'utf8'));
test('Acala snapshot contains actual repository CMS records with truthful provenance', () => {
 assert.equal(snapshot.source, 'acala-barbistro-rebuild:repository-seeds');
 assert.equal(snapshot.provenance.live_database_available, false);
 assert.equal(snapshot.contents.length, 51);
 assert.equal(new Set(snapshot.contents.map(row=>row.page)).size,10);
 assert.equal(snapshot.datasets.length,15);
 assert.equal(snapshot.images.length,32);
 assert.equal(new Set(snapshot.contents.map(row=>`${row.page}/${row.section}`)).size,51);
 assert.equal(new Set(snapshot.datasets.map(row=>row.key)).size,15);
 assert.equal(new Set(snapshot.images.map(row=>row.key)).size,32);
 assert.equal(snapshot.datasets.some(row=>row.key==='site_scripts'),false);
 for(const hash of Object.values(snapshot.provenance.files)) assert.match(hash,/^[a-f0-9]{64}$/);
 assert.ok(snapshot.datasets.find(row=>row.key==='branches').data.some(branch=>branch.slug==='nusa-lembongan'));
 assert.ok(snapshot.datasets.find(row=>row.key==='branches').data.some(branch=>branch.slug==='nusa-dua'));
});
test('Acala copied assets match their source checksums without path traversal', () => {
 assert.equal(Object.keys(manifest.copied).length,32);
 for(const entry of Object.values(manifest.copied)) {
  assert.ok(entry.url.startsWith('/outlet-assets/acala/'));
  assert.equal(entry.url.split('/').includes('..'),false);
  const file=fileURLToPath(new URL('public'+entry.url,root));
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),entry.sha256);
 }
 assert.deepEqual(manifest.missing,['/Branch/Acala nusa dua/DSC03517.jpg']);
});
