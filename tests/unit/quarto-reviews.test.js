// tests/unit/quarto-reviews.test.js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const indicadoresHtml = fs.readFileSync(new URL('../../indicadores.html', import.meta.url), 'utf8');

describe('Quarto Reviews Visibility and Dynamic Discovery', () => {
  test('index.html contains dynamic room discovery in groupQuartoRecordsIntoCycles', () => {
    assert.match(indexHtml, /rawRecords\.forEach\(function\(rec\)/);
    assert.match(indexHtml, /validRooms\.add\(numStr\)/);
    assert.match(indexHtml, /normRoom\(rec\.data\?\.numero \|\| rec\.data\?\.quarto\)/);
  });

  test('indicadores.html contains dynamic room discovery in groupQuartoRecordsIntoCycles', () => {
    assert.match(indicadoresHtml, /validRooms\.add\(numStr\)/);
  });

  test('index.html provides fallback and normalization for both "numero" and "quarto" keys', () => {
    assert.match(indexHtml, /it\.data\.numero = normRoom\(it\.data\.numero \|\| it\.data\.quarto\)/);
    assert.match(indexHtml, /it\.data\.quarto = it\.data\.numero/);
    assert.match(indexHtml, /recData\.numero = normRoom\(recData\.numero \|\| recData\.quarto/);
  });

  test('index.html includes dedicated quarto recent readings card and table in UI', () => {
    assert.match(indexHtml, /id="quartoRecentReadingsCard"/);
    assert.match(indexHtml, /id="quartoRecentReadingsTableBody"/);
    assert.match(indexHtml, /id="quartoRecentReadingsCount"/);
    assert.match(indexHtml, /id="quartoRecentReadingsViewToggle"/);
    assert.match(indexHtml, /renderQuartoRecentReadings/);
  });

  test('index.html defines window.renderHistory alias to prevent ReferenceError', () => {
    assert.match(indexHtml, /window\.renderHistory\s*=\s*renderHistorial/);
  });

  test('simulated groupQuartoRecordsIntoCycles dynamically includes higher room numbers like 214', () => {
    function normRoom(val) {
      if (!val) return '';
      let s = String(val).trim().toUpperCase();
      let digits = s.replace(/\D/g, '');
      if (digits) return digits.padStart(3, '0');
      return s;
    }

    function defaultRooms() {
      const arr = [];
      ['001', '002', '003', '004'].forEach(r => arr.push(r));
      [1, 2, 3, 4].forEach(fl => {
        for (let i = 1; i <= 14; i++) {
          arr.push(`${fl}${i < 10 ? '0' + i : i}`);
        }
      });
      return arr;
    }

    function groupQuartoRecordsIntoCycles(rawRecords) {
      const roomList = defaultRooms();
      const validRooms = new Set(roomList);

      if (Array.isArray(rawRecords)) {
        rawRecords.forEach(rec => {
          const numStr = normRoom(rec?.data?.numero || rec?.data?.quarto || rec?.numero || rec?.quarto);
          if (numStr && !validRooms.has(numStr)) {
            validRooms.add(numStr);
            roomList.push(numStr);
          }
        });
      }

      const cycleRoomsMap = {};
      const uniqueRooms = new Set();

      (rawRecords || []).forEach(r => {
        const roomNumber = normRoom(r?.data?.numero || r?.data?.quarto);
        if (!roomNumber || !validRooms.has(roomNumber)) return;
        uniqueRooms.add(roomNumber);
        if (!cycleRoomsMap[roomNumber]) cycleRoomsMap[roomNumber] = [];
        cycleRoomsMap[roomNumber].push(r);
      });

      return {
        totalCycleRooms: roomList.length,
        roomsDoneCount: uniqueRooms.size,
        cycleRoomsMap,
        uniqueRooms: Array.from(uniqueRooms)
      };
    }

    // Test with standard room 101 and custom/higher room 214 and 415
    const mockRecords = [
      { id: '1', data: { numero: '101', phFria: '7.2' }, created_at: '2026-10-25T10:00:00Z' },
      { id: '2', data: { quarto: '214', phFria: '7.4' }, created_at: '2026-10-25T10:30:00Z' },
      { id: '3', data: { numero: '501', phFria: '7.1' }, created_at: '2026-10-25T11:00:00Z' } // new room on 5th floor
    ];

    const result = groupQuartoRecordsIntoCycles(mockRecords);
    assert.strictEqual(result.roomsDoneCount, 3);
    assert.ok(result.uniqueRooms.includes('101'));
    assert.ok(result.uniqueRooms.includes('214'));
    assert.ok(result.uniqueRooms.includes('501'));
    assert.ok(result.cycleRoomsMap['214'] !== undefined);
    assert.ok(result.cycleRoomsMap['501'] !== undefined);
  });
});
