// tests/unit/date.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { formatDate, formatTime, isValidISODate } from '../../js/utils/date.js';

function expect(actual) {
    return {
        toBe(expected) {
            assert.strictEqual(actual, expected);
        },
        toBeTruthy() {
            assert.ok(actual);
        },
        toBeFalsy() {
            assert.ok(!actual);
        }
    };
}

describe('Date Utils', () => {
    test('formatDate should format YYYY-MM-DD to DD/MM/YYYY', () => {
        expect(formatDate('2026-01-15')).toBe('15/01/2026');
    });

    test('isValidISODate should validate ISO dates strictly', () => {
        expect(isValidISODate('2026-01-15')).toBeTruthy();
        expect(isValidISODate('2026/01/15')).toBeFalsy();
        expect(isValidISODate('invalid-date')).toBeFalsy();
    });

    test('formatTime should format date timestamp to HH:MM', () => {
        const d = new Date(2026, 0, 15, 14, 30);
        expect(formatTime(d)).toBe('14:30');
    });
});
