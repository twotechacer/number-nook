import { computeMechanicUnlocks } from '@/engine/unlocks';
import { NumberStats } from '@/types/game';

const s = (o: Partial<NumberStats> = {}): NumberStats => ({
  correct: 0, wrong: 0, lastPlayed: 0, countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0, findCorrect: 0, ...o,
});

describe('computeMechanicUnlocks — find mechanic', () => {
  it('find unlocks when bubblesCorrect >= 3 in a group', () => {
    const m: Record<string, NumberStats> = {
      '1': s({ bubblesCorrect: 1 }),
      '2': s({ bubblesCorrect: 1 }),
      '3': s({ bubblesCorrect: 1 }),
    };
    expect(computeMechanicUnlocks(m)['1_10'].find).toBe(true);
  });

  it('find stays locked when bubblesCorrect < 3 in a group', () => {
    const m: Record<string, NumberStats> = {
      '1': s({ bubblesCorrect: 1 }),
      '2': s({ bubblesCorrect: 1 }),
    };
    expect(computeMechanicUnlocks(m)['1_10'].find).toBe(false);
  });

  it('find unlock is per-group isolated', () => {
    const m: Record<string, NumberStats> = {
      '5': s({ bubblesCorrect: 3 }),
      '15': s({ bubblesCorrect: 1 }),
    };
    const r = computeMechanicUnlocks(m);
    expect(r['1_10'].find).toBe(true);
    expect(r['11_20'].find).toBe(false);
  });

  it('all false for empty mastery', () => {
    const r = computeMechanicUnlocks({});
    expect(r['1_10'].find).toBe(false);
    expect(r['41_50'].find).toBe(false);
  });

  it('find unlocks at exactly threshold of 3', () => {
    const m: Record<string, NumberStats> = {
      '31': s({ bubblesCorrect: 3 }),
    };
    expect(computeMechanicUnlocks(m)['31_40'].find).toBe(true);
  });
});
