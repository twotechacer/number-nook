# Number Nook – Product Requirements Document
## v1.2 · Final · All decisions resolved

> Counting 1–50 · Feed the Animals · Pop the Bubbles · Personalised Audio
> *For our daughter · 3 years old*

---

## Document info

| Field | Value |
|---|---|
| Product | Number Nook |
| Version | 1.2 – Final. All open questions resolved. Ready to build. |
| Target user | 3-year-old daughter |
| Platform | iOS · React Native + Expo |
| Build cost | ₹0 – free tier stack |
| Distribution | Expo Go → TestFlight → App Store |
| Status | **APPROVED – proceed to development** |

---

## 1. All decisions – locked

All 10 open questions from earlier versions are resolved. No ambiguity remains.

| Decision | Choice made | Notes |
|---|---|---|
| Stage unlock | Auto at 80% mastery + parent manual override | Both directions – parent can re-lock too |
| Treat delivery | Both drag AND tap | Tap essential for 3-year-olds |
| Tummy full sound | **Both** – soft 'mmm' AND a gentle burp + star | mmm during animation, burp at the very end |
| Voice recording | Yes – both parents record. **Deferred to v1.1** | v1.0 ships with warm bundled voice |
| Animals in v1 | **All 6 animals** across all 3 floors | Benny Bear, Hattie Hedgehog, Bini Bird, Mochi Cat, Pippa Bunny, Ellie Elephant |
| Background sound | Offer both – ambient toggle in Settings | Default: OFF. Parent enables if preferred. |
| Bubble speed | **Fixed slow** (~60px/sec) – no adjustment | Keeps the calm, unhurried feel |
| Mechanic unlock order | **Sequential per 10 numbers** – counting first, then feeding, then bubbles | 5 correct counts → feeding unlocks. 3 correct feeds → bubbles unlock |
| Number line visibility | Show all 50 from day one | Unmastered numbers are softer but visible |
| Parent gate method | Simple addition question ('2 + 3 = ?') – regenerates each time | Fun and age-appropriate |

---

## 2. Mechanic unlock system – sequential per floor

**Core principle:** She encounters one mechanic at a time per set of 10 numbers. The sequence is always: **Counting → Feeding → Bubbles.**

### How it works

For every group of 10 numbers (1–10, 11–20, 21–30, 31–40, 41–50), the three mechanics unlock in order.

| Step | Mechanic | Unlocks when... |
|---|---|---|
| 1 | Counting (A) | Always available – first thing she sees |
| 2 | Feed the animal (B) | After **5 correct counting answers** for this floor's numbers |
| 3 | Pop the bubbles (C) | After **3 correct feeding rounds** for this floor's numbers |

> **Example – first session with numbers 1–10:**
> Only "Count it!" is active. She plays 5 counting rounds. "Feed the animals!" glows and appears. She plays 3 feeding rounds. "Pop the bubbles!" appears. Now all three are available and she chooses freely.

### Floor menu – three phases

| Phase | What she sees | Audio cue |
|---|---|---|
| Phase 1 | Count it! (active) · Feed (locked) · Bubbles (locked) | "Let's count with the bears, [name]!" |
| Phase 2 | Count it! + Feed (glows on unlock) · Bubbles (locked) | "The bear is hungry, [name]! Want to feed him?" |
| Phase 3 | All three active – she chooses freely | "Pop the bubbles, [name]! They're floating!" |

> **Parent override:** Settings → Mechanic unlock → select floor → unlock all. Bypasses the progressive system for that floor.

---

## 3. Product vision

Number Nook is a calm, focused counting app for 3-year-olds in a cosy treehouse world. Numbers 1–50 live across three floors. Each group of 10 numbers introduces three mechanics in sequence – giving her one familiar thing at a time before adding variety.

> *The app should feel like a quiet afternoon in a treehouse, not a carnival.*

### The three core mechanics

