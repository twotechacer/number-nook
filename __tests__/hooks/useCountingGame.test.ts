import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';

// Test the pure functions that useCountingGame depends on
// (the hook itself uses React state and is better tested via manual/integration)

describe('Counting game logic', () => {
  describe('generateDistractors for counting', () => {
    it('always includes the correct answer', () => {
      for (let target = 1; target <= 10; target++) {
        const choices = generateDistractors(target);
        expect(choices).toContain(target);
        expect(choices).toHaveLength(3);
      }
    });

    it('all choices are positive integers', () => {
      for (let target = 1; target <= 10; target++) {
        const choices = generateDistractors(target);
        for (const c of choices) {
          expect(c).toBeGreaterThanOrEqual(1);
          expect(Number.isInteger(c)).toBe(true);
        }
      }
    });
  });

  describe('selectNextNumber for floor 1', () => {
    it('returns numbers in range 1-10', () => {
      for (let i = 0; i < 50; i++) {
        const num = selectNextNumber({}, [1, 10]);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
      }
    });

    it('avoids recent numbers', () => {
      const recent = [1, 2, 3];
      for (let i = 0; i < 50; i++) {
        const num = selectNextNumber({}, [1, 10], recent);
        expect(recent).not.toContain(num);
      }
    });
  });

  describe('round flow simulation', () => {
    it('correct answer flow: select number → generate distractors → verify correct is in choices', () => {
      const target = selectNextNumber({}, [1, 10]);
      const choices = generateDistractors(target);

      expect(target).toBeGreaterThanOrEqual(1);
      expect(target).toBeLessThanOrEqual(10);
      expect(choices).toContain(target);

      // Simulate selecting correct answer
      const selected = target;
      expect(selected === target).toBe(true);
    });

    it('wrong answer flow: selecting a distractor is not the target', () => {
      const target = 5;
      const choices = generateDistractors(target);
      const distractor = choices.find((c) => c !== target);

      expect(distractor).toBeDefined();
      expect(distractor).not.toBe(target);
    });
  });
});
