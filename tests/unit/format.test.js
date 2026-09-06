// tests/unit/format.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { formatTemperature, formatChlorine, formatBytes } from '../../js/utils/formatting.js';

function expect(actual) {
    return {
        toBe(expected) {
            assert.strictEqual(actual, expected);
        }
    };
}

describe('Format Utils', () => {
    test('formatTemperature should add °C unit', () => {
        expect(formatTemperature('4.5')).toBe('4,5 °C');
        expect(formatTemperature(null)).toBe('—');
    });

    test('formatChlorine should add ppm unit', () => {
        expect(formatChlorine('1.2')).toBe('1,20 ppm');
    });

    test('formatBytes should format sizes properly', () => {
        expect(formatBytes(1024)).toBe('1 KB');
        expect(formatBytes(1048576)).toBe('1 MB');
    });
});
