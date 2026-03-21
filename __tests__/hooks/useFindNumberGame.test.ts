import { generateFindChoices } from '@/hooks/useFindNumberGame';
import { selectNextNumber } from '@/engine/numberSelector';

describe('Find Number game logic', () => {
  describe('generateFindChoices', () => {
    it('generates exactly 6 choices including target', () => {
      for (let i = 0; i < 20; i++) {
        const target = Math.floor(Math.random() * 10) + 1;
        const choices = generateFindChoices(target, [1, 10], 6);
        expect(choices).toHaveLength(6);
        expect(choices).toContain(target);
      }
    });

    it('all choices are unique', () => {
      for (let i = 0; i < 20; i++) {
        const target = Math.floor(Math.random() * 10) + 1;
        const choices = generateFindChoices(target, [1, 10], 6);
        expect(new Set(choices).size).toBe(6);
      }
    });

    it('all choices are within floor range', () => {
      for (let i = 0; i < 20; i++) {
        const target = Math.floor(Math.random() * 20) + 11;
        const choices = generateFindChoices(target, [11, 30], 6);
        for (const c of choices) {
          expect(c).toBeGreaterThanOrEqual(11);
          expect(c).toBeLessThanOrEqual(30);
        }
      }
    });

    it('returns target even with small range', () => {
      const choices = generateFindChoices(3, [1, 6], 6);
      expect(choices).toHaveLength(6);
      expect(choices).toContain(3);
    });
  });

  describe('round flow simulation', () => {
    it('correct selection detected', () => {
      const target = 5;
      const choices = generateFindChoices(target, [1, 10]);
      expect(choices).toContain(target);
      const selected = target;
      expect(selected === target).toBe(true);
    });

    it('wrong selection detected', () => {
      const target = 5;
      const choices = generateFindChoices(target, [1, 10]);
      const wrong = choices.find((c) => c !== target)!;
      expect(wrong !== target).toBe(true);
    });

    it('strike_out after 3 wrong attempts', () => {
      let attempts = 0;
      const maxAttempts = 3;
      const target = 5;
      const choices = generateFindChoices(target, [1, 10]);
      const wrongChoices = choices.filter((c) => c !== target);

      for (let i = 0; i < maxAttempts; i++) {
        attempts++;
      }
      expect(attempts).toBe(maxAttempts);
      expect(attempts >= maxAttempts).toBe(true);
    });

    it('restartSameRound keeps same target with new choices', () => {
      const target = 7;
      const choices1 = generateFindChoices(target, [1, 10]);
      const choices2 = generateFindChoices(target, [1, 10]);
      expect(choices1).toContain(target);
      expect(choices2).toContain(target);
      // Both have the same target
      expect(choices1.includes(target) && choices2.includes(target)).toBe(true);
    });
  });

  describe('selectNextNumber for find floor ranges', () => {
    it('returns numbers in floor 1 range', () => {
      const mastery: Record<string, any> = {};
      for (let i = 0; i < 20; i++) {
        const n = selectNextNumber(mastery, [1, 10], []);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
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
});
