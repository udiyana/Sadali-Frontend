import test from 'node:test';
import assert from 'node:assert/strict';
import {
    driverFor,
    parseDefinition,
    serializeCustom,
    customEditable,
    initialValues,
} from '../../resources/js/cms/drivers/schema.ts';

const dataset = {
    key: 'datasets',
    fields: [
        { key: 'key', label: 'Key', type: 'text', required: true },
        { key: 'data', label: 'Data', type: 'json', required: true },
        { key: 'is_published', label: 'Published', type: 'checkbox' },
    ],
};
test('Dataset editor preserves object and array JSON roots, rejects invalid JSON and scripts', () => {
    assert.deepEqual(
        serializeCustom(
            dataset,
            { key: 'branches', data: '[{"x":1}]', is_published: true },
            false,
        ).data,
        [{ x: 1 }],
    );
    assert.deepEqual(
        serializeCustom(dataset, { key: 'branches', data: '{"x":1}' }, true)
            .data,
        { x: 1 },
    );
    assert.equal(
        serializeCustom(
            dataset,
            { key: 'branches', data: '[]', is_published: true },
            false,
        ).is_published,
        false,
    );
    for (const data of ['no-json'])
        assert.throws(() =>
            serializeCustom(dataset, { key: 'branches', data }, true),
        );
    assert.throws(() =>
        serializeCustom(dataset, { key: 'site_scripts', data: '{}' }, true),
    );
    assert.equal(initialValues(dataset, { data: [1] }).data, '[\n  1\n]');
    assert.equal(
        customEditable(
            { admin: false, canEdit: () => true },
            { is_published: true },
        ),
        false,
    );
    assert.equal(customEditable({ admin: false, canEdit: () => false }), false);
});

test('Dataset editor round-trips every JSON root accepted by the API', () => {
    for (const data of [null, false, 0, 123, 'value', {}, []]) {
        const values = initialValues(dataset, { key: 'branches', data });
        assert.equal(values.data, JSON.stringify(data, null, 2));
        assert.deepEqual(serializeCustom(dataset, values, true).data, data);
    }
    assert.equal(initialValues(dataset).data, '');
});

test('Image slots require an administrator because replacements are immediately public', () => {
    const editor = { admin: false, canEdit: () => true };
    assert.equal(customEditable(editor, undefined, 'image-slots'), false);
    assert.equal(customEditable(editor, { id: 1 }, 'image-slots'), false);
    assert.equal(
        customEditable(editor, { is_published: false }, 'datasets'),
        true,
    );
    assert.equal(
        customEditable(
            { admin: true, canEdit: () => true },
            { id: 1 },
            'image-slots',
        ),
        true,
    );
});

test('Only registered code drivers run; demo always stays generic', () => {
    assert.equal(driverFor(undefined, false), 'generic');
    assert.equal(driverFor('acala', false), 'acala');
    assert.equal(driverFor('remote-script', false), null);
    assert.equal(driverFor('acala', true), 'generic');
});
test('Acala definition accepts only known modules and never site scripts', () => {
    const definition = {
        driver: 'acala',
        name: 'Acala',
        pages: ['home'],
        datasets: [],
        modules: [{ key: 'datasets', label: 'Datasets', fields: [] }],
    };
    assert.deepEqual(parseDefinition(definition).pages, ['home']);
    assert.throws(() => parseDefinition({ ...definition, driver: 'other' }));
    assert.throws(() =>
        parseDefinition({
            ...definition,
            modules: [{ key: 'site_scripts', fields: [] }],
        }),
    );
});
