# Number Nook — Implementation Plan

## Context
Building a calm counting app (1–50) for a 3-year-old, set in a cosy treehouse world with 3 floors, 6 animals, and 3 game mechanics. The project is a brand-new empty git repo. Tech stack: Expo + TypeScript + Expo Router.

---

## Phase 0 — Project Bootstrap
**Goal:** Runnable blank Expo app with all deps and navigation skeleton.

### Setup
- `npx create-expo-app number-nook --template blank-typescript`
- Install deps:
  - `expo-router`, `react-native-reanimated` v3, `react-native-gesture-handler`
  - `expo-av`, `react-native-svg`, `expo-haptics`
  - `@react-native-async-storage/async-storage`, `expo-secure-store`
  - `zustand`
- Configure `app.json`: scheme "number-nook", portrait lock, splash
- Configure `tsconfig.json` with path alias `@/*` → `src/*`
- Configure `babel.config.js` with reanimated plugin

### File structure
```
app/                              # Expo Router routes
├── _layout.tsx                   # Root: providers, fonts, splash
├── index.tsx                     # Redirect → onboarding or home
├── onboarding.tsx                # Name entry
├── home.tsx                      # Treehouse with 3 floor cards
├── floor/
│   ├── _layout.tsx               # Floor theme, back button
│   └── [floorId].tsx             # Floor menu: 3 mechanic cards
├── game/
│   ├── _layout.tsx               # Exit gate, progress
│   ├── counting.tsx
│   ├── feeding.tsx
│   └── bubbles.tsx
├── star-award.tsx
└── (parent)/                     # Behind parent gate
    ├── _layout.tsx               # Gate check
    ├── report.tsx
    └── settings.tsx

src/
├── components/
│   ├── ui/                       # BigButton, StarBurst, ParentGate, LockOverlay
│   ├── animals/                  # AnimalBase + 6 animal SVGs
│   ├── treehouse/                # FloorCard, Treehouse
│   └── game/                     # CountableObject, Treat, Bubble, BubbleField, NumeralChoice
├── store/
│   ├── useGameStore.ts           # Zustand + persist middleware
│   ├── initialState.ts           # Default profile factory
│   └── selectors.ts              # Derived: mastery %, unlock status
├── engine/
│   ├── unlocks.ts                # Mechanic + floor unlock pure functions
│   ├── mastery.ts                # Mastery status calculation
│   ├── distractors.ts            # Answer choice generation
│   └── numberSelector.ts         # Weighted random number selection
├── hooks/
│   ├── useCountingGame.ts        # Counting round state machine
│   ├── useFeedingGame.ts         # Feeding round logic
│   ├── useBubblesGame.ts         # Bubbles round logic
│   ├── useAudio.ts               # Audio playback hook
│   └── useParentGate.ts          # Gate challenge generator
├── audio/
│   ├── AudioManager.ts           # Singleton: preload, play, stop
│   └── sounds.ts                 # Sound file registry
├── data/
│   ├── floors.ts                 # Floor config (ranges, animals, themes)
│   ├── animals.ts                # Animal metadata
│   ├── colors.ts                 # Palette constants
│   └── thresholds.ts             # Magic numbers (FEED_UNLOCK=5, etc.)
├── animations/
│   ├── bounce.ts                 # Spring bounce worklet
│   ├── float.ts                  # Bubble drift
│   ├── tummyFull.ts              # Belly animation sequence
│   ├── starBurst.ts              # Star celebration
│   └── wiggle.ts                 # Idle animal wiggle
├── types/
│   └── game.ts                   # All TypeScript types
└── utils/
    └── numberHelpers.ts          # Range checks, shuffle, etc.

assets/
├── audio/sfx/                    # tap, pop, munch, star, correct, tryagain, unlock
├── audio/numbers/                # 1.mp3 through 50.mp3
├── fonts/                        # Child-friendly rounded font
└── images/                       # Splash, icon
```

**Verify:** `npx expo start` launches, navigates to placeholder home.

---

## Phase 1 — Data Layer + Onboarding + Home Screen
**Goal:** Name entry → treehouse with 3 floor cards → tap into Floor 1.

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

### State management — Zustand with `persist` middleware
- Store holds full `ChildProfile` (persisted via AsyncStorage) + transient `currentRound`
- `partialize` excludes transient fields from persistence
- Selectors in separate file for derived data (mastery %, unlock checks)

