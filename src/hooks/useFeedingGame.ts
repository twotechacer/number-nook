import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';
import { FloorId } from '@/types/game';
import { FLOORS } from '@/data/floors';

export type FeedingPhase =
  | 'idle'
  | 'feeding'
  | 'answering'
  | 'correct'
  | 'tummy_full'
  | 'wrong'
  | 'complete';

interface FeedingGameState {
  phase: FeedingPhase;
  targetNumber: number;
  fedCount: number;
  answerChoices: [number, number, number];
  attempts: number;
}

export function useFeedingGame(floorId: FloorId) {
  const mastery = useGameStore((s) => s.numberMastery);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const addStar = useGameStore((s) => s.addStar);

  const recentNumbers = useRef<number[]>([]);

  const floor = FLOORS.find((f) => f.id === floorId);
  const floorRange: [number, number] = floor ? floor.numberRange : [1, 10];

  const [state, setState] = useState<FeedingGameState>({
    phase: 'idle',
    targetNumber: 0,
    fedCount: 0,
    answerChoices: [0, 0, 0],
    attempts: 0,
  });

  const startRound = useCallback(() => {
    const num = selectNextNumber(mastery, floorRange, recentNumbers.current);
    recentNumbers.current = [...recentNumbers.current.slice(-2), num];

    const choices = generateDistractors(num);

    setState({
      phase: 'feeding',
      targetNumber: num,
      fedCount: 0,
      answerChoices: choices,
      attempts: 0,
    });
  }, [mastery, floorRange]);

  const feedTreat = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'feeding') return prev;
      const newCount = prev.fedCount + 1;
      if (newCount >= prev.targetNumber) {
        return { ...prev, fedCount: newCount, phase: 'answering' };
      }
      return { ...prev, fedCount: newCount };
    });
  }, []);

  const undoTreat = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'feeding' || prev.fedCount <= 0) return prev;
      return { ...prev, fedCount: prev.fedCount - 1 };
    });
  }, []);

  const selectAnswer = useCallback(
    (answer: number) => {
      setState((prev) => {
        if (prev.phase !== 'answering') return prev;

        if (answer === prev.targetNumber) {
          recordAnswer(prev.targetNumber, 'feed', true);
          addStar();
          return { ...prev, phase: 'correct' };
        } else {
          recordAnswer(prev.targetNumber, 'feed', false);
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

  const startTummyFull = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'correct') return prev;
      return { ...prev, phase: 'tummy_full' };
    });
  }, []);

  const completeRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'complete' }));
  }, []);

  return {
    ...state,
    startRound,
    feedTreat,
    undoTreat,
    selectAnswer,
    retryAnswer,
    startTummyFull,
    completeRound,
  };
}
