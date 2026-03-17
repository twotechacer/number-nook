# Number Nook — Implementation Plan

## Context
Building a calm counting app (1–50) for a 3-year-old, set in a cosy treehouse world with 3 floors, 6 animals, and 3 game mechanics. The project is a brand-new empty git repo. Tech stack: Expo + TypeScript + Expo Router.

---

## Phase 0 — Project Bootstrap + Test Infrastructure
**Goal:** Runnable blank Expo app with all deps, navigation skeleton, and test framework.

### Setup
- `npx create-expo-app number-nook --template blank-typescript`
- Install app deps:
  - `expo-router`, `react-native-reanimated` v3, `react-native-gesture-handler`
  - `expo-av`, `react-native-svg`, `expo-haptics`
  - `@react-native-async-storage/async-storage`, `expo-secure-store`
  - `zustand`
- Install test deps:
  - `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`
  - `ts-jest` or use `jest-expo` preset
- Configure `app.json`: scheme "number-nook", portrait lock, splash
- Configure `tsconfig.json` with path alias `@/*` → `src/*`
- Configure `babel.config.js` with reanimated plugin
- Configure `jest.config.js` with `jest-expo` preset, moduleNameMapper for `@/*`, mock setup for `expo-av`, `reanimated`, `AsyncStorage`
- Create `__mocks__/` for expo modules (expo-av, AsyncStorage, expo-haptics)

### File structure
```
app/                              # Expo Router routes
├── _layout.tsx                   # Root: providers, fonts, splash
├── index.tsx                     # Redirect → onboarding or home
├── onboarding.tsx                # Name entry (placeholder)
├── home.tsx                      # Treehouse (placeholder)
├── floor/
│   ├── _layout.tsx               # Floor theme, back button (placeholder)
│   └── [floorId].tsx             # Floor menu (placeholder)
├── game/
│   ├── _layout.tsx               # Exit gate, progress (placeholder)
│   ├── counting.tsx              # (placeholder)
│   ├── feeding.tsx               # (placeholder)
│   └── bubbles.tsx               # (placeholder)
├── star-award.tsx                # (placeholder)
└── (parent)/
    ├── _layout.tsx               # (placeholder)
    ├── report.tsx                # (placeholder)
    └── settings.tsx              # (placeholder)

src/
├── types/game.ts                 # All TypeScript types
├── data/
│   ├── colors.ts                 # Colour palette constants
│   ├── floors.ts                 # Floor config (ranges, animals, themes)
│   ├── animals.ts                # Animal metadata
│   └── thresholds.ts             # Magic numbers (FEED_UNLOCK=5, etc.)
└── utils/numberHelpers.ts        # Range checks, shuffle, etc.

__tests__/                        # Test directory (mirrors src/)
jest.config.js
__mocks__/                        # Expo module mocks
```

### Deliverable
A running Expo app with placeholder screens for every route. `npx expo start` works. `npm test` runs and passes (with a trivial smoke test).

### Unit tests
- `__tests__/smoke.test.ts` — verify Jest runs, basic assertion passes

### Manual tests
- `npx expo start` → app opens, shows placeholder home screen
- Navigate to each placeholder route via URL bar (no crashes)

---

## Phase 1 — Data Layer + Engine (Logic Only, No UI)
**Goal:** All game logic as pure functions + Zustand store, fully unit-tested before any UI depends on it.

### TypeScript types (`src/types/game.ts`)
```typescript
type MechanicType = 'counting' | 'feed' | 'bubbles'
type NumberGroupKey = '1_10' | '11_20' | '21_30' | '31_40' | '41_50'

interface NumberStats {
  correct: number; wrong: number; lastPlayed: number;
  countingCorrect: number; feedCorrect: number; bubblesCorrect: number;
}

interface GroupMechanicUnlocks { feed: boolean; bubbles: boolean; }
interface FloorUnlocks { floor2: boolean; floor3: boolean; }
interface SessionEntry { date: number; numbersPlayed: number[]; mechanicsUsed: MechanicType[]; starsEarned: number; durationSecs: number; }
interface Settings { soundEnabled: boolean; ambientEnabled: boolean; autoFloorUnlock: boolean; parentPin: string | null; }
```

