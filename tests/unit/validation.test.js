// tests/unit/validation.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { validateDate, validateNumber, validateRequired } from '../../js/utils/validation.js';

// Jest-compatible expect wrapper over node:assert
function expect(actual) {
    return {
        toBe(expected) {
            assert.strictEqual(actual, expected);
        },
        toBeNull() {
            assert.strictEqual(actual, null);
        },
        toEqual(expected) {
            assert.deepStrictEqual(actual, expected);
        }
    };
}

describe('Validation Utils', () => {
    
    describe('validateRequired', () => {
        test('should return error for empty value', () => {
            expect(validateRequired('')).toBe('Campo obligatorio');
            expect(validateRequired(null)).toBe('Campo obligatorio');
            expect(validateRequired(undefined)).toBe('Campo obligatorio');
        });
        
        test('should return null for valid value', () => {
            expect(validateRequired('test')).toBeNull();
            expect(validateRequired('123')).toBeNull();
        });
    });
    
    describe('validateDate', () => {
        test('should validate ISO date format', () => {
            expect(validateDate('2024-01-15')).toBeNull();
            expect(validateDate('2024/01/15')).toBe('Formato inválido');
            expect(validateDate('15/01/2024')).toBe('Formato inválido');
        });
    });

    describe('validateNumber', () => {
        test('should validate numeric values and ranges', () => {
            expect(validateNumber('7.2', 7.0, 7.8)).toBeNull();
            expect(validateNumber('6.5', 7.0, 7.8)).toBe('O valor não pode ser inferior a 7');
            expect(validateNumber('8.5', 7.0, 7.8)).toBe('O valor não pode ser superior a 7.8');
            expect(validateNumber('abc')).toBe('Número inválido');
        });
    });
});