**Mechanic A – Counting by tapping**
Objects on screen. Tap each one. Counter increments. Pick the correct numeral from three large answer buttons. Always the first mechanic for new numbers.

**Mechanic B – Feed the animal** *(signature mechanic)*
Hungry animal centre screen. Target number shown. Drag or tap treats to deliver exactly N.
At N treats: belly expands → paw pats belly → eyes smile → soft *mmm* plays → gentle burp + star pops from mouth → animal waves goodbye.
Unlocks after 5 correct counting rounds.

**Mechanic C – Pop the bubbles**
N translucent bubbles drift slowly (~60px/sec, never changes). Tap each to pop – soft pop sound, circle-burst particle. Counter updates. When all popped, pick the correct answer.
Unlocks after 3 correct feeding rounds.

---

## 4. Design philosophy – calm and focused

| Rule | In practice |
|---|---|
| One focus per screen | ONE thing to interact with. No background animations while counting or popping. |
| Calm palette | Sage greens, warm creams, soft amber. No neon. |
| Large touch targets | All tappable elements min 56×56px. Bubbles min 52px diameter. |
| No timer pressure | Zero countdown timers. She takes as long as she needs. |
| Celebrations that end | Animations play once (2 seconds max) and stop. No infinite loops. |
| No penalty animations | Wrong = gentle shake once. No buzzer, no red flash. |
| No reading required | All child instructions via audio. Zero text needed. |
| Ambient sound is opt-in | Default silent. Forest ambience in Settings if preferred. |
| Parent gate everywhere | Any settings or exit behind a simple addition question. |

### Colour palette

| Role | Name | Hex |
|---|---|---|
| Primary | Sage green | `#5A9A70` |
| Background | Warm cream | `#F7F4EE` |
| Celebration | Soft amber | `#F0C84A` |
| Bubble | Translucent aqua | `rgba(164,210,225,0.45)` |
| Floor 2 | Straw yellow | `#EFD070` |
| Floor 3 | Soft lavender | `#C8B8E8` |
| Wrong answer | Peachy pink | `#F4A898` |
| Text primary | Dark forest | `#2C3E30` |
| Text secondary | Warm taupe | `#7A6D5A` |

---

## 5. User stories

**Priority scale:** P1 = must-have · P2 = important · P3 = nice to have

### 5.1 Onboarding & home

**US-01** – *As a parent, I want to set up the app in under 2 minutes on first launch*
- Single first-launch prompt: child's name (optional, skippable)
- If skipped, all audio uses 'you'. If entered, uses her name everywhere.
- Total time to first playable state: under 60 seconds
- **Priority: P1 · Effort: S**

**US-02** – *As a child, I want to see the treehouse floors and understand which I can play*
- Three floor cards, Floor 1 always open
- Floor 2 locked until Floor 1 is 80% mastered → lock overlay, still visible
- Tapping a locked floor plays warm encouragement audio → no error
- Each card shows current mechanic phase (e.g. 'Counting + Feeding unlocked')
- **Priority: P1 · Effort: M**

### 5.2 Mechanic unlock journey

**US-03** – *As a child, I want to discover new mechanics one by one*
- Floor 1 opens with only "Count it!" active
- After 5 correct counting answers: "Feed the animals!" appears with amber glow
- After 3 correct feeding rounds: "Pop the bubbles!" appears with bubble-pop animation
- Once unlocked, all three stay available – she chooses freely
- **Priority: P1 · Effort: M**

### 5.3 Counting game (Mechanic A)

**US-04** – *As a child, I want to count objects by tapping each one*
- Tappable circles min 56px, checkmark overlay on tapped objects
- Counter (64px bold) increments on each tap
- Three answer buttons (80×80px) – correct ±1 or ±2
- **Priority: P1 · Effort: M**

**US-05** – *As a child, I want to hear my name when I get it right*
- Numeral pulses (scale 1.0 → 1.15 → 1.0)
- Personalised audio: *"Yes! That's 5, [name]!"*
- Star floats up – single pass, not looping
- Auto-advances after 1.5s
- **Priority: P1 · Effort: S**