### Files to create
- `src/types/game.ts` — all types
- `src/data/colors.ts` — palette constants
- `src/data/thresholds.ts` — `FEED_UNLOCK_THRESHOLD = 5`, `BUBBLES_UNLOCK_THRESHOLD = 3`, `MASTERY_THRESHOLD = 3`, `FLOOR_MASTERY_PERCENT = 0.8`
- `src/data/floors.ts` — floor definitions with number ranges, animal refs, colours
- `src/data/animals.ts` — 6 animal records: id, name, range, floor, treat emoji
- `src/utils/numberHelpers.ts` — `rangeInclusive`, `shuffle`, `clamp`
- `src/engine/distractors.ts` — generate 3 answer choices from target ±1, ±2, filtered to 1–50
- `src/engine/mastery.ts` — `getMasteryStatus(stats)`, `countMastered(mastery, from, to)`, `getFloorMasteryPercent(mastery, floor)`
- `src/engine/unlocks.ts` — `computeMechanicUnlocks(mastery)`, `computeFloorUnlocks(mastery, current, autoUnlock)`
- `src/engine/numberSelector.ts` — `selectNextNumber(mastery, floor, recentNumbers)` with weighted random
- `src/store/initialState.ts` — `createInitialProfile()` factory with all 50 numbers initialised
- `src/store/useGameStore.ts` — Zustand store with persist middleware, actions: `setChildName`, `recordAnswer`, `addStar`, `startSession`, `endSession`, `overrideFloorUnlock`, `resetProgress`
- `src/store/selectors.ts` — `useFloorProgress`, `useIsMechanicUnlocked`, `useAnimalForNumber`, `useNumbersNeedingPractice`

### Unit tests (`__tests__/engine/`)
- `distractors.test.ts`
  - Target=5 → returns [correct, d1, d2], all unique, within 1–50, correct included
  - Target=1 → distractors are ≥1 (no 0 or negative)
  - Target=50 → distractors are ≤50
  - Always returns exactly 3 values
- `mastery.test.ts`
  - `getMasteryStatus(undefined)` → 'not_started'
  - `getMasteryStatus({correct:1, wrong:0,...})` → 'practiced'
  - `getMasteryStatus({correct:3, wrong:0,...})` → 'mastered'
  - `getFloorMasteryPercent` with 8/10 mastered → 80
- `unlocks.test.ts`
  - Fresh mastery → all mechanic unlocks are false
  - 5 counting correct in group '1_10' → feed unlocks for '1_10', not for '11_20'
  - 3 feed correct in group '1_10' → bubbles unlocks for '1_10'
  - Floor 2 unlocks when 8 of numbers 1–10 are mastered
  - Floor 3 unlocks when 16 of numbers 1–20 are mastered
  - Parent override: `overrideFloorUnlock('floor2', true)` → floor2 stays true regardless of mastery
- `numberSelector.test.ts`
  - Returns number within floor range
  - Never returns a number in the recentNumbers list (unless forced)
  - Unplayed numbers are selected more often (statistical test over 1000 runs)
- `numberHelpers.test.ts`
  - `rangeInclusive(1, 10)` → [1,2,...,10]
  - `shuffle` returns same elements, different order (statistical)

### Integration tests (`__tests__/store/`)
- `useGameStore.test.ts`
  - Initial state has 50 numbers, all zeros
  - `recordAnswer(5, 'counting', true)` → number 5's countingCorrect increments
  - `recordAnswer` 5 times for counting in group 1_10 → mechanicUnlocks['1_10'].feed becomes true
  - `addStar()` → totalStars increments
  - `resetProgress()` → returns to initial state
  - Persist: write state, recreate store, state is restored (mock AsyncStorage)

### Manual tests
- Run `npm test` — all ~25 tests pass
- Run `npx tsc --noEmit` — no type errors

### Deliverable
All game logic is implemented and tested. No UI changes yet. The engine is the foundation everything else builds on.

---

## Phase 2 — Onboarding + Home Screen + Floor Menu
**Goal:** Name entry → treehouse with 3 floor cards → tap into Floor 1 menu → see 3 mechanic cards.

