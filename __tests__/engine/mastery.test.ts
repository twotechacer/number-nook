import { getMasteryStatus, isNumberMastered, countMastered, getFloorMasteryPercent, getNumbersNeedingPractice, getNextSuggestedNumbers } from '@/engine/mastery';
import { NumberStats } from '@/types/game';

const s = (o: Partial<NumberStats> = {}): NumberStats => ({
  correct: 0, wrong: 0, lastPlayed: 0, countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0, ...o,
});

describe('getMasteryStatus', () => {
  it('returns not_started for undefined', () => expect(getMasteryStatus(undefined)).toBe('not_started'));
  it('returns not_started for zero stats', () => expect(getMasteryStatus(s())).toBe('not_started'));
  it('returns practiced for 1 correct', () => expect(getMasteryStatus(s({ correct: 1 }))).toBe('practiced'));
  it('returns practiced for 2 correct', () => expect(getMasteryStatus(s({ correct: 2 }))).toBe('practiced'));
  it('returns mastered for 3 correct', () => expect(getMasteryStatus(s({ correct: 3 }))).toBe('mastered'));
  it('returns mastered for 5 correct', () => expect(getMasteryStatus(s({ correct: 5 }))).toBe('mastered'));
  it('returns practiced if only wrong answers', () => expect(getMasteryStatus(s({ wrong: 3 }))).toBe('practiced'));
});

describe('isNumberMastered', () => {
  it('false for undefined', () => expect(isNumberMastered(undefined)).toBe(false));
  it('false for correct < 3', () => expect(isNumberMastered(s({ correct: 2 }))).toBe(false));
  it('true for correct >= 3', () => expect(isNumberMastered(s({ correct: 3 }))).toBe(true));
});

describe('countMastered', () => {
  it('0 for empty', () => expect(countMastered({}, 1, 10)).toBe(0));
  it('counts correctly', () => {
    const m: Record<string, NumberStats> = { '1': s({ correct: 3 }), '2': s({ correct: 3 }), '3': s({ correct: 1 }) };
    expect(countMastered(m, 1, 5)).toBe(2);
  });
});

describe('getFloorMasteryPercent', () => {
  it('0 for empty', () => expect(getFloorMasteryPercent({}, 'floor1')).toBe(0));
  it('80 when 8/10 mastered on floor1', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 8; n++) m[String(n)] = s({ correct: 3 });
    expect(getFloorMasteryPercent(m, 'floor1')).toBe(80);
  });
  it('100 when all mastered', () => {
    const m: Record<string, NumberStats> = {};
    for (let n = 1; n <= 10; n++) m[String(n)] = s({ correct: 5 });
    expect(getFloorMasteryPercent(m, 'floor1')).toBe(100);
  });
});

describe('getNumbersNeedingPractice', () => {
  it('returns numbers with most wrong answers', () => {
    const m: Record<string, NumberStats> = {
      '3': s({ correct: 1, wrong: 5 }), '7': s({ correct: 1, wrong: 3 }),
      '5': s({ correct: 1, wrong: 1 }), '1': s({ correct: 3 }),
    };
    expect(getNumbersNeedingPractice(m, 1, 10, 2)).toEqual([3, 7]);
  });
});

describe('getNextSuggestedNumbers', () => {
  it('returns unmastered with fewest attempts', () => {
    const m: Record<string, NumberStats> = {
      '1': s({ correct: 3 }), '2': s({ correct: 2, wrong: 1 }),
      '3': s(), '4': s({ correct: 1 }),
    };
    expect(getNextSuggestedNumbers(m, 1, 5, 2)[0]).toBe(3);
  });
});
