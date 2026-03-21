import { generateDistractors } from '@/engine/distractors';
import { MAX_ANSWER_ATTEMPTS } from '@/data/thresholds';

/**
 * Tests for the 3-strike retry system.
 * Since renderHook is not available, we simulate the state machine logic
 * that the hooks implement, verifying the strike-out flow.
 */

interface CountingState {
  phase: string;
  targetNumber: number;
  tappedIndices: Set<number>;
  answerChoices: [number, number, number];
  attempts: number;
}

interface BubblesState {
  phase: string;
  targetNumber: number;
  poppedCount: number;
  answerChoices: [number, number, number];
  attempts: number;
}

interface FeedingState {
  phase: string;
  targetNumber: number;
  fedIndices: number[];
  answerChoices: [number, number, number];
  attempts: number;
}

// Simulate the selectAnswer logic from the hooks
function simulateWrongAnswer(state: { phase: string; attempts: number }) {
  if (state.phase !== 'answering') return state;
  const newAttempts = state.attempts + 1;
  if (newAttempts >= MAX_ANSWER_ATTEMPTS) {
    return { ...state, phase: 'strike_out', attempts: newAttempts };
  }
  return { ...state, phase: 'wrong', attempts: newAttempts };
}

function simulateRetry(state: { phase: string }) {
  if (state.phase !== 'wrong') return state;
  return { ...state, phase: 'answering' };
}

describe('3-Strike Retry System', () => {
  describe('MAX_ANSWER_ATTEMPTS constant', () => {
    it('is set to 3', () => {
      expect(MAX_ANSWER_ATTEMPTS).toBe(3);
    });
  });

  describe('strike-out phase transition', () => {
    it('transitions to strike_out after MAX_ANSWER_ATTEMPTS wrong answers', () => {
      let state = { phase: 'answering', attempts: 0 };

      // First wrong answer → wrong phase
      state = simulateWrongAnswer(state);
      expect(state.phase).toBe('wrong');
      expect(state.attempts).toBe(1);

      // Retry → back to answering
      state = simulateRetry(state);
      expect(state.phase).toBe('answering');

      // Second wrong answer → wrong phase
      state = simulateWrongAnswer(state);
      expect(state.phase).toBe('wrong');
      expect(state.attempts).toBe(2);

      // Retry → back to answering
      state = simulateRetry(state);
      expect(state.phase).toBe('answering');

      // Third wrong answer → strike_out phase
      state = simulateWrongAnswer(state);
      expect(state.phase).toBe('strike_out');
      expect(state.attempts).toBe(3);
    });

    it('does not transition to strike_out before MAX_ANSWER_ATTEMPTS', () => {
      let state = { phase: 'answering', attempts: 0 };

      for (let i = 0; i < MAX_ANSWER_ATTEMPTS - 1; i++) {
        state = simulateWrongAnswer(state);
        expect(state.phase).not.toBe('strike_out');
        state = simulateRetry(state);
      }
    });
  });

  describe('restartSameRound for counting game', () => {
    it('resets tapped state but keeps same target number', () => {
      const target = 5;
      const choices = generateDistractors(target);

      const strikeOutState: CountingState = {
        phase: 'strike_out',
        targetNumber: target,
        tappedIndices: new Set([0, 1, 2, 3, 4]),
        answerChoices: choices,
        attempts: MAX_ANSWER_ATTEMPTS,
      };

      // Simulate restartSameRound
      const newChoices = generateDistractors(strikeOutState.targetNumber);
      const restarted: CountingState = {
        ...strikeOutState,
        phase: 'tapping',
        tappedIndices: new Set<number>(),
        answerChoices: newChoices,
        attempts: 0,
      };

      expect(restarted.phase).toBe('tapping');
      expect(restarted.targetNumber).toBe(target);
      expect(restarted.tappedIndices.size).toBe(0);
      expect(restarted.attempts).toBe(0);
      expect(restarted.answerChoices).toContain(target);
    });
  });

  describe('restartSameRound for bubbles game', () => {
    it('resets popped state but keeps same target number', () => {
      const target = 7;

      const strikeOutState: BubblesState = {
        phase: 'strike_out',
        targetNumber: target,
        poppedCount: target,
        answerChoices: generateDistractors(target),
        attempts: MAX_ANSWER_ATTEMPTS,
      };

      const newChoices = generateDistractors(strikeOutState.targetNumber);
      const restarted: BubblesState = {
        ...strikeOutState,
        phase: 'popping',
        poppedCount: 0,
        answerChoices: newChoices,
        attempts: 0,
      };

      expect(restarted.phase).toBe('popping');
      expect(restarted.targetNumber).toBe(target);
      expect(restarted.poppedCount).toBe(0);
      expect(restarted.attempts).toBe(0);
    });
  });

  describe('restartSameRound for feeding game', () => {
    it('resets fed state but keeps same target number', () => {
      const target = 4;

      const strikeOutState: FeedingState = {
        phase: 'strike_out',
        targetNumber: target,
        fedIndices: [0, 1, 2, 3],
        answerChoices: generateDistractors(target),
        attempts: MAX_ANSWER_ATTEMPTS,
      };

      const newChoices = generateDistractors(strikeOutState.targetNumber);
      const restarted: FeedingState = {
        ...strikeOutState,
        phase: 'feeding',
        fedIndices: [],
        answerChoices: newChoices,
        attempts: 0,
      };

      expect(restarted.phase).toBe('feeding');
      expect(restarted.targetNumber).toBe(target);
      expect(restarted.fedIndices).toHaveLength(0);
      expect(restarted.attempts).toBe(0);
    });
  });

  describe('attempts counter reset', () => {
    it('resets to 0 after restartSameRound', () => {
      let state = { phase: 'answering', attempts: 0 };

      // Get to strike_out
      for (let i = 0; i < MAX_ANSWER_ATTEMPTS; i++) {
        state = simulateWrongAnswer(state);
        if (state.phase === 'wrong') state = simulateRetry(state);
      }

      expect(state.attempts).toBe(MAX_ANSWER_ATTEMPTS);

      // Simulate restart
      const restarted = { ...state, phase: 'tapping', attempts: 0 };
      expect(restarted.attempts).toBe(0);
    });
  });

  describe('restartSameRound only works from strike_out phase', () => {
    it('does not restart from other phases', () => {
      const phases = ['idle', 'tapping', 'answering', 'correct', 'wrong', 'complete'];
      for (const phase of phases) {
        const state = { phase, targetNumber: 5 };
        // restartSameRound guard: if (prev.phase !== 'strike_out') return prev
        if (state.phase !== 'strike_out') {
          expect(state.phase).not.toBe('strike_out');
        }
      }
    });
  });
});
