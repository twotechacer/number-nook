import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';
import { FloorId } from '@/types/game';
import { FLOORS } from '@/data/floors';

export type CountingPhase = 'idle' | 'tapping' | 'answering' | 'correct' | 'wrong' | 'complete';

interface CountingGameState {
  phase: CountingPhase;
  targetNumber: number;
  tappedCount: number;
  answerChoices: [number, number, number];
  attempts: number;
}

export function useCountingGame(floorId: FloorId) {
  const mastery = useGameStore((s) => s.numberMastery);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const addStar = useGameStore((s) => s.addStar);

  const recentNumbers = useRef<number[]>([]);

  const floor = FLOORS.find((f) => f.id === floorId);
  const floorRange: [number, number] = floor ? floor.numberRange : [1, 10];

  const [state, setState] = useState<CountingGameState>({
    phase: 'idle',
    targetNumber: 0,
    tappedCount: 0,
    answerChoices: [0, 0, 0],
    attempts: 0,
  });

  const startRound = useCallback(() => {
    const num = selectNextNumber(mastery, floorRange, recentNumbers.current);
    recentNumbers.current = [...recentNumbers.current.slice(-2), num];

    const choices = generateDistractors(num);

    setState({
      phase: 'tapping',
      targetNumber: num,
      tappedCount: 0,
      answerChoices: choices,
      attempts: 0,
    });
  }, [mastery, floorRange]);

  const tapObject = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'tapping') return prev;
      const newCount = prev.tappedCount + 1;
      if (newCount >= prev.targetNumber) {
        return { ...prev, tappedCount: newCount, phase: 'answering' };
      }
      return { ...prev, tappedCount: newCount };
    });
  }, []);

  const selectAnswer = useCallback(
    (answer: number) => {
      setState((prev) => {
        if (prev.phase !== 'answering') return prev;

        if (answer === prev.targetNumber) {
          recordAnswer(prev.targetNumber, 'counting', true);
          addStar();
          return { ...prev, phase: 'correct' };
        } else {
          recordAnswer(prev.targetNumber, 'counting', false);
          return { ...prev, phase: 'wrong', attempts: prev.attempts + 1 };
        }
      });
    },
    [recordAnswer, addStar]
  );

  const retryAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'wrong') return prev;
      return { ...prev, phase: 'answering' };
    });
  }, []);

  const completeRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'complete' }));
  }, []);

  return {
    ...state,
    startRound,
    tapObject,
    selectAnswer,
    retryAnswer,
    completeRound,
  };
}
