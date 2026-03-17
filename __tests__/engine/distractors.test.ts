import { generateDistractors } from '@/engine/distractors';

describe('generateDistractors', () => {
  it('returns exactly 3 values', () => {
    expect(generateDistractors(5)).toHaveLength(3);
  });

  it('includes the correct answer', () => {
    for (let i = 0; i < 50; i++) expect(generateDistractors(5)).toContain(5);
  });

  it('returns 3 unique values', () => {
    for (let i = 0; i < 50; i++) expect(new Set(generateDistractors(5)).size).toBe(3);
  });

  it('distractors are within ±2 of target', () => {
    for (let i = 0; i < 50; i++) {
      for (const val of generateDistractors(10)) expect(Math.abs(val - 10)).toBeLessThanOrEqual(2);
    }
  });

  it('target=1 produces no values below 1', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateDistractors(1);
      for (const val of result) expect(val).toBeGreaterThanOrEqual(1);
      expect(result).toContain(1);
    }
  });

  it('target=50 produces no values above 50', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateDistractors(50);
      for (const val of result) expect(val).toBeLessThanOrEqual(50);
      expect(result).toContain(50);
    }
  });

  it('target=2 has valid distractors (no 0 or negative)', () => {
    for (let i = 0; i < 50; i++) {
      for (const val of generateDistractors(2)) expect(val).toBeGreaterThanOrEqual(1);
    }
  });
});