### Key engine functions (pure, testable)
- **Mechanic unlocks** (`src/engine/unlocks.ts`): Per 10-number group, sum `countingCorrect` across group → feed unlocks at 5; sum `feedCorrect` → bubbles unlocks at 3
- **Floor unlocks** (`src/engine/unlocks.ts`): Floor 1 always open. Floor 2 at 80% of Floor 1 (8/10 mastered). Floor 3 at 80% of Floor 2 (16/20 mastered). Parent override available.
- **Number selection** (`src/engine/numberSelector.ts`): Weighted random favoring unplayed (weight 10), practiced (7), mastered (2+recency). Excludes last 3 played.
- **Distractors** (`src/engine/distractors.ts`): Target ±1, ±2, filtered to 1–50 range.

### Screens
- `app/onboarding.tsx` — Large text input + "Let's go!" button
- `app/home.tsx` — 3 `FloorCard` components stacked, star counter at bottom
- `src/components/treehouse/FloorCard.tsx` — Color-themed card with animal emoji, number range, phase indicator, progress bar, lock overlay

### Colour palette (`src/data/colors.ts`)
```
Sage green: #5A9A70 | Warm cream: #F7F4EE | Soft amber: #F0C84A
Bubble aqua: rgba(164,210,225,0.45) | Straw yellow: #EFD070
Soft lavender: #C8B8E8 | Peachy pink: #F4A898
Text primary: #2C3E30 | Text secondary: #7A6D5A
```

**Verify:** Type name → see treehouse → Floor 1 unlocked, Floors 2–3 locked with overlay.

---

## Phase 2 — Counting Game (Mechanic A)
**Goal:** Fully playable counting rounds for numbers 1–10.

### Files
- `app/floor/[floorId].tsx` — 3 mechanic cards (Count active, Feed/Bubbles locked)
- `app/game/counting.tsx` — Screen composition
- `src/hooks/useCountingGame.ts` — Round state machine: generate N objects → wait for taps → show 3 answer choices → evaluate → star or retry
- `src/components/game/CountableObject.tsx` — 56px+ tappable object, checkmark on tap, counter increment
- `src/components/game/NumeralChoice.tsx` — 80×80px answer button with correct/wrong feedback
- `app/star-award.tsx` — Amber bg, pulsing star, numeral, auto-advance 1.5s
- `src/components/animals/AnimalBase.tsx` — Shared wrapper: idle wiggle, expression switching
- `src/components/animals/BennyBear.tsx` + `HattieHedgehog.tsx` — SVG with 3 expressions

### Animation details
- Object tap: `withSpring(1.15)` → `withSpring(1)` + checkmark overlay
- Correct answer: numeral pulses, star floats up (single pass), auto-advance 1.5s
- Wrong answer: horizontal shake (2 oscillations, 300ms), peachy pink 500ms, warm "hmm"

**Verify:** Tap objects, pick numeral, get star. Progress persists across restart.

---

## Phase 3 — Mechanic Unlock System
**Goal:** Counting unlocks Feed; Feed unlocks Bubbles. Floor progression.

### Logic
- After each correct answer → `recordAnswer()` → recompute `mechanicUnlocks` and `floorUnlocks`
- Floor menu dynamically shows lock/unlock states with amber glow animation on first unlock
- `src/store/selectors.ts` — `useIsMechanicUnlocked(groupKey, mechanic)`, `useFloorProgress(floorId)`

**Verify:** Play 5 counting rounds → "Feed the animals!" unlocks with glow animation.

---

## Phase 4 — Pop the Bubbles (Mechanic C)
**Goal:** Floating bubble mechanic playable. Built before Feed since it's simpler.

### Files
- `app/game/bubbles.tsx`, `src/hooks/useBubblesGame.ts`
- `src/components/game/Bubble.tsx` — Translucent aqua, 52–72px, pop animation
- `src/components/game/BubbleField.tsx` — Manages positions, spawning, edge bounce

### Animation details
- Drift: ~60px/sec fixed, bounce off edges (custom JS vectors, no physics lib)
- Pop: scale 1.0→0 in 200ms + white particle burst 300ms + soft pop sound
- Last 2 bubbles: subtle amber glow ring
- After all popped: counter pulses, answer screen appears (same 3-choice as counting)

### Audio cues
- First bubble: "Pop it, [name]!"
- 50% popped: "Halfway there!"
- All popped: "You popped them all!"

**Verify:** Bubbles float, tap to pop, answer question, earn star.

---

## Phase 5 — Feed the Animal (Mechanic B, most complex)
**Goal:** Drag/tap treats to animal, tummy-full celebration.

### Files
- `app/game/feeding.tsx`, `src/hooks/useFeedingGame.ts`
- `src/components/game/Treat.tsx` — Draggable (`Gesture.Pan`) AND tappable (tap auto-delivers)
- `src/components/game/AnimalTummy.tsx` — Animal with 4 expression states
- `src/animations/tummyFull.ts` — The signature animation sequence
- Remaining animal SVGs: `BiniBird.tsx`, `MochiCat.tsx`, `PippaBunny.tsx`, `EllieElephant.tsx`

