import { computeMechanicUnlocks, computeFloorUnlocks } from '@/engine/unlocks';
import { NumberStats } from '@/types/game';

const s = (o: Partial<NumberStats> = {}): NumberStats => ({
  correct: 0, wrong: 0, lastPlayed: 0, countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0, ...o,
});

describe('computeMechanicUnlocks', () => {
  it('all false for empty mastery', () => {
    const r = computeMechanicUnlocks({});
    expect(r['1_10']).toEqual({ feed: false, bubbles: false });
    expect(r['41_50']).toEqual({ feed: false, bubbles: false });
  });

  it('unlocks feed at 5 counting correct in group', () => {
    const m: Record<string, NumberStats> = {
      '1': s({ countingCorrect: 2 }), '2': s({ countingCorrect: 2 }), '3': s({ countingCorrect: 1 }),
    };
    expect(computeMechanicUnlocks(m)['1_10'].feed).toBe(true);
  });

  it('does NOT unlock feed with 4', () => {
    const m: Record<string, NumberStats> = { '1': s({ countingCorrect: 2 }), '2': s({ countingCorrect: 2 }) };
    expect(computeMechanicUnlocks(m)['1_10'].feed).toBe(false);
  });

  it('unlocks bubbles at 3 feed correct', () => {
    const m: Record<string, NumberStats> = {
      '1': s({ feedCorrect: 1 }), '2': s({ feedCorrect: 1 }), '3': s({ feedCorrect: 1 }),
    };
    expect(computeMechanicUnlocks(m)['1_10'].bubbles).toBe(true);
  });

  it('does NOT unlock bubbles with 2', () => {
    const m: Record<string, NumberStats> = { '1': s({ feedCorrect: 1 }), '2': s({ feedCorrect: 1 }) };
    expect(computeMechanicUnlocks(m)['1_10'].bubbles).toBe(false);
  });

  it('per-group isolation', () => {
    const m: Record<string, NumberStats> = { '5': s({ countingCorrect: 5 }), '35': s({ feedCorrect: 3 }) };
    const r = computeMechanicUnlocks(m);
    expect(r['1_10'].feed).toBe(true);
    expect(r['11_20'].feed).toBe(false);
    expect(r['31_40'].bubbles).toBe(true);
  });
});

describe('computeFloorUnlocks', () => {
  const def = { floor2: false, floor3: false };

  it('respects autoUnlock=false', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 10; n++) m[String(n)] = s({ correct: 5 });
    expect(computeFloorUnlocks(m, def, false)).toEqual(def);
  });

  it('floor2 at 8/10 mastered', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 8; n++) m[String(n)] = s({ correct: 3 });
    expect(computeFloorUnlocks(m, def, true).floor2).toBe(true);
  });

  it('no floor2 at 7/10', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 7; n++) m[String(n)] = s({ correct: 3 });
    expect(computeFloorUnlocks(m, def, true).floor2).toBe(false);
  });

  it('floor3 at 16/20 mastered', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 11; n <= 26; n++) m[String(n)] = s({ correct: 3 });
    expect(computeFloorUnlocks(m, def, true).floor3).toBe(true);
  });

  it('no floor3 at 15/20', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 11; n <= 25; n++) m[String(n)] = s({ correct: 3 });
    expect(computeFloorUnlocks(m, def, true).floor3).toBe(false);
  });

  it('never re-locks', () => {
    expect(computeFloorUnlocks({}, { floor2: true, floor3: false }, true).floor2).toBe(true);
  });
});
