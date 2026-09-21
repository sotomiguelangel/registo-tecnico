// tests/integration/api.test.js
import { describe, test, mock } from 'node:test';
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
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec' });
        service.token = 'test-token';
        const url = new URL(service.buildUrl(' saveBatch '));
        const body = service.buildBody({ action: 'saveBatch', type: 'ticket', rows: [{ id: '1' }] });

        assert.equal(url.searchParams.get('action'), 'saveBatch');
        assert.equal(body.action, 'saveBatch');
        assert.deepEqual(body.rows, [{ id: '1' }]);
    });

    test('preserves AbortError so a timed-out batch is not retried as another action', async () => {
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec', timeout: 1 });
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

    test('rejects an HTML 404 response with an explicit HTTP error', async () => {
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec' });
        service.executeFetch = async () => new Response('<!DOCTYPE html><title>404</title>', {
            status: 404,
            headers: { 'content-type': 'text/html' }
        });
        await assert.rejects(
            () => service.request('saveBatch', { type: 'ticket', rows: [{ id: '1' }] }),
            error => error.code === 'HTTP_404' && error.message.includes('HTTP 404')
        );
    });

    test('rejects non-JSON success responses instead of treating HTML as data', async () => {
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec' });
        service.executeFetch = async () => new Response('<!DOCTYPE html>login', {
            status: 200,
            headers: { 'content-type': 'text/html' }
        });
        await assert.rejects(
            () => service.request('health'),
            error => error.code === 'INVALID_CONTENT_TYPE'
        );
    });

    test('rejects empty batches and missing categories before fetch', async () => {
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec' });
        const fetchMock = mock.method(service, 'executeFetch');
        await assert.rejects(() => service.saveBatch('', [{ id: '1' }]), error => error.code === 'BAD_REQUEST');
        assert.equal(fetchMock.mock.calls.length, 0);
    });

    test('accepts a valid JSON response and preserves the server envelope', async () => {
        const service = new api.constructor({ apiUrl: 'http://localhost:3000/exec' });
        service.executeFetch = async () => new Response(JSON.stringify({ ok: true, saved: 1 }), {
            status: 200,
            headers: { 'content-type': 'application/json; charset=utf-8' }
        });
        assert.deepEqual(await service.saveBatch('ticket', [{ id: '1' }]), { ok: true, saved: 1 });
    });
});
