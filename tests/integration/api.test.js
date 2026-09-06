// tests/integration/api.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { api } from '../../js/services/api.js';

describe('API Service Integration', () => {
    test('api instance should exist and have required methods', () => {
        assert.ok(api);
        assert.strictEqual(typeof api.request, 'function');
        assert.strictEqual(typeof api.setToken, 'function');
    });
});