### Tummy-full animation sequence (per PRD spec)
1. (0–400ms) Belly scales 1.0→1.08→1.0
2. (400–1200ms) Paw rises, pats belly
3. (600–1000ms) Eyes morph to happy curves
4. (800–1200ms) Soft "mmm" audio
5. (1200–1600ms) Gentle burp + star pops from mouth
6. (1600–2400ms) Animal waves goodbye + personalised praise
7. (2400ms) Transition to star award

### Drag mechanics
- `Gesture.Pan()` with `onUpdate` driving shared values for x/y
- `onEnd`: rect intersection check with animal hit zone → snap to mouth or return to tray
- Undo button: appears after first treat, removes most recent, max 1 step

### 6 Animals with unique personalities
| Animal | Numbers | Treat | Tummy-full detail |
|--------|---------|-------|-------------------|
| Benny Bear | 1–5 | Honey jar | Pats belly both paws, golden star |
| Hattie Hedgehog | 6–10 | Mushroom | Spins 180°, spines wiggle, green star |
| Bini Bird | 11–20 | Berry | Flaps wings 3×, musical note star |
| Mochi Cat | 21–30 | Fish | Curls tail, purr + mmm, pink star |
| Pippa Bunny | 31–40 | Carrot | Foot thumps 2×, ears bounce, lavender star |
| Ellie Elephant | 41–50 | Peanut | Trunk trumpet, teal star from trunk |

**Verify:** Drag/tap treats to animal, watch full tummy animation, earn star.

---

## Phase 6 — Parent Report + Settings + Parent Gate
**Goal:** Parents view progress and adjust settings behind gate.

### Parent gate (`src/components/ui/ParentGate.tsx`)
- Addition question (e.g., "2 + 3 = ?"), regenerated each time
- Lives in `app/(parent)/_layout.tsx` — all child routes require gate pass

### Report screen (`app/(parent)/report.tsx`)
- Per-number mastery: not started / practiced / mastered
- "Needs more practice": up to 3 numbers with most wrong answers
- "Ready to try next": suggests next 2 numbers
- Session history: last 7 days bar chart
- Which mechanic used most

### Settings screen (`app/(parent)/settings.tsx`)
- Sound toggle, ambient toggle (OFF default)
- Voice preference (Mum/Dad/Default — recording deferred to v1.1)
- Floor unlock override (per floor)
- Child name edit
- Reset progress (with confirmation)

**Verify:** Tap settings → solve addition → see report with real progress data.

---

## Phase 7 — Audio Integration
**Goal:** Sound effects, number pronunciation, ambient option.

### AudioManager singleton (`src/audio/AudioManager.ts`)
- Preload SFX on app launch (~10 small files)
- Number audio (1.mp3–50.mp3) loaded lazily per floor
- Sound pooling: 3 `Audio.Sound` instances rotated to avoid creation latency
- `expo-av` with `playsInSilentModeIOS: true`

### Sound map
| Event | Sound |
|-------|-------|
| Tap object | Soft pop |
| Correct answer | Cheerful chime |
| Wrong answer | Gentle "hmm" |
| Star awarded | Sparkle fanfare |
| Bubble pop | Bubbly pop |
| Treat eaten | Munch |
| Tummy full | Celebration |
| Mechanic unlock | Unlock jingle |
| Number spoken | Per-number .mp3 |

### Name personalisation (v1.0)
- Bundled warm neutral voice for generic phrases
- Child's name displayed as text in prompts
- Full parent voice recording deferred to v1.1

**Verify:** All interactions produce sounds, toggle in settings works.

---

## Phase 8 — Polish + Testing
- All 6 animals with 3 expression states each
- Teen numbers (11–19): tens-frame layout with colour-coded 10+N
- Accessibility labels on all interactive elements
- Haptic feedback via `expo-haptics` on tap/correct/star
- Loading states: Zustand hydration splash
- Error boundaries per route
- App icon + splash screen
- Session management: `AppState` listener auto-ends session on background
- Stale session recovery on hydration
- Manual QA on real device

---

## Verification Plan
1. **Unit tests**: Engine functions (unlocks, mastery, distractors, numberSelector) — pure functions, easy to test
2. **Integration**: Zustand store actions → verify state mutations and persistence
3. **Manual QA flow**:
   - Fresh install → onboarding → type name → see treehouse
   - Floor 1 → Count 5 rounds → Feed unlocks → Feed 3 rounds → Bubbles unlocks
   - Play all mechanics freely → earn stars → check parent report
   - Kill app → reopen → progress persisted
   - Settings: toggle sound, ambient, override floor unlock
4. **Device testing**: Test on actual iOS device via Expo Go with target user (3-year-old) for UX validation
