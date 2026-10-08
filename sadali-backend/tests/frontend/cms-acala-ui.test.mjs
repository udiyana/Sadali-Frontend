import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Acala isolated component uses private definition, bounded page-filtered lists, details and coordinated readback', () => {
    const source = readFileSync(
        new URL('../../resources/js/cms/drivers/AcalaCms.tsx', import.meta.url),
        'utf8',
    );
    for (const contract of [
        'definition',
        'per_page: 20',
        'page_key: pageKey',
        'createWriteCoordinator',
        'beforeunload',
        'customEditable',
        'serializeCustom',
        'AbortController',
        'VerificationPendingError',
        'cms-workspace-picker',
        'readKey',
        'Buka navigasi',
    ])
        assert.ok(source.includes(contract), contract);
    assert.ok(!source.includes('dangerouslySetInnerHTML'));
});
