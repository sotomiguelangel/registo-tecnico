// tests/unit/mobile-sync.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Mobile Sync & Date Normalization Resilience', () => {
    test('index.html contains enhanced sync queue with silent reauth and mobile banner', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        assert.ok(html.includes('attemptSilentReauth'), 'Should have attemptSilentReauth');
        assert.ok(html.includes('syncMobileBanner'), 'Should include syncMobileBanner element');
        assert.ok(html.includes('forceSyncAll'), 'Should include forceSyncAll');
        assert.ok(html.includes('visibilitychange'), 'Should listen to visibilitychange for mobile resumes');
    });

    test('index.html normalizes fecha in mergeServerRecordsWithPending and saveRecord', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        assert.ok(html.includes('normalizeDate(recData.fecha)'), 'Should normalize incoming server dates');
        assert.ok(html.includes('normalizeDate(data.fecha)'), 'Should normalize saved record dates');
    });

    test('indicadores.html normalizes data.fecha in normalizeRecord', () => {
        const html = fs.readFileSync('indicadores.html', 'utf8');
        assert.ok(html.includes('if (parsedDate) {\n        data.fecha = parsedDate;\n      }'), 'Should assign parsedDate to data.fecha in indicadores');
    });

    test('tickets use enqueueSync for offline mobile resilience', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        assert.ok(html.includes("action: 'saveTicket'") && html.includes("type: 'ticket'"), 'Should enqueue tickets in sync queue');
    });

    test('date normalization parses YYYY-MM-DD HH:mm:ss, ISO, and DD/MM/YYYY formats', () => {
        const pad = n => String(n).padStart(2, '0');
        function normalizeDate(value) {
            if (!value) return '';
            if (value instanceof Date && !isNaN(value.getTime())) {
                return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
            }
            const s = String(value).trim();
            if (!s) return '';
            if (/^\d{10,13}$/.test(s)) {
                const num = Number(s.length === 10 ? s + '000' : s);
                const dt = new Date(num);
                if (!isNaN(dt.getTime())) {
                    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
                }
            }
            let match = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:$|T|\s)/);
            if (match) {
                return `${match[1]}-${pad(Number(match[2]))}-${pad(Number(match[3]))}`;
            }
            match = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:$|T|\s)/);
            if (match) {
                return `${match[3]}-${pad(Number(match[2]))}-${pad(Number(match[1]))}`;
            }
            const parsed = new Date(s);
            if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000 && parsed.getFullYear() <= 2100) {
                return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
            }
            return '';
        }

        assert.strictEqual(normalizeDate('2026-10-01 00:00:00'), '2026-10-01');
        assert.strictEqual(normalizeDate('2026-10-01T14:30:00.000Z'), '2026-10-01');
        assert.strictEqual(normalizeDate('01/10/2026'), '2026-10-01');
        assert.strictEqual(normalizeDate('2026-10-01'), '2026-10-01');
    });

    test('index.html provides Mobile Sync Diagnostics and Equipment Correction routine', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        assert.ok(html.includes('openSyncDiagnosticsModal'), 'Should have openSyncDiagnosticsModal routine');
        assert.ok(html.includes('getSyncFaultItems'), 'Should have getSyncFaultItems helper');
        assert.ok(html.includes('chipSyncFault'), 'Should have chipSyncFault status chip');
        assert.ok(html.includes('diagSelectEquip'), 'Should include official equipment selector');
        assert.ok(html.includes('btnDiagRegisterEquip'), 'Should include button to register equipment in Google Sheets');
        assert.ok(html.includes('Guardar Correção e Sincronizar Agora'), 'Should have action to save correction and sync');
    });

    test('buttons have anti-flicker stability and mobile banner button does not freeze disabled', () => {
        const html = fs.readFileSync('index.html', 'utf8');
        assert.ok(html.includes('touch-action: manipulation;'), 'Should have touch-action manipulation on interactive buttons');
        assert.ok(!html.includes('window.addEventListener(\'focus\', () => {\n    triggerSyncQueue(50);'), 'Should not trigger DOM sync storm on mobile window focus');
        assert.ok(html.includes('btn.disabled = false'), 'Mobile banner buttons should stay enabled to prevent frozen clicks');
    });
});
