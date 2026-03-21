import { selectNextNumber } from '@/engine/numberSelector';
import { NumberStats } from '@/types/game';

const s = (o: Partial<NumberStats> = {}): NumberStats => ({
  correct: 0, wrong: 0, lastPlayed: 0, countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0, ...o,
});

describe('numberSelector error-ratio weighting', () => {
  it('numbers with high error ratios get higher weights (statistical)', () => {
    // Set up: numbers 1-9 mastered, number 10 with high error ratio (practiced, not mastered)
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 9; n++) m[String(n)] = s({ correct: 5, lastPlayed: Date.now() });
    // Number 10: 0 correct, 5 wrong → error ratio 1.0 → weight = 7 + 8 = 15
    m['10'] = s({ wrong: 5, lastPlayed: Date.now() });

    let count10 = 0;
    for (let i = 0; i < 500; i++) {
      if (selectNextNumber(m, [1, 10]) === 10) count10++;
    }
    // With weight 15 vs mastered ~2-5, number 10 should be picked very frequently
    expect(count10 / 500).toBeGreaterThan(0.3);
  });

  it('100% error rate number has weight > unplayed number (weight 10)', () => {
    // Number 1: unplayed → weight 10
    // Number 2: 100% wrong (0 correct, 6 wrong, not mastered) → weight 7 + 8 = 15
    const m: Record<string, NumberStats> = {
      '2': s({ wrong: 6, lastPlayed: Date.now() }),
    };

    let count2 = 0;
    for (let i = 0; i < 1000; i++) {
      if (selectNextNumber(m, [1, 2]) === 2) count2++;
    }
    // Weight 15 vs 10 → number 2 should be picked ~60% of the time
    expect(count2 / 1000).toBeGreaterThan(0.5);
  });

  it('33% error rate adds moderate weight boost', () => {
    // 2 correct, 1 wrong → errorRatio = 0.333 → weight = 7 + round(0.333 * 8) = 7 + 3 = 10
    const m: Record<string, NumberStats> = {
      '1': s({ correct: 2, wrong: 1, lastPlayed: Date.now() }),
      '2': s({ correct: 5, lastPlayed: Date.now() }), // mastered → weight ~2-5
    };

    let count1 = 0;
    for (let i = 0; i < 500; i++) {
      if (selectNextNumber(m, [1, 2]) === 1) count1++;
    }
    // Weight ~10 vs ~2-5 → number 1 should dominate
    expect(count1 / 500).toBeGreaterThan(0.5);
  });
});
