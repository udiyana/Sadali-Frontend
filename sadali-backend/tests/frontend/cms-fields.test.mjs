import test from 'node:test';
import assert from 'node:assert/strict';
import { modules, sectionModule } from '../../resources/js/cms/config.ts';

test('Section field lengths match backend allowlist limits', () => {
    assert.equal(
        sectionModule.fields.find((field) => field.key === 'config.heading')
            .max,
        160,
    );
    assert.equal(
        sectionModule.fields.find(
            (field) => field.key === 'config.button_label',
        ).max,
        80,
    );
});

test('HTML input patterns compile under browser Unicode-set v semantics', () => {
    for (const module of [...modules, sectionModule]) {
        for (const field of module.fields) {
            if (field.pattern) {
                assert.doesNotThrow(
                    () => new RegExp(field.pattern, 'v'),
                    `${module.key}.${field.key}`,
                );
            }
        }
    }
});