**US-06** – *As a child, I want a gentle try-again when I get it wrong*
- Wrong button shakes (2 oscillations, 300ms)
- Warm 'hmm' sound – never harsh
- Peachy pink (#F4A898) for 500ms, then back to normal
- No score deducted. No 'wrong' text.
- **Priority: P1 · Effort: S**

### 5.4 Feed the animal (Mechanic B)

**US-07** – *As a child, I want to drag treats to a hungry animal and watch it react*
- Animal centred (120×120px), hungry expression
- Target number large above animal with treat icon
- Treats: draggable AND tappable (tap auto-delivers)
- Progress text: '3 given / 5 needed'
- **Priority: P1 · Effort: L**

**US-08** – *As a child, I want to see the full tummy-full animation – mmm AND burp*
1. (0–400ms) Belly scales 1.0 → 1.08 → 1.0
2. (400–1200ms) Paw rises and pats belly in slow arc
3. (600–1000ms) Eyes morph from circles to happy curves
4. (800–1200ms) Soft *mmm* audio plays
5. (1200–1600ms) Gentle burp sound + star pops from mouth and floats up
6. (1600–2400ms) Animal waves goodbye with personalised praise audio
7. (2400ms) Transitions to star award screen

> The mmm and burp are two distinct sounds – mmm is warm/contented, burp is gentle/funny with a star.

- **Priority: P1 · Effort: L**

**US-09** – *As a child, I want to undo a treat if I gave too many by mistake*
- Undo button (treat icon + back arrow) – appears after first treat given
- Removes most recent treat, decrements counter
- Max 1 undo step
- **Priority: P2 · Effort: S**

### 5.5 Pop the bubbles (Mechanic C)

**US-10** – *As a child, I want to tap floating bubbles to pop them and count how many*
- N bubbles drift slowly (fixed ~60px/sec – never changes)
- Translucent aqua, 52–72px diameter, bounce off edges – never disappear
- Tap: scale 1.0 → 0 in 200ms ease-in + soft pop sound + white particle burst (300ms)
- Counter updates with each pop
- When all popped: counter pulses once, answer screen appears
- **Priority: P1 · Effort: M**

**US-11** – *As a child, I want to hear my name as I pop bubbles*
- First bubble: *"Pop it, [name]! Keep going!"*
- At 50% popped: *"Halfway there, [name]! Great popping!"*
- Last 2 bubbles: subtle amber glow ring (helpful, not pressuring)
- All popped: *"You popped them all, [name]!"*
- **Priority: P1 · Effort: S**

### 5.6 All 6 animals

| Animal | Floor | Numbers | Treat | Tummy-full personality | Bubble colour |
|---|---|---|---|---|---|
| Benny Bear | 1 | 1–5 | Honey jar | Pats belly with BOTH paws. Eyes become big crescents. Burp has golden star. | Golden sparkle |
| Hattie Hedgehog | 1 | 6–10 | Mushroom | Spins 180°. Spines wiggle. Tiny shy burp with green star. | Forest green |
| Bini Blue Bird | 2 | 11–20 | Berry | Flaps wings 3x. Head tilts. Burp star becomes a tiny musical note. | Sky blue |
| Mochi Cat | 2 | 21–30 | Fish | Curls tail over nose. Closes eyes. Soft purr alongside mmm. Pink star burp. | Soft pink |
| Pippa Bunny | 3 | 31–40 | Carrot | Foot thumps twice. Ears bounce. Hop. Lavender star burp. | Lavender |
| Ellie Elephant | 3 | 41–50 | Peanut | Raises trunk + tiny trumpet sound. Teal star sprayed from trunk. | Aqua teal |

### 5.7 Teen numbers (11–19)

**US-12** – *As a child, I want to understand 13 means ten and three more*
- Tens-frame layout: row of 10 (blue) + remaining units (amber)
- Colour-coded consistently across all teen numbers
- Audio: *"Ten… and three more makes… thirteen!"*
- **Priority: P1 · Effort: M**

### 5.8 Progress and parent report

**US-13** – *As a parent, I want to see which numbers my daughter has mastered*
- Mastery: correct 3+ times across any combination of the three mechanics
- Shows: not started / practiced / mastered per number
- 'Needs more practice': up to 3 numbers with most wrong answers
- 'Ready to try next': suggests next 2 numbers
- Shows which mechanic she uses most
- **Priority: P1 · Effort: M**

### 5.9 Audio settings

**US-14** – *As a parent, I want to control ambient sound and voice preference*
- Ambient sound: OFF (default) / ON (soft forest sounds at 20% max volume)
- Fades in slowly (3 seconds) when enabled – no sudden noise
- Voice: choose Mum / Dad / Default bundled – parent recording in v1.1
- All audio mutable with a single toggle
- **Priority: P1 · Effort: S**

---

## 6. Screen specifications

### 6.1 Home – treehouse
- Three floor cards stacked, 12px gap
- Each card: colour, animal emoji (56px), floor name, number range, phase indicator, progress bar
- States: first launch / returning / unlock animation (3s amber glow on newly unlocked floor)

### 6.2 Floor menu – three phases
- Phase 1: Count it! (active) · Feed (locked) · Bubbles (locked)
- Phase 2: Count it! + Feed (glowed on first unlock) · Bubbles (locked)
- Phase 3: All three active, equal weight – child chooses freely
- Back arrow → parent gate (no accidental exits)

### 6.3 Counting game
- Organic object cluster (not a grid) · Min 56×56px per object
- Counter: 64px bold, live update
- Three 80×80px answer buttons · No background animations while counting

### 6.4 Feed the animal
- Animal 120×120px centred · 4 expression states: waiting, anticipating, full, waving
- Treats: 4–6 icons, 48px, drag AND tap both work
- Progress: 'X given / Y needed' + filling bar
- Tummy full: mmm (400–1200ms) → burp + star (1200–1600ms) → wave (1600–2400ms)

### 6.5 Pop the bubbles
- Translucent aqua bubbles, 52–72px, fixed slow drift ~60px/sec, bounce off edges
- Pop: scale 1.0 → 0 in 200ms, white particle burst in 300ms, soft pop sound
- Last 2: subtle amber glow ring
- Floor tint: each floor has its own bubble colour (see animal table)

### 6.6 Star award screen
- Warm amber background – only screen departing from cream
- Pulsing star · numeral just practiced · personalised audio
- Auto-advances after 1.5s · tapping anywhere advances immediately

---

## 7. Full personalised audio script

> **Note: All parent voice recording is deferred to v1.1.** v1.0 ships with a warm bundled neutral voice. The full script below is ready for recording when that phase begins.

All phrases use `[name]` as a placeholder. ~50 clips total. Estimated recording time per parent: 45–60 minutes. Both parents record – child can switch in Settings.

> *Recording guidance: Speak slowly and warmly – she will hear these hundreds of times. Use her name naturally, not robotically. Record in a quiet room, one phrase per clip.*

### 7.1 Number names
| Trigger | Phrase |
|---|---|
| Numbers 1–10 | One, Two, Three … Ten *(10 individual clips)* |
| Numbers 11–20 | Eleven, Twelve … Twenty *(10 clips)* |
| Numbers 21–50 | Twenty-one … Fifty *(30 clips)* |
| Number confirmed (1–10) | *"That's 3, [name]!"* *(record for each of 1–10)* |

### 7.2 Correct answer – counting and bubbles
| Phrase | Notes |
|---|---|
| *"Well done, [name]!"* | Rotate all 7 randomly |
| *"Yes! That's right, [name]!"* | |
| *"[name]! You did it!"* | |
| *"Brilliant counting, [name]!"* | |
| *"I'm so proud of you, [name]!"* | |
| *"You counted to 5, [name]! Amazing!"* | Record for numbers 1–10 |
| *"A star for you, [name]!"* | |

### 7.3 Wrong answer – warm and gentle
| Phrase | Notes |
|---|---|
| *"Hmm, let's try again, [name]!"* | Never harsh. Always warm. |
| *"So close, [name]! Have another go!"* | |
| *"You can do it, [name]!"* | |
| *"Let's count together, [name]!"* | Plays before objects re-highlight |

### 7.4 Feed the animal
| Trigger | Phrase |
|---|---|
| Instruction | *"Give the bear 5 honey jars, [name]!"* |
| First treat | *"That's one! Keep going, [name]!"* |
| Halfway | *"Halfway there, [name]! Almost there!"* |
| One more left | *"One more, [name]!"* |
| Tummy full (mmm phase) | *"Tummy full! Well done, [name]!"* |
| Tummy full (burp phase) | *"Hehe! [name]!"* *(short, playful)* |
| Still hungry | *"Bear is still hungry, [name]! A few more?"* |

### 7.5 Pop the bubbles
| Trigger | Phrase |
|---|---|
| Instruction | *"Pop all the bubbles, [name]!"* |
| First bubble | *"Pop it, [name]! Keep going!"* |
| Halfway (50%) | *"Halfway there, [name]! Great popping!"* |
| Last 2 | *"Nearly there, [name]! Just a few more!"* |
| All popped | *"You popped them all, [name]!"* |

### 7.6 Mechanic unlocks
| Trigger | Phrase |
|---|---|
| Feeding unlocks | *"The bear is hungry, [name]! Want to feed him?"* |
| Bubbles unlock | *"Pop the bubbles, [name]! They're floating!"* |

### 7.7 Session transitions
| Trigger | Phrase |
|---|---|
| App open | *"Hello, [name]! Let's count today!"* |
| Returning | *"[name]'s back! The animals missed you!"* |
| Floor 2 unlock | *"Wow, [name]! You unlocked floor 2! The birds are waiting!"* |
| Floor 3 unlock | *"Floor 3, [name]! The bunnies are so excited!"* |
| 10 stars | *"[name] has 10 stars! You're a star counter!"* |
| 25 stars | *"25 stars, [name]! The treehouse is glowing!"* |
| 50 stars | *"50 stars! [name], you're a counting champion!"* |
| Session end | *"Great counting today, [name]! See you next time!"* |

### 7.8 Special parent phrases *(v1.1 – record together)*
| Trigger | Phrase |
|---|---|
| Mum – love | *"I love you, [name]! Keep counting!"* |
| Dad – proud | *"You're amazing, [name]! Keep going!"* |
| Both together | *"We're so proud of you, [name]!"* |

---

## 8. Data model

All data stored locally on device. No cloud in v1. Supabase sync optional in v1.1.

| Key | Type | Description |
|---|---|---|
| `child_name` | string | Optional. Used in audio personalisation. |
| `total_stars` | number | Running total across all sessions |
| `floor_unlocks` | object | `{ floor2: false, floor3: false }` |
| `mechanic_unlocks` | object | `{ '1_10': { feed: false, bubbles: false }, '11_20': { feed: false, bubbles: false }, … }` |
| `number_mastery` | object | `{ '1': { correct: 5, wrong: 2, lastPlayed: timestamp }, … }` for all 50 numbers. Mastery at correct >= 3. |
| `session_log` | array | Last 30 sessions: `{ date, numbersPlayed[], mechanicsUsed[], starsEarned, durationSecs }` |
| `voice_preference` | string | `'mum' \| 'dad' \| 'default'` |
| `voice_recordings` | object | `{ 'well_done': 'file://…', … }` – added in v1.1 |
| `settings` | object | `{ soundEnabled: true, ambientEnabled: false, autoFloorUnlock: true, parentPin: null }` |

---

## 9. Security and privacy

| Concern | How it is handled |
|---|---|
| No child account | Child never logs in. All data under anonymous local session. |
| No internet | All assets bundled. Core gameplay 100% offline. |
| No analytics | Zero third-party SDKs. No Firebase, Mixpanel, or similar. |
| No ads | No advertising SDKs of any kind. |
| Parent gate | Addition question regenerated each time. All settings and exit behind it. |
| Voice recordings (v1.1) | expo-file-system local only. Never uploaded. Deleted on full reset. |
| Supabase sync (v1.1) | Only mastery data. No child names or audio. Under parent's auth. |
| App Store | Submit with 4+ age rating, zero third-party data collection declarations. |

---

## 10. Technical architecture

| Layer | Technology | Notes |
|---|---|---|
| App framework | Expo (React Native) + TypeScript | Cross-platform, free tier |
| Navigation | Expo Router (file-based) | Clean screen structure |
| Animations | react-native-reanimated v3 | Tummy full, bubble pop, star float, eye morph |
| Bubble physics | Custom JS vectors – no library | Simple linear drift + edge bounce |
| Gesture handling | react-native-gesture-handler | Treat drag + tap delivery |
| Audio | expo-av | Bundled .mp3 + parent .m4a recording (v1.1) |
| SVG characters | react-native-svg | Scalable animals, path morph for eye/tail states |
| Local storage | expo-secure-store + AsyncStorage | All mastery data, mechanic unlock states, settings |
| CI / build | GitHub Actions + EAS Build (free – 30 builds/month) | Auto build on merge to main |
| Dev testing | Expo Go (QR scan) | Both parent phones, no Apple account needed |
| Beta testing | TestFlight | Requires $99 Apple Developer account |

---

## 11. Content plan – all 6 animals

| Animal | Floor | Numbers | Treat | Burp detail | Bubble colour |
|---|---|---|---|---|---|
| Benny Bear | 1 | 1–5 | Honey jar | Golden star – pats belly with both paws after burp | Golden sparkle |
| Hattie Hedgehog | 1 | 6–10 | Mushroom | Tiny green star – shy little burp, spines wiggle | Forest green |
| Bini Blue Bird | 2 | 11–20 | Berry | Blue star becomes a tiny musical note | Sky blue |
| Mochi Cat | 2 | 21–30 | Fish | Pink star – soft purr alongside mmm | Soft pink |
| Pippa Bunny | 3 | 31–40 | Carrot | Lavender star – foot thumps twice after burp | Lavender |
| Ellie Elephant | 3 | 41–50 | Peanut | Teal star sprayed from trunk – tiny trumpet alongside burp | Aqua teal |

---

## 12. MVP scope – v1.0

### In scope
- All 3 floors, all 6 animals, all 50 numbers
- All three mechanics: counting, feeding, bubbles
- Sequential mechanic unlock system per 10-number group
- Full tummy-full animation – mmm + burp + star for all 6 animals
- Bubble pop with per-floor colour theme
- Ambient sound toggle (OFF by default)
- Star collection + parent report
- Floor unlock system (80% mastery auto + parent override)
- Bundled neutral voice audio *(personalised recording in v1.1)*
- Parent gate with addition question
- Fully offline – all assets bundled
- Expo Go testing on both parent phones

### Out of scope – ships in v1.1
- Parent voice recording studio (mum and dad record their own phrases)
- Number line explorer
- Skip counting bonus game (frog hopscotch)
- Supabase sync for cross-device parent report
- App Store submission (after v1.1 stable)

### Recommended build order
1. **Home screen** – 3 floor cards, lock states, phase indicators
2. **Counting game** – Mechanic A with correct/wrong states and audio
3. **Mechanic unlock system** – the progression logic that gates feeding and bubbles
4. **Pop the bubbles** – Mechanic C, simpler animation, good practice run
5. **Feed the animal** – Mechanic B last, most complex (all 6 animals + mmm + burp)
6. **Parent report**
7. **Audio integration** – name personalisation added last once all screens work
