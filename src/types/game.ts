// ─── Primitives ───────────────────────────────────────────
export type VoicePreference = 'mum' | 'dad' | 'default';
export type MasteryStatus = 'not_started' | 'practiced' | 'mastered';
export type MechanicType = 'counting' | 'feed' | 'bubbles';
export type FloorId = 'floor1' | 'floor2' | 'floor3';
export type NumberGroupKey = '1_10' | '11_20' | '21_30' | '31_40' | '41_50';

// ─── Per-Number Tracking ──────────────────────────────────
export interface NumberStats {
  correct: number;
  wrong: number;
  lastPlayed: number; // Date.now() timestamp, 0 if never
  countingCorrect: number;
  feedCorrect: number;
  bubblesCorrect: number;
}

// ─── Mechanic Unlocks ─────────────────────────────────────
export interface GroupMechanicUnlocks {
  feed: boolean;
  bubbles: boolean;
}

export type MechanicUnlockMap = Record<NumberGroupKey, GroupMechanicUnlocks>;

// ─── Floor Unlocks ────────────────────────────────────────
export interface FloorUnlocks {
  floor2: boolean;
  floor3: boolean;
}

// ─── Session Log ──────────────────────────────────────────
export interface SessionEntry {
  date: number;
  numbersPlayed: number[];
  mechanicsUsed: MechanicType[];
  starsEarned: number;
  durationSecs: number;
}

// ─── Settings ─────────────────────────────────────────────
export interface Settings {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  autoFloorUnlock: boolean;
  parentPin: string | null;
}

// ─── Root Persisted State ─────────────────────────────────
export interface ChildProfile {
  childName: string;
  totalStars: number;
  floorUnlocks: FloorUnlocks;
  mechanicUnlocks: MechanicUnlockMap;
  numberMastery: Record<string, NumberStats>;
  sessionLog: SessionEntry[];
  voicePreference: VoicePreference;
  settings: Settings;
}

// ─── Animal ───────────────────────────────────────────────
export interface AnimalConfig {
  id: string;
  name: string;
  emoji: string;
  range: [number, number];
  floor: FloorId;
  treat: string;
  treatEmoji: string;
  bubbleColor: string;
}

// ─── Floor ────────────────────────────────────────────────
export interface FloorConfig {
  id: FloorId;
  name: string;
  numberRange: [number, number];
  color: string;
  animals: string[]; // animal ids
  groups: NumberGroupKey[];
}
