import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { openPageSelection as open } from '../../resources/js/cms/navigation.ts';

test('Opening another page through the arrow resets section pagination to 1', () => {
    let selected = { id: 1 };
    let sectionPage = 2;
    const record = { id: 2 };
    open(
        record,
        (value) => {
            selected = value;
        },
        (value) => {
            sectionPage = value;
        },
    );
    assert.equal(selected, record);
    assert.equal(sectionPage, 1);
    const source = readFileSync(
        new URL('../../resources/js/pages/cms/index.tsx', import.meta.url),
        'utf8',
    );
    assert.equal(
        (
            source.match(
                /onClick=\{\(\) =>\s*openPage\(\s*record,?\s*\)\s*\}/g,
            ) ?? []
        ).length,
        2,
    );
    assert.match(
        source,
        /openPageSelection\(record, setSelectedPage, setSectionPage\)/,
    );
});
