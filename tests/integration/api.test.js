// tests/integration/api.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { api } from '../../js/services/api.js';
import { ApiError } from '../../js/services/ApiService.js';

describe('API Service Integration', () => {
    test('api instance should exist and have required methods', () => {
        assert.ok(api);
        assert.strictEqual(typeof api.request, 'function');
        assert.strictEqual(typeof api.setToken, 'function');
    });

    test('rejects a missing action before making a request', async () => {
        await assert.rejects(
            () => api.request(''),
            error => error instanceof ApiError &&
                error.code === 'BAD_REQUEST' &&
                error.message === 'Ação ausente no pedido.'
        );
    });

    test('normalizes a valid action for URL and JSON payload', () => {
        const service = new api.constructor({ apiUrl: 'https://example.test/exec' });
        service.token = 'test-token';
        const url = new URL(service.buildUrl(' saveBatch '));
        const body = service.buildBody({ action: 'saveBatch', type: 'ticket', rows: [{ id: '1' }] });

        assert.equal(url.searchParams.get('action'), 'saveBatch');
        assert.equal(body.action, 'saveBatch');
        assert.deepEqual(body.rows, [{ id: '1' }]);
    });

    test('preserves AbortError so a timed-out batch is not retried as another action', async () => {
        const service = new api.constructor({ apiUrl: 'https://example.test/exec', timeout: 1 });
        service.token = 'test-token';
        service.executeFetch = async () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            throw error;
        };

        await assert.rejects(
            () => service.saveBatch('ticket', [{ id: 'stable-1' }]),
            error => error.name === 'AbortError'
        );
    });
});