### Files to create/update
- `app/onboarding.tsx` — Large text input, skip option, "Let's go!" button, stores name via `setChildName`
- `app/home.tsx` — 3 `FloorCard` components stacked, star counter at bottom, settings button (parent gate icon)
- `app/floor/[floorId].tsx` — 3 mechanic cards (Counting/Feed/Bubbles) with lock/unlock states from store
- `app/floor/_layout.tsx` — Back button, floor theme colour from `floors.ts`
- `src/components/treehouse/FloorCard.tsx` — Colour-themed card: animal emoji (56px), floor name, number range, phase indicator text, progress bar, lock overlay
- `src/components/ui/BigButton.tsx` — 56px+ touch target, sage green, rounded
- `src/components/ui/LockOverlay.tsx` — Semi-transparent overlay with lock icon

### Colour palette applied
```
Sage green: #5A9A70 | Warm cream: #F7F4EE | Soft amber: #F0C84A
Straw yellow: #EFD070 | Soft lavender: #C8B8E8
Text primary: #2C3E30 | Text secondary: #7A6D5A
```

### Unit tests
- `__tests__/components/FloorCard.test.tsx`
  - Renders floor name, number range, animal emoji
  - Shows lock overlay when `isLocked=true`
  - Shows progress bar reflecting mastery percentage
  - Shows correct phase indicator text ("Counting unlocked", "Counting + Feeding unlocked", etc.)
