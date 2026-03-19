import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { generateDistractors } from '@/engine/distractors';
import { selectNextNumber } from '@/engine/numberSelector';
import { FloorId } from '@/types/game';
import { FLOORS } from '@/data/floors';
import { hapticTap, hapticSuccess, hapticError } from '@/utils/haptics';
import { playSound } from '@/utils/audio';

export type BubblesPhase = 'idle' | 'popping' | 'answering' | 'correct' | 'wrong' | 'complete';

interface BubblesGameState {
  phase: BubblesPhase;
  targetNumber: number;
  poppedCount: number;
  answerChoices: [number, number, number];
  attempts: number;
}

export function useBubblesGame(floorId: FloorId) {
  const mastery = useGameStore((s) => s.numberMastery);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const addStar = useGameStore((s) => s.addStar);

  const recentNumbers = useRef<number[]>([]);

  const floor = FLOORS.find((f) => f.id === floorId);
  const floorRange: [number, number] = floor ? floor.numberRange : [1, 10];

  const [state, setState] = useState<BubblesGameState>({
    phase: 'idle',
    targetNumber: 0,
    poppedCount: 0,
    answerChoices: [0, 0, 0],
    attempts: 0,
  });

  const startRound = useCallback(() => {
    const num = selectNextNumber(mastery, floorRange, recentNumbers.current);
    recentNumbers.current = [...recentNumbers.current.slice(-2), num];

    const choices = generateDistractors(num);

    setState({
      phase: 'popping',
      targetNumber: num,
      poppedCount: 0,
      answerChoices: choices,
      attempts: 0,
    });
  }, [mastery, floorRange]);

  const popBubble = useCallback(() => {
    hapticTap();
    playSound('bubble_pop');
    setState((prev) => {
      if (prev.phase !== 'popping') return prev;
      const newCount = prev.poppedCount + 1;
      if (newCount >= prev.targetNumber) {
        return { ...prev, poppedCount: newCount, phase: 'answering' };
      }
      return { ...prev, poppedCount: newCount };
    });
  }, []);

  const selectAnswer = useCallback(
    (answer: number) => {
      setState((prev) => {
        if (prev.phase !== 'answering') return prev;

        if (answer === prev.targetNumber) {
          hapticSuccess();
          playSound('correct_answer');
          recordAnswer(prev.targetNumber, 'bubbles', true);
          addStar();
          return { ...prev, phase: 'correct' };
        } else {
          hapticError();
          playSound('wrong_answer');
          recordAnswer(prev.targetNumber, 'bubbles', false);
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
    popBubble,
    selectAnswer,
    retryAnswer,
    completeRound,
  };
}
