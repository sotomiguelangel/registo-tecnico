// tests/integration/auth.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { auth } from '../../js/services/auth.js';

describe('Auth Service Integration', () => {
    test('should set and retrieve authenticated user', async () => {
        auth.setUser({ username: 'admin', nombre: 'Admin', rol: 'admin' }, 'test-token');
        assert.strictEqual(auth.isAuthenticated(), true);
        assert.strictEqual(auth.isAdmin(), true);
        assert.strictEqual(auth.isViewer(), false);
        
        auth.logout();
        assert.strictEqual(auth.isAuthenticated(), false);
    });
});
