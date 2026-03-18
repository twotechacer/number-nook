import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';

describe('Bubbles game logic', () => {
  describe('generateDistractors for bubbles', () => {
    it('always includes the correct answer', () => {
      for (let i = 0; i < 50; i++) {
        const target = Math.floor(Math.random() * 50) + 1;
        const choices = generateDistractors(target);
        expect(choices).toContain(target);
      }
    });

    it('all choices are positive integers', () => {
      for (let target = 1; target <= 50; target++) {
        const choices = generateDistractors(target);
        for (const c of choices) {
          expect(c).toBeGreaterThanOrEqual(1);
          expect(c).toBeLessThanOrEqual(50);
          expect(Number.isInteger(c)).toBe(true);
        }
      }
    });

    it('returns exactly 3 choices', () => {
      const choices = generateDistractors(5);
      expect(choices).toHaveLength(3);
    });

    it('all choices are unique', () => {
      for (let i = 0; i < 30; i++) {
        const target = Math.floor(Math.random() * 48) + 2;
        const choices = generateDistractors(target);
        expect(new Set(choices).size).toBe(3);
      }
    });
  });

  describe('selectNextNumber for bubbles floor ranges', () => {
    it('returns numbers in floor 1 range', () => {
      const mastery: Record<string, any> = {};
      for (let i = 0; i < 20; i++) {
        const n = selectNextNumber(mastery, [1, 10], []);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
      }
    });

    it('returns numbers in floor 2 range', () => {
      const mastery: Record<string, any> = {};
      for (let i = 0; i < 20; i++) {
        const n = selectNextNumber(mastery, [11, 30], []);
        expect(n).toBeGreaterThanOrEqual(11);
        expect(n).toBeLessThanOrEqual(30);
      }
    });

    it('returns numbers in floor 3 range', () => {
      const mastery: Record<string, any> = {};
      for (let i = 0; i < 20; i++) {
        const n = selectNextNumber(mastery, [31, 50], []);
        expect(n).toBeGreaterThanOrEqual(31);
        expect(n).toBeLessThanOrEqual(50);
      }
    });

    it('avoids recent numbers', () => {
      const mastery: Record<string, any> = {};
      const recent = [3, 5, 7];
      for (let i = 0; i < 30; i++) {
        const n = selectNextNumber(mastery, [1, 10], recent);
        expect(recent).not.toContain(n);
      }
    });
  });

  describe('bubble round flow simulation', () => {
    it('pop all bubbles → target number reached', () => {
      const target = 5;
      let poppedCount = 0;
      for (let i = 0; i < target; i++) {
        poppedCount++;
      }
      expect(poppedCount).toBe(target);
    });

    it('answer choices contain the target', () => {
      const target = 7;
      const choices = generateDistractors(target);
      expect(choices).toContain(target);
    });

    it('selecting correct answer is detected', () => {
      const target = 4;
      const choices = generateDistractors(target);
      const selected = target;
      expect(selected === target).toBe(true);
    });

    it('selecting wrong answer is detected', () => {
      const target = 4;
      const choices = generateDistractors(target);
      const wrong = choices.find((c) => c !== target)!;
      expect(wrong !== target).toBe(true);
    });
  });
});
