import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createWriteCoordinator,
    VerificationPendingError,
} from '../../resources/js/cms/write.ts';
const makeSave = (request, editor) => {
    const coordinator = createWriteCoordinator();
    return (body) => coordinator.save(request, editor, body);
};

test('A committed POST retries only its verification GET', async () => {
    const methods = [];
    let reads = 0;
    const request = async (path, options = {}) => {
        methods.push(options.method ?? 'GET');
        if (options.method === 'POST') return { data: { id: 9 } };
        if (++reads === 1) throw new Error('offline');
        assert.equal(path, 'brands/1/guests/9');
        return { data: { id: 9 } };
    };
    const save = makeSave(request, { path: 'brands/1/guests', method: 'POST' });
    await assert.rejects(save({ first_name: 'A' }));
    await save({ first_name: 'A' });
    assert.deepEqual(methods, ['POST', 'GET', 'GET']);
});

test('PATCH verification retries without resending edits and retains no passwords', async () => {
    const coordinator = createWriteCoordinator();
    const methods = [];
    let reads = 0;
    const request = async (path, options = {}) => {
        methods.push(options.method ?? 'GET');
        if (options.method === 'PATCH') return { data: { id: 9 } };
        if (++reads === 1) throw new Error('offline');
        return { data: { id: 9, name: 'Saved' } };
    };
    const mutation = { path: 'users/9', method: 'PATCH' };
    await assert.rejects(
        coordinator.save(request, mutation, {
            name: 'Saved',
            password: 'private',
            password_confirmation: 'private',
        }),
        VerificationPendingError,
    );
    assert.deepEqual(coordinator.committed, {
        target: 'users/9',
        id: 9,
        body: { name: 'Saved' },
    });
    await coordinator.save(request, mutation, { name: 'Changed' });
    assert.deepEqual(methods, ['PATCH', 'GET', 'GET']);
});

test('Concurrent submissions share the same mutation and verification', async () => {
    const coordinator = createWriteCoordinator();
    const methods = [];
    const request = async (path, options = {}) => {
        methods.push(options.method ?? 'GET');
        return { data: { id: 9 } };
    };
    const mutation = { path: 'brands/1/guests', method: 'POST' };
    await Promise.all([
        coordinator.save(request, mutation, {}),
        coordinator.save(request, mutation, {}),
    ]);
    assert.deepEqual(methods, ['POST', 'GET']);
});

test('Rejected mutations remain editable, but malformed committed responses never repeat POST', async () => {
    const coordinator = createWriteCoordinator();
    let writes = 0;
    const request = async () => {
        if (++writes === 1) throw new Error('validation');
        return { data: null };
    };
    const mutation = { path: 'brands/1/guests', method: 'POST' };
    await assert.rejects(coordinator.save(request, mutation, {}), /validation/);
    assert.equal(coordinator.committed, null);
    await assert.rejects(
        coordinator.save(request, mutation, {}),
        VerificationPendingError,
    );
    await assert.rejects(
        coordinator.save(request, mutation, {}),
        VerificationPendingError,
    );
    assert.equal(writes, 2);
});
