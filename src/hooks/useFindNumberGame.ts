import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { selectNextNumber } from '@/engine/numberSelector';
import { FloorId } from '@/types/game';
import { FLOORS } from '@/data/floors';
import { MAX_ANSWER_ATTEMPTS } from '@/data/thresholds';
import { hapticTap, hapticSuccess, hapticError } from '@/utils/haptics';

export type FindPhase = 'idle' | 'listening' | 'correct' | 'wrong' | 'strike_out' | 'complete';

export interface FindNumberState {
  phase: FindPhase;
  targetNumber: number;
  choices: number[];
  attempts: number;
  round: number;
}

export function generateFindChoices(target: number, floorRange: [number, number], count = 6): number[] {
  const [from, to] = floorRange;
  const pool: number[] = [];
  for (let n = from; n <= to; n++) {
    if (n !== target) pool.push(n);
  }
  // Shuffle pool and take first (count - 1)
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, count - 1);
  return [target, ...distractors].sort(() => Math.random() - 0.5);
}

export function useFindNumberGame(floorId: FloorId) {
  const mastery = useGameStore((s) => s.numberMastery);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const addStar = useGameStore((s) => s.addStar);

  const recentNumbers = useRef<number[]>([]);

  const floor = FLOORS.find((f) => f.id === floorId);
  const floorRange: [number, number] = floor ? floor.numberRange : [1, 10];

  const [state, setState] = useState<FindNumberState>({
    phase: 'idle',
    targetNumber: 0,
    choices: [],
    attempts: 0,
    round: 0,
  });

  const startRound = useCallback(() => {
    const num = selectNextNumber(mastery, floorRange, recentNumbers.current);
    recentNumbers.current = [...recentNumbers.current.slice(-2), num];
    const choices = generateFindChoices(num, floorRange);

    setState((prev) => ({
      phase: 'listening',
      targetNumber: num,
      choices,
      attempts: 0,
      round: prev.round + 1,
    }));
  }, [mastery, floorRange]);

  const selectNumber = useCallback(
    (n: number) => {
      setState((prev) => {
        if (prev.phase !== 'listening') return prev;

        if (n === prev.targetNumber) {
          hapticSuccess();
          recordAnswer(prev.targetNumber, 'find', true);
          addStar();
          return { ...prev, phase: 'correct' };
        } else {
          hapticError();
          recordAnswer(prev.targetNumber, 'find', false);
          const newAttempts = prev.attempts + 1;
          if (newAttempts >= MAX_ANSWER_ATTEMPTS) {
            return { ...prev, phase: 'strike_out', attempts: newAttempts };
          }
          return { ...prev, phase: 'wrong', attempts: newAttempts };
        }
      });
    },
    [recordAnswer, addStar]
  );

  const retryAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'wrong') return prev;
      return { ...prev, phase: 'listening' };
    });
  }, []);

  const restartSameRound = useCallback(() => {
    setState((prev) => {
      const choices = generateFindChoices(prev.targetNumber, floorRange);
      return { ...prev, choices, attempts: 0, phase: 'listening' };
    });
  }, [floorRange]);

  const nextRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'complete' }));
  }, []);

  return {
    ...state,
    startRound,
    selectNumber,
    retryAnswer,
    restartSameRound,
    nextRound,
  };
}