- `__tests__/components/LockOverlay.test.tsx`
  - Renders lock icon
  - Overlay is touchable (tapping locked floor doesn't crash)

### Manual tests
- Fresh app → onboarding → type name → "Let's go!" → home screen
- Skip name → home screen (name defaults to empty)
- Home screen: Floor 1 unlocked (green), Floors 2–3 locked with lock icon
- Tap Floor 1 → floor menu with 3 mechanic cards
- Counting card active, Feed + Bubbles show lock overlays
- Star counter shows 0 at bottom
- Back button on floor menu returns to home

### Deliverable
Complete onboarding → home → floor menu flow. Lock states driven by real Zustand store data.

---

## Phase 3 — Counting Game (Mechanic A) + Star Award
**Goal:** Fully playable counting rounds for numbers 1–10 with correct/wrong feedback and star award.

### Files to create
- `app/game/_layout.tsx` — Exit button (placeholder, parent gate added in Phase 7), progress indicator
- `app/game/counting.tsx` — Screen composition using `useCountingGame` hook
- `src/hooks/useCountingGame.ts` — Round state machine: `idle` → `tapping` (generate N objects) → `answering` (show 3 choices) → `correct`/`wrong` → `complete`
- `src/components/game/CountableObject.tsx` — 56px+ tappable circle, checkmark overlay on tap, animated scale bounce
- `src/components/game/NumeralChoice.tsx` — 80×80px answer button, correct (green pulse) / wrong (peachy shake) feedback
- `app/star-award.tsx` — Amber background, pulsing star, numeral displayed, auto-advance 1.5s or tap to advance
- `src/components/ui/StarBurst.tsx` — Star animation component
- `src/components/animals/AnimalBase.tsx` — Shared wrapper: idle wiggle via reanimated, expression switching (neutral/happy/celebrating)
- `src/components/animals/BennyBear.tsx` — SVG with 3 expressions (Floor 1, numbers 1–5)
- `src/components/animals/HattieHedgehog.tsx` — SVG with 3 expressions (Floor 1, numbers 6–10)
- `src/animations/bounce.ts` — `withSpring(1.15)` → `withSpring(1)`
- `src/animations/wiggle.ts` — `withRepeat(withSequence(rotate -3deg, rotate 3deg))`
- `src/animations/starBurst.ts` — Star scale from 0→1 with spring + particle burst

### Animation details
- Object tap: `withSpring(1.15)` → `withSpring(1)` + checkmark overlay fades in
- Correct answer: numeral pulses (scale 1.0→1.15→1.0), star floats up (single pass, translateY), auto-advance 1.5s
- Wrong answer: horizontal shake (`withSequence(translateX -10, 10, -6, 6, 0)` over 400ms), peachy pink bg (#F4A898) for 500ms

### Unit tests
- `__tests__/hooks/useCountingGame.test.ts`
  - Initial state is `idle`
  - `startRound(5)` generates 5 objects, state becomes `tapping`
  - Tapping all objects transitions to `answering`, provides 3 answer choices
  - Selecting correct answer → state `correct`, calls `recordAnswer` on store
  - Selecting wrong answer → state `wrong`, does NOT advance, attempts increment
  - After correct → `addStar` called, state becomes `complete`
- `__tests__/components/CountableObject.test.tsx`
  - Renders with correct size (≥56px)
  - Shows checkmark after tap
  - Calls onTap callback
- `__tests__/components/NumeralChoice.test.tsx`
  - Renders numeral text
  - Calls onSelect with its value on press

### Manual tests
- Home → Floor 1 → Tap "Count it!" → counting game starts
- See N objects on screen (organic layout, not grid)
- Tap each object → counter increments, checkmark appears
- After all tapped → 3 answer buttons appear
- Tap correct → green pulse, star floats, → star award screen → auto-advances back
- Tap wrong → gentle shake, peachy pink flash, buttons remain (try again)
- Progress persists: close app, reopen, star count retained
- Works for numbers 1–10 (number selected by `selectNextNumber`)

### Deliverable
End-to-end counting gameplay loop: floor menu → counting → star award → back to floor menu. Store records answers and stars.

---

## Phase 4 — Mechanic Unlock System + Floor Progression
**Goal:** Counting rounds unlock Feed; future feed rounds will unlock Bubbles. Floor 2/3 unlock at mastery thresholds. All unlock logic is wired and testable.

### Files to create/update
- Update `src/store/useGameStore.ts` — `recordAnswer` now calls `computeMechanicUnlocks` and `computeFloorUnlocks` after each answer, stores results
- Update `src/store/selectors.ts` — `useIsMechanicUnlocked(groupKey, mechanic)`, `useFloorProgress(floorId)`, `useGroupProgress(groupKey)` selectors
- Update `app/floor/[floorId].tsx` — Mechanic cards dynamically read unlock state from store. Amber glow animation on first unlock (reanimated `withTiming` on border/shadow)
- Update `app/home.tsx` — FloorCards read `floorUnlocks` from store, show unlock animation on first unlock
- Update `src/components/treehouse/FloorCard.tsx` — Progress bar uses `useFloorProgress`, phase text updates dynamically

### Unit tests (extend existing)
- `__tests__/store/useGameStore.test.ts` (additions)
  - Record 5 correct counting answers across numbers 1–10 → `mechanicUnlocks['1_10'].feed` becomes `true`
  - Record 3 correct feed answers across numbers 1–10 → `mechanicUnlocks['1_10'].bubbles` becomes `true`
  - Master 8 of 10 numbers on Floor 1 → `floorUnlocks.floor2` becomes `true`
  - Master 16 of 20 numbers on Floors 1+2 → `floorUnlocks.floor3` becomes `true`
  - Unlocks are per-group: unlocking feed for '1_10' does NOT unlock feed for '11_20'
- `__tests__/store/selectors.test.ts`
  - `useIsMechanicUnlocked('1_10', 'counting')` → always true
  - `useIsMechanicUnlocked('1_10', 'feed')` → false initially, true after threshold
  - `useFloorProgress('floor1')` → percentage based on mastered numbers
  - `useGroupProgress('1_10')` → { countingCorrect: N, feedCorrect: N, bubblesCorrect: N }

### Manual tests
- Play 5 counting rounds correctly on Floor 1 → "Feed the animals!" card glows amber and unlocks
- Feed card shows "NEW" badge on first unlock
- Bubbles card still shows lock with text "Complete 3 feeding rounds to unlock"
- Progress bar on home screen updates after each round
- If mastery reaches 80% on Floor 1 → Floor 2 card unlocks with animation on home screen
- Locked floor tap → no crash, warm visual feedback (slight bounce)

### Deliverable
Unlock progression is fully wired. Counting gameplay drives unlocks. Feed/Bubbles mechanics don't exist yet, but their lock states are visible and reactive. The unlock engine is proven by unit tests — when Feed is built in Phase 6, it will "just work" with the existing unlock system.

---

## Phase 5 — Pop the Bubbles (Mechanic C)
**Goal:** Floating bubble mechanic is fully playable. Accessible from floor menu once unlocked.

### Note on unlock order
Per PRD, bubbles unlock after 3 feeding rounds. Since Feed isn't built yet, for development/testing we temporarily add a dev-only button in floor menu to force-unlock bubbles. This is removed when Feed ships in Phase 6.

### Files to create
- `app/game/bubbles.tsx` — Screen composition using `useBubblesGame` hook
- `src/hooks/useBubblesGame.ts` — Round state machine: `spawning` → `popping` (N bubbles on screen) → `answering` (all popped, show 3 choices) → `correct`/`wrong` → `complete`
- `src/components/game/Bubble.tsx` — Animated translucent circle (52–72px), per-floor colour, pop animation on tap
- `src/components/game/BubbleField.tsx` — Container managing N bubble positions, edge bounce logic, tracks popped count
- `src/animations/float.ts` — Linear drift ~60px/sec + horizontal sine wobble + edge bounce (reverse velocity on boundary)

### Bubble physics (custom JS, no library)
- Each bubble: `{ x, y, vx, vy }` updated via `requestAnimationFrame` or reanimated `useFrameCallback`
- Speed: ~60px/sec magnitude, random initial direction
- Edge bounce: reverse vx/vy component on screen boundary collision
- No acceleration, no gravity — calm, predictable motion

### Animation details
- Pop: `withSequence(withSpring(scale 1.3, {damping:3}), withTiming(scale 0, 200ms))` + white particle burst (4–5 small circles scatter outward over 300ms)
- Last 2 bubbles: subtle amber glow ring (`withRepeat(withSequence(opacity 0.3, opacity 0.8))`)
- After all popped: counter pulses, 3-choice answer screen (reuse `NumeralChoice` from Phase 3)

### Unit tests
- `__tests__/hooks/useBubblesGame.test.ts`
  - `startRound(7)` spawns 7 bubbles
  - Popping a bubble decrements remaining count
  - When all popped → state transitions to `answering`
  - Correct answer → state `correct`, `recordAnswer` called
  - Wrong answer → state `wrong`, try again
- `__tests__/components/BubbleField.test.ts` (logic only, no rendering)
  - `initBubbles(5, screenWidth, screenHeight)` returns 5 bubbles with positions inside bounds
  - `updateBubble(bubble, dt)` moves position by velocity * dt
  - `bounceBubble(bubble, screenWidth, screenHeight)` reverses velocity at edges
  - Bubbles never go out of bounds after bounce

### Manual tests
- Floor menu → tap "Pop the bubbles!" (force-unlocked for dev) → game starts
- N bubbles float slowly across screen, bouncing off edges
- Tap a bubble → pop animation + particle burst + soft pop visual
- Counter updates with each pop
- Last 2 bubbles have amber glow ring
- All popped → 3 answer buttons appear → pick correct → star award
- Pick wrong → gentle shake, try again
- Star counter increments, progress persists

### Deliverable
Complete bubbles gameplay loop. Reuses NumeralChoice and StarAward from Phase 3. Bubble physics are smooth and calm. Dev-only force-unlock for testing.

---

## Phase 6 — Feed the Animal (Mechanic B) + Full Unlock Flow
**Goal:** Drag/tap treats to animal, tummy-full celebration. Remove dev-only unlock bypass. All 3 mechanics fully connected.

### Files to create
- `app/game/feeding.tsx` — Screen composition using `useFeedingGame` hook
- `src/hooks/useFeedingGame.ts` — Round state machine: `waiting` → `feeding` (drag/tap treats) → `tummyFull` (animation) → `complete`
- `src/components/game/Treat.tsx` — Draggable via `Gesture.Pan()` AND tappable (tap auto-delivers with arc animation)
- `src/components/game/AnimalTummy.tsx` — Animal body with 4 expression states: waiting, anticipating (after first treat), full, waving
- `src/animations/tummyFull.ts` — The signature 2400ms animation sequence
- `src/components/animals/BiniBird.tsx` — SVG, 3 expressions (Floor 2, 11–20)
- `src/components/animals/MochiCat.tsx` — SVG, 3 expressions (Floor 2, 21–30)
- `src/components/animals/PippaBunny.tsx` — SVG, 3 expressions (Floor 3, 31–40)
- `src/components/animals/EllieElephant.tsx` — SVG, 3 expressions (Floor 3, 41–50)

### Files to update
- Remove dev-only force-unlock button from `app/floor/[floorId].tsx`
- Bubbles now only accessible after 3 real feeding rounds (driven by store)

### Tummy-full animation sequence (per PRD)
1. (0–400ms) Belly scales 1.0→1.08→1.0
2. (400–1200ms) Paw rises, pats belly in arc
3. (600–1000ms) Eyes morph to happy curves
4. (800–1200ms) Soft "mmm" (visual indicator until audio Phase 7)
5. (1200–1600ms) Gentle burp + star pops from mouth, floats up
6. (1600–2400ms) Animal waves goodbye + praise text
7. (2400ms) Transition to star award

### Drag mechanics
- `Gesture.Pan()` with `onUpdate` driving `useSharedValue` for x/y translation
- `onEnd`: rect intersection check with animal hit zone → snap to mouth (`withSpring`) or return to tray (`withSpring`)
- Tap mode: tapping a treat auto-delivers it (arc animation via `withTiming` on translateX/Y)
- Undo button: appears after first treat, removes most recent, max 1 step back

### 6 Animals with unique tummy-full personalities
| Animal | Numbers | Treat | Tummy-full detail |
|--------|---------|-------|-------------------|
| Benny Bear | 1–5 | Honey jar | Pats belly both paws, golden star |
| Hattie Hedgehog | 6–10 | Mushroom | Spins 180°, spines wiggle, green star |
| Bini Bird | 11–20 | Berry | Flaps wings 3×, musical note star |
| Mochi Cat | 21–30 | Fish | Curls tail, purr + mmm, pink star |
| Pippa Bunny | 31–40 | Carrot | Foot thumps 2×, ears bounce, lavender star |
| Ellie Elephant | 41–50 | Peanut | Trunk trumpet, teal star from trunk |

### Unit tests
- `__tests__/hooks/useFeedingGame.test.ts`
  - `startRound(5, 'benny-bear')` → state `feeding`, fedCount=0, target=5
  - `feedTreat()` → fedCount increments
  - `undoTreat()` → fedCount decrements (min 0)
  - At fedCount === target → state transitions to `tummyFull`
  - After tummy animation completes → `recordAnswer` called, `addStar` called
- `__tests__/components/Treat.test.tsx`
  - Renders treat icon
  - Tap calls `onDeliver`

### Manual tests — **Full end-to-end unlock flow**
1. Fresh app → onboarding → home → Floor 1
2. Count it! → play 5 correct rounds → "Feed the animals!" unlocks with amber glow
3. Feed the animals! → drag honey jars to Benny Bear → tummy-full animation plays → star award
4. Play 3 feeding rounds → "Pop the bubbles!" unlocks
5. Pop the bubbles! → pop bubbles → answer → star award
6. All 3 mechanics now freely available
7. Master 8 of 10 numbers → Floor 2 unlocks on home screen
8. Floor 2 → Bini Bird counting → repeat unlock cycle
9. Undo button: give 1 treat → undo → counter goes back to 0
10. Tap-to-deliver: tap treat → it arcs to animal mouth

### Deliverable
All 3 game mechanics complete. Full unlock progression works end-to-end. All 6 animals built with unique tummy-full animations. The core gameplay loop is fully functional.

---

## Phase 7 — Audio System + Parent Gate + Parent Report + Settings
**Goal:** Sound effects on all interactions, parent-only screens behind addition gate, progress reporting.

### Audio system
- `src/audio/AudioManager.ts` — Singleton: `init()`, `preloadSFX()`, `play(key)`, `playNumber(n)`, `stopAll()`
- `src/audio/sounds.ts` — Registry mapping sound keys to `require('../../assets/audio/sfx/...')`
- `src/hooks/useAudio.ts` — Hook wrapping AudioManager, respects `soundEnabled` from store
- `assets/audio/sfx/` — Placeholder audio files: tap.mp3, pop.mp3, correct.mp3, wrong.mp3, star.mp3, munch.mp3, tummyfull.mp3, unlock.mp3
- `assets/audio/numbers/` — 1.mp3 through 50.mp3 (bundled neutral voice, or placeholder TTS)
- Update all game screens to call `useAudio().play(key)` at appropriate events
- `expo-av` config: `playsInSilentModeIOS: true`, `staysActiveInBackground: false`

### Sound map
| Event | Sound key | When added |
|-------|-----------|------------|
| Tap countable object | `tap` | counting.tsx |
| Correct answer | `correct` | counting.tsx, bubbles.tsx |
| Wrong answer | `wrong` | counting.tsx, bubbles.tsx |
| Star awarded | `star` | star-award.tsx |
| Bubble pop | `pop` | bubbles.tsx |
| Treat eaten | `munch` | feeding.tsx |
| Tummy full (mmm) | `mmm` | feeding.tsx |
| Tummy full (burp) | `burp` | feeding.tsx |
| Mechanic unlock | `unlock` | [floorId].tsx |
| Number spoken | `number_N` | all game screens |

### Parent gate
- `src/components/ui/ParentGate.tsx` — Modal with addition question (operands 2–9, sum ≤ 18), 4-choice answers, regenerates each time
- `src/hooks/useParentGate.ts` — `generateGateQuestion()` returns `{ question, correctAnswer, choices }`
- `app/(parent)/_layout.tsx` — Shows gate on mount, renders children only after correct answer

### Parent report (`app/(parent)/report.tsx`)
- Per-floor tab view
- Per-number mastery grid: not started (grey) / practiced (amber) / mastered (green)
- "Needs more practice": up to 3 numbers with highest wrong count
- "Ready to try next": suggests next 2 unmastered numbers
- Session history: last 7 days simple bar chart (stars per day)
- Most-used mechanic stat

### Settings (`app/(parent)/settings.tsx`)
- Sound toggle (on/off)
- Ambient toggle (off by default, soft forest sounds at 20% volume, 3s fade-in)
- Voice preference (Mum/Dad/Default — only Default functional in v1.0)
- Floor unlock override per floor (toggle)
- Child name edit
- Reset progress (with "Are you sure?" confirmation)

### Unit tests
- `__tests__/hooks/useParentGate.test.ts`
  - `generateGateQuestion()` returns question string, correct answer, and 4 choices
  - Correct answer is always in choices
  - Operands are 2–9, sum ≤ 18
  - Choices are unique
- `__tests__/audio/AudioManager.test.ts`
  - `play('tap')` calls expo-av Sound.playAsync (mocked)
  - `play('tap')` does nothing when soundEnabled is false
  - `preloadSFX()` loads all registered sounds
- `__tests__/store/selectors.test.ts` (additions for report)
  - `useNumbersNeedingPractice(floorId)` returns up to 3 numbers sorted by wrong count
  - `useNextSuggestedNumbers(floorId)` returns 2 unmastered numbers

### Manual tests
- Tap parent/settings icon on home → addition question appears
- Wrong answer → "Try again" (no penalty, new question)
- Correct answer → settings screen opens
- Report: shows accurate mastery grid matching gameplay done in earlier phases
- Report: "Needs more practice" shows numbers you got wrong
- Settings: toggle sound off → replay counting game → no sounds
- Settings: toggle sound on → sounds play
- Settings: override Floor 2 unlock → Floor 2 accessible on home screen
- Settings: reset progress → confirm → all progress cleared, back to onboarding
- Ambient: toggle on → soft forest sounds fade in over 3s

### Deliverable
Audio on all interactions. Parent gate protects settings/report. Report shows real progress. Settings controls work. The app is feature-complete.

---

## Phase 8 — Polish, Accessibility, and Final QA
**Goal:** Production-quality polish. Every item has clear acceptance criteria.

### Items with acceptance criteria

1. **Teen numbers (11–19) tens-frame layout**
   - Counting game for 11–19 shows: row of 10 blue dots + remaining amber dots
   - Visual clearly communicates "ten and N more"
   - Test: play counting for number 13 → see 10 blue + 3 amber objects

2. **Accessibility labels**
   - Every tappable element has `accessibilityLabel` and `accessibilityRole="button"`
   - Animals have descriptive labels ("Benny Bear, happy expression")
   - Test: enable VoiceOver on device → navigate all screens, all elements announced

3. **Haptic feedback**
   - `expo-haptics` light impact on: object tap, bubble pop, treat delivery
   - `expo-haptics` success notification on: correct answer, star award
   - `expo-haptics` warning notification on: wrong answer
   - Test: feel haptics on real device for each interaction type

4. **Loading states**
   - Zustand hydration: show splash screen until `isHydrated` is true
   - Asset preloading: show loading indicator during `preloadSFX()`
   - Test: force slow AsyncStorage → splash shows, then home renders

5. **Error boundaries**
   - `src/components/ui/ErrorBoundary.tsx` wrapping each route group
   - On error: shows friendly "Oops!" screen with "Go home" button
   - Test: throw error in counting game → error boundary catches, shows recovery UI

6. **Session management**
   - `AppState` listener in root layout: `endSession()` on `background`/`inactive`
   - On hydration: if `currentSessionStart` is non-null, synthesize stale session entry
   - Test: start counting → background app → reopen → session logged in report

7. **App icon + splash screen**
   - Treehouse-themed icon (1024×1024)
   - Splash: warm cream background with "Number Nook" text
   - Test: app icon visible on home screen, splash shows on cold start

8. **Performance audit**
   - Bubble animation: consistent 60fps (test with React DevTools Profiler)
   - No unnecessary re-renders during animations (verify with `useCallback`/`useMemo` and React Profiler)
   - App cold start under 3 seconds on iPhone 12+
   - Test: Profile with Expo dev tools, no frame drops below 55fps

### Unit tests
- `__tests__/components/ErrorBoundary.test.tsx` — catches thrown error, renders fallback
- `__tests__/session/staleSession.test.ts` — stale session detection and recovery

### Manual tests — **Full regression**
1. Fresh install → onboarding → type name → home
2. Floor 1 → Count 5 rounds → Feed unlocks (sound + haptic)
3. Feed 3 rounds → Bubbles unlocks (sound + haptic)
4. Play all 3 mechanics → stars accumulate
5. Master 8/10 → Floor 2 unlocks (animation + sound)
6. Teen number (e.g., 13) → tens-frame layout shows 10+3
7. Parent gate → report → correct mastery data
8. Settings → toggle sound off/on → verify
9. Settings → override floor unlock → verify
10. Kill app → reopen → all progress intact
11. Background app during game → reopen → session logged
12. VoiceOver walkthrough of all screens

### Deliverable
Production-ready app. All features polished, accessible, and performant. Ready for Expo Go testing with target user.

---

## Test Infrastructure Summary

### Test stack
- **Runner:** Jest via `jest-expo` preset
- **Component testing:** `@testing-library/react-native`
- **Mocks:** `__mocks__/` for expo-av, AsyncStorage, expo-haptics, react-native-reanimated

### Test file conventions
```
__tests__/
├── engine/           # Pure function tests (distractors, mastery, unlocks, numberSelector)
├── store/            # Zustand store + selector tests
├── hooks/            # Game hook tests (counting, feeding, bubbles, parentGate)
├── components/       # Component render + interaction tests
├── audio/            # AudioManager tests
├── session/          # Session tracking tests
└── smoke.test.ts     # Basic smoke test
```

### Running tests
- `npm test` — run all tests
- `npm test -- --watch` — watch mode during development
- `npx tsc --noEmit` — type checking (run after each phase)

### Test counts per phase
| Phase | Unit tests | Integration tests | Manual test cases |
|-------|-----------|-------------------|-------------------|
| 0 | 1 (smoke) | 0 | 2 |
| 1 | ~20 (engine) | ~6 (store) | 2 |
| 2 | ~4 (components) | 0 | 7 |
| 3 | ~8 (hook + components) | 0 | 8 |
| 4 | ~8 (store + selectors) | 0 | 6 |
| 5 | ~6 (hook + physics) | 0 | 5 |
| 6 | ~8 (hook + treat) | 0 | 10 |
| 7 | ~8 (gate + audio + selectors) | 0 | 10 |
| 8 | ~4 (error boundary + session) | 0 | 12 |
| **Total** | **~67** | **~6** | **~62** |
