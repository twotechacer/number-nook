import { selectNextNumber } from '@/engine/numberSelector';
import { NumberStats } from '@/types/game';

const s = (o: Partial<NumberStats> = {}): NumberStats => ({
  correct: 0, wrong: 0, lastPlayed: 0, countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0, ...o,
});

describe('selectNextNumber', () => {
  it('returns within floor range', () => {
    for (let i = 0; i < 100; i++) {
      const r = selectNextNumber({}, [1, 10]);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(10);
    }
  });

  it('works for floor 3 range', () => {
    for (let i = 0; i < 100; i++) {
      const r = selectNextNumber({}, [31, 50]);
      expect(r).toBeGreaterThanOrEqual(31);
      expect(r).toBeLessThanOrEqual(50);
    }
  });

  it('avoids recent numbers', () => {
    const recent = [1, 2, 3];
    for (let i = 0; i < 100; i++) expect(recent).not.toContain(selectNextNumber({}, [1, 10], recent));
  });

  it('falls back if all recent', () => {
    const r = selectNextNumber({}, [1, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r).toBeGreaterThanOrEqual(1);
    expect(r).toBeLessThanOrEqual(10);
  });

  it('favours unplayed over mastered (statistical)', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 9; n++) m[String(n)] = s({ correct: 5, lastPlayed: Date.now() });
    let count10 = 0;
    for (let i = 0; i < 500; i++) if (selectNextNumber(m, [1, 10]) === 10) count10++;
    expect(count10 / 500).toBeGreaterThan(0.2);
  });
});
