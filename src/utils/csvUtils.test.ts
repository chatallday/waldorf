import { describe, it, expect, vi } from 'vitest';
import { rowsToCsv, downloadCsv } from '../utils/csvUtils';

describe('csvUtils', () => {
  describe('rowsToCsv', () => {
    it('converts array of objects to CSV string', () => {
      const rows = [
        { name: 'Anna', age: 30, city: 'Berlin' },
        { name: 'Bob', age: 25, city: 'Munich' },
      ];
      const csv = rowsToCsv(rows);
      expect(csv).toContain('name,age,city');
      expect(csv).toContain('Anna,30,Berlin');
      expect(csv).toContain('Bob,25,Munich');
    });

    it('escapes commas in values', () => {
      const rows = [{ name: 'Anna, Jr.', city: 'Berlin' }];
      const csv = rowsToCsv(rows);
      expect(csv).toContain('"Anna, Jr."');
    });

    it('escapes quotes in values', () => {
      const rows = [{ name: 'Anna "The Great"', city: 'Berlin' }];
      const csv = rowsToCsv(rows);
      expect(csv).toContain('"Anna ""The Great"""');
    });

    it('handles empty array', () => {
      const csv = rowsToCsv([]);
      // Should return BOM only for empty array
      expect(csv).toBe('\uFEFF');
    });
  });

  describe('downloadCsv', () => {
    it('creates download link and triggers click', () => {
      const clickMock = vi.fn();
      const createElementMock = vi.spyOn(document, 'createElement').mockImplementation(() => ({
        setAttribute: vi.fn(),
        click: clickMock,
        style: {},
      }));
      const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      downloadCsv('name,age\nAnna,30', 'test.csv');

      expect(createElementMock).toHaveBeenCalledWith('a');
      expect(clickMock).toHaveBeenCalled();
      expect(appendChildMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();

      createElementMock.mockRestore();
      appendChildMock.mockRestore();
      removeChildMock.mockRestore();
    });
  });
});