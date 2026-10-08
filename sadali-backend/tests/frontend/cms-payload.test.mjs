import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeFields } from '../../resources/js/cms/payload.ts';
import { sectionModule } from '../../resources/js/cms/config.ts';

const serialize = (editor, values, demo) =>
    serializeFields(editor.module.fields, values, demo);

test('Section text permits the API limit of 10000 characters', () => {
    assert.equal(
        sectionModule.fields.find((field) => field.key === 'config.text').max,
        10000,
    );
});

test('Blank section fields explicitly clear config while omitting nonnullable limit', () => {
    const values = Object.fromEntries(
        sectionModule.fields.map((field) => [field.key, '']),
    );
    assert.deepEqual(
        serialize({ module: sectionModule }, values, false).config,
        {
            heading: null,
            text: null,
            button_label: null,
            button_url: null,
        },
    );
});
