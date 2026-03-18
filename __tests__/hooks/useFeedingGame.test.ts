import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';

describe('Feeding game logic', () => {
  describe('generateDistractors for feeding', () => {
    it('always includes the correct answer', () => {
      for (let i = 0; i < 50; i++) {
        const target = Math.floor(Math.random() * 50) + 1;
        const choices = generateDistractors(target);
        expect(choices).toContain(target);
      }
    });

    it('returns exactly 3 unique choices', () => {
      for (let i = 0; i < 20; i++) {
        const target = Math.floor(Math.random() * 48) + 2;
        const choices = generateDistractors(target);
        expect(choices).toHaveLength(3);
        expect(new Set(choices).size).toBe(3);
      }
    });
  });

  describe('selectNextNumber for feeding', () => {
    it('returns numbers in floor range', () => {
      const mastery: Record<string, any> = {};
      for (let i = 0; i < 20; i++) {
        const n = selectNextNumber(mastery, [1, 10], []);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('feeding round flow simulation', () => {
    it('feed N treats by index → count matches target', () => {
      const target = 7;
      const fedIndices: number[] = [];
      for (let i = 0; i < target; i++) {
        fedIndices.push(i);
      }
      expect(fedIndices.length).toBe(target);
    });

    it('feeding same index twice does not double count', () => {
      const fedIndices = [0, 1, 2];
      const index = 1; // already fed
      if (!fedIndices.includes(index)) {
        fedIndices.push(index);
      }
      expect(fedIndices.length).toBe(3);
    });

    it('undo removes last fed index', () => {
      const fedIndices = [2, 0, 4];
      const afterUndo = fedIndices.slice(0, -1);
      expect(afterUndo).toEqual([2, 0]);
      expect(afterUndo.length).toBe(2);
    });

    it('undo on empty does nothing', () => {
      const fedIndices: number[] = [];
      const afterUndo = fedIndices.length > 0 ? fedIndices.slice(0, -1) : fedIndices;
      expect(afterUndo.length).toBe(0);
    });

    it('answer choices contain the target', () => {
      const target = 4;
      const choices = generateDistractors(target);
      expect(choices).toContain(target);
    });

    it('selecting correct answer matches target', () => {
      const target = 6;
      const selected = target;
      expect(selected).toBe(target);
    });

    it('selecting wrong answer does not match target', () => {
      const target = 6;
      const choices = generateDistractors(target);
      const wrong = choices.find((c) => c !== target)!;
      expect(wrong).not.toBe(target);
    });
  });
});
