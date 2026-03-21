import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';
import { FloorId } from '@/types/game';
import { FLOORS } from '@/data/floors';
import { hapticTap, hapticSuccess, hapticError } from '@/utils/haptics';
import { playSound } from '@/utils/audio';
import { MAX_ANSWER_ATTEMPTS } from '@/data/thresholds';

export type FeedingPhase =
  | 'idle'
  | 'feeding'
  | 'answering'
  | 'correct'
  | 'tummy_full'
  | 'wrong'
  | 'strike_out'
  | 'complete';

interface FeedingGameState {
  phase: FeedingPhase;
  targetNumber: number;
  fedIndices: number[]; // tracks WHICH treats were fed, in order
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
    fedIndices: [],
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
      fedIndices: [],
      answerChoices: choices,
      attempts: 0,
    });
  }, [mastery, floorRange]);

  const feedTreat = useCallback((index: number) => {
    hapticTap();
    playSound('treat_feed');
    setState((prev) => {
      if (prev.phase !== 'feeding') return prev;
      if (prev.fedIndices.includes(index)) return prev; // already fed
      const newFedIndices = [...prev.fedIndices, index];
      if (newFedIndices.length >= prev.targetNumber) {
        return { ...prev, fedIndices: newFedIndices, phase: 'answering' };
      }
      return { ...prev, fedIndices: newFedIndices };
    });
  }, []);

  const undoTreat = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'feeding' || prev.fedIndices.length <= 0) return prev;
      return { ...prev, fedIndices: prev.fedIndices.slice(0, -1) };
    });
  }, []);

  const selectAnswer = useCallback(
    (answer: number) => {
      setState((prev) => {
        if (prev.phase !== 'answering') return prev;

        if (answer === prev.targetNumber) {
          hapticSuccess();
          playSound('correct_answer');
          recordAnswer(prev.targetNumber, 'feed', true);
          addStar();
          return { ...prev, phase: 'correct' };
        } else {
          hapticError();
          playSound('wrong_answer');
          recordAnswer(prev.targetNumber, 'feed', false);
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
      return { ...prev, phase: 'answering' };
    });
  }, []);

  const startTummyFull = useCallback(() => {
    playSound('tummy_full');
    setState((prev) => {
      if (prev.phase !== 'correct') return prev;
      return { ...prev, phase: 'tummy_full' };
    });
  }, []);

  const restartSameRound = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'strike_out') return prev;
      const choices = generateDistractors(prev.targetNumber);
      return {
        ...prev,
        phase: 'feeding',
        fedIndices: [],
        answerChoices: choices,
        attempts: 0,
      };
    });
  }, []);

  const completeRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'complete' }));
  }, []);

  return {
    ...state,
    fedCount: state.fedIndices.length,
    startRound,
    feedTreat,
    undoTreat,
    selectAnswer,
    retryAnswer,
    restartSameRound,
    startTummyFull,
    completeRound,
  };
}
