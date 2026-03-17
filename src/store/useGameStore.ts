import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChildProfile,
  MechanicType,
  VoicePreference,
  Settings,
  SessionEntry,
  MechanicUnlockMap,
  FloorUnlocks,
} from '@/types/game';
import { createInitialProfile } from './initialState';
import { computeMechanicUnlocks, computeFloorUnlocks } from '@/engine/unlocks';
import { MAX_SESSION_LOG } from '@/data/thresholds';

interface TransientState {
  isHydrated: boolean;
  currentSessionStart: number | null;
  currentSessionNumbers: number[];
  currentSessionMechanics: MechanicType[];
  currentSessionStars: number;
}

interface GameActions {
  setChildName: (name: string) => void;
  setVoicePreference: (v: VoicePreference) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  recordAnswer: (num: number, mechanic: MechanicType, correct: boolean) => void;
  addStar: () => void;
  overrideFloorUnlock: (floor: 'floor2' | 'floor3', value: boolean) => void;
  overrideMechanicUnlock: (unlocks: Partial<MechanicUnlockMap>) => void;
  startSession: () => void;
  endSession: () => void;
  resetProgress: () => void;
  setHydrated: () => void;
}

export type GameStore = ChildProfile & TransientState & GameActions;

const initialTransient: TransientState = {
  isHydrated: false,
  currentSessionStart: null,
  currentSessionNumbers: [],
  currentSessionMechanics: [],
  currentSessionStars: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialProfile(),
      ...initialTransient,

      setChildName: (name) => set({ childName: name }),
      setVoicePreference: (v) => set({ voicePreference: v }),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      recordAnswer: (num, mechanic, correct) =>
        set((state) => {
          const key = String(num);
          const prev = state.numberMastery[key];
          const updated = { ...prev, lastPlayed: Date.now() };

          if (correct) {
            updated.correct += 1;
            if (mechanic === 'counting') updated.countingCorrect += 1;
            else if (mechanic === 'feed') updated.feedCorrect += 1;
            else if (mechanic === 'bubbles') updated.bubblesCorrect += 1;
          } else {
            updated.wrong += 1;
          }

          const newMastery = { ...state.numberMastery, [key]: updated };

          // Recompute unlocks
          const newMechanicUnlocks = computeMechanicUnlocks(newMastery);
          const newFloorUnlocks = computeFloorUnlocks(
            newMastery, state.floorUnlocks, state.settings.autoFloorUnlock
          );

          // Merge mechanic unlocks (never re-lock)
          const mergedMechanicUnlocks = { ...state.mechanicUnlocks };
          for (const [gk, unlocks] of Object.entries(newMechanicUnlocks)) {
            const groupKey = gk as keyof MechanicUnlockMap;
            mergedMechanicUnlocks[groupKey] = {
              feed: mergedMechanicUnlocks[groupKey].feed || unlocks.feed,
              bubbles: mergedMechanicUnlocks[groupKey].bubbles || unlocks.bubbles,
            };
          }

          // Track in current session
          const sessionNumbers = state.currentSessionNumbers.includes(num)
            ? state.currentSessionNumbers
            : [...state.currentSessionNumbers, num];
          const sessionMechanics = state.currentSessionMechanics.includes(mechanic)
            ? state.currentSessionMechanics
            : [...state.currentSessionMechanics, mechanic];

          return {
            numberMastery: newMastery,
            mechanicUnlocks: mergedMechanicUnlocks,
            floorUnlocks: newFloorUnlocks,
            currentSessionNumbers: sessionNumbers,
            currentSessionMechanics: sessionMechanics,
          };
        }),

      addStar: () =>
        set((state) => ({
          totalStars: state.totalStars + 1,
          currentSessionStars: state.currentSessionStars + 1,
        })),

      overrideFloorUnlock: (floor, value) =>
        set((state) => ({ floorUnlocks: { ...state.floorUnlocks, [floor]: value } })),

      overrideMechanicUnlock: (unlocks) =>
        set((state) => {
          const merged = { ...state.mechanicUnlocks };
          for (const [gk, val] of Object.entries(unlocks)) {
            const groupKey = gk as keyof MechanicUnlockMap;
            if (val) merged[groupKey] = { ...merged[groupKey], ...val };
          }
          return { mechanicUnlocks: merged };
        }),

      startSession: () =>
        set({
          currentSessionStart: Date.now(),
          currentSessionNumbers: [],
          currentSessionMechanics: [],
          currentSessionStars: 0,
        }),

      endSession: () =>
        set((state) => {
          if (!state.currentSessionStart) return {};
          const entry: SessionEntry = {
            date: state.currentSessionStart,
            numbersPlayed: [...new Set(state.currentSessionNumbers)],
            mechanicsUsed: state.currentSessionMechanics,
            starsEarned: state.currentSessionStars,
            durationSecs: Math.round((Date.now() - state.currentSessionStart) / 1000),
          };
          return {
            sessionLog: [entry, ...state.sessionLog].slice(0, MAX_SESSION_LOG),
            currentSessionStart: null,
            currentSessionNumbers: [],
            currentSessionMechanics: [],
            currentSessionStars: 0,
          };
        }),

      resetProgress: () => set({ ...createInitialProfile(), ...initialTransient, isHydrated: true }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'number-nook-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const {
          isHydrated, currentSessionStart, currentSessionNumbers,
          currentSessionMechanics, currentSessionStars,
          setChildName, setVoicePreference, updateSettings, recordAnswer,
          addStar, overrideFloorUnlock, overrideMechanicUnlock,
          startSession, endSession, resetProgress, setHydrated,
          ...persisted
        } = state;
        return persisted;
      },
      onRehydrateStorage: () => (state) => { state?.setHydrated(); },
    }
  )
);
