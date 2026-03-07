import { jsonToCsv } from '@/utils/csvExport';

describe('CSV Export Utility', () => {
  describe('jsonToCsv', () => {
    it('should return empty string for empty array', () => {
      expect(jsonToCsv([])).toBe('');
    });

    it('should return empty string for null/undefined input', () => {
      expect(jsonToCsv(null as any)).toBe('');
      expect(jsonToCsv(undefined as any)).toBe('');
    });

    it('should generate headers from object keys', () => {
      const data = [{ name: 'Alice', email: 'alice@test.com' }];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('"name","email"');
    });

    it('should generate correct data rows', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3); // header + 2 data rows
      expect(lines[1]).toBe('"Alice","30"');
      expect(lines[2]).toBe('"Bob","25"');
    });

    it('should handle null and undefined values', () => {
      const data = [{ name: 'Alice', value: null }, { name: 'Bob', value: undefined }];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('"Alice",""');
      expect(lines[2]).toBe('"Bob",""');
    });

    it('should escape double quotes in values', () => {
      const data = [{ text: 'She said "hello"' }];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('"She said ""hello"""');
    });

    it('should handle single row of data', () => {
      const data = [{ id: '1', status: 'active' }];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('"id","status"');
      expect(lines[1]).toBe('"1","active"');
    });

    it('should handle numeric and boolean values by converting to string', () => {
      const data = [{ count: 42, active: true }];
      const csv = jsonToCsv(data);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('"42","true"');
    });
  });
});
