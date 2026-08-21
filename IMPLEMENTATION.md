# LINK & BUILD — Implementation Plan & Architecture

*How to build the whole thing, efficiently, as one coherent system — not a
pile of features.*

---

## 0. Guiding Principles

1. **One source of truth.** All game data lives in a single, serializable
   state object. All content lives in a single, data-driven `DATA` registry.
   No logic scattered in HTML, no magic numbers in the DOM.
2. **Data-driven, not code-driven.** Every generator, upgrade, NPC, pod,
   challenge, achievement, and scare post is a *row in a table*, not a
   function. Adding content = adding a row. This is how you get 10x content
   without 10x code.
3. **The engine is dumb; the data is smart.** The simulation loop doesn't know
   what a "pod" or a "sponsor" is. It iterates over registries and applies
   generic rules. The satire lives in the *text*, not the *logic*.
4. **Performance is a feature.** The game must run at 60fps with hundreds of
   posts, thousands of notifications, and a live feed. Every hot path is
   cached, batched, or virtualized.
5. **Ship in vertical slices.** Each phase produces a *playable* game, not a
   half-built system. The narrative, mechanics, and juice land together, in
   order, so the game is always coherent.

---

## 1. Current State Assessment

The existing codebase is a strong prototype. What's already good:

- **Diegetic OS shell** — desktop, browser, taskbar, app switching. This is
  the game's identity and must be preserved.
- **Data-driven content** — `DATA.ARCHETYPES`, `DATA.GENERATORS`,
  `DATA.UPGRADES`, `DATA.WORKERS`, `DATA.PODS`, `DATA.BOT_CONFIGS`,
  `DATA.DARK_LISTINGS` already exist as tables.
- **Performance patterns** — `IntersectionObserver` for visible-post tracking,
  in-place feed updates, IPS caching, debounced renders. These are correct and
  should be extended, not replaced.
- **Juice** — WebAudio synth, particles, confetti, milestones, toasts.

What's missing or broken (the gaps to close):

| Gap | Severity | Why it matters |
|---|---|---|
| No persistence (`State.save()` is a no-op) | **Critical** | The idle gut-punch requires it. The genre requires it. |
| No prestige / meta-progression | **Critical** | The retention engine. Without it the game ends in 2 hours. |
| No number scale / notation | High | "Number go up" needs escalation to feel infinite. |
| Thin content (5 generators, 6 upgrades) | High | Needs ~10x, gated behind prestige. |
| No challenges / achievements / secrets | High | The replayability and discovery layers. |
| No narrator system | High | The voice is the soul; it's currently absent. |
| No scare-post system | High | The horror layer. |
| No sponsor/money loop | High | The emotional engine (the only real number). |
| No balance math | High | The unglamorous 80%. |
| Global mutable state, no module boundaries | Medium | Works at this size; will not scale to 10x content. |

---

## 2. Target Architecture

### 2.1 The layering

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION  (DOM, CSS, canvas, WebAudio)      │
│  UI · Juice · OS · Feed · Modals · Bell          │
├─────────────────────────────────────────────────┤
│  SYSTEMS       (gameplay logic, one per concern) │
│  Narrator · Prestige · Challenges · Achievements │
│  Sponsors · ScarePosts · Secrets · Persistence  │
├─────────────────────────────────────────────────┤
│  ENGINE        (the dumb simulation loop)        │
│  tick · production · costs · notation · balance │
├─────────────────────────────────────────────────┤
│  STATE         (single serializable object)      │
│  State.data · State.save · State.load · migrate  │
├─────────────────────────────────────────────────┤
│  DATA          (content registries, pure data)   │
│  GENERATORS · UPGRADES · NPCS · PODS · ...       │
└─────────────────────────────────────────────────┘
```

The rule: **systems read DATA, mutate STATE, and notify PRESENTATION.**
Presentation never mutates state directly. Systems never touch the DOM. The
engine never knows about narrative.

### 2.2 The state object (single source of truth)

The current `State.data` is already close. It needs to grow, but *carefully* —
every field must be serializable (JSON-safe) so persistence is trivial.

```js
State.data = {
  // identity
  name, headline, avatar, persona,        // persona = current prestige identity
  // core numbers (the "number go up" layer)
  impressions, likes, followers, connections, influence,
  // the number that goes DOWN
  authenticity,
  // the only REAL number
  bank: { balance, transactions },
  // meta-progression (permanent, survives prestige)
  brandEquity, legacy, marketCap,          // one per prestige layer
  prestige: { layer, resets, totalEquity },
  // owned things
  generators, upgrades, workers, pods, botConfigs, darkListings,
  // narrative state
  npcState: { recruiter: 'promised', sponsor: 'active', ... },
  narrator: { register, revealed, scareStage },
  reveal: { progress, triggered },
  // content flags
  achievements, challenges, secrets,
  // runtime
  posts, notifications, dms, analytics, os,
  // meta
  createdAt, lastSeen, version,
};
```

### 2.3 The DATA registry (content as data)

Every content type is a table with a uniform shape. The engine iterates
generically; the *text* carries the satire.

```js
DATA.GENERATORS = [
  { id, name, tier, icon, desc, flavor,
    cost: { base, growth },        // cost curve, not a single number
    prod: { base, perUnit },       // production curve
    auth: -0.1,                    // authenticity drain
    unlock: { layer, condition },  // prestige gating
  },
];
```

The key change from the current code: **costs and production are *curves*,
not constants.** This is what makes balance tunable and prestige replayable.

### 2.4 The engine (dumb, fast, generic)

The simulation loop stays a single `tick(dt)` that:

1. Computes total production from all registries (cached, invalidated on
   change).
2. Applies production to state.
3. Fires *events* (not DOM writes) for things that happened: `post:liked`,
   `milestone:reached`, `npc:dm`, `reveal:progress`.
4. Emits a `state:changed` signal.

Systems *subscribe* to events. Presentation *subscribes* to `state:changed`.
This decouples everything and makes the narrator, scare posts, and
achievements trivial to add — they're just event listeners.

### 2.5 The event bus (the nervous system)

A tiny pub/sub (20 lines) is the single most important architectural addition.
It replaces the current pattern of systems calling `UI.renderX()` directly.

```js
Bus.on('impressions:milestone', Narrator.onMilestone);
Bus.on('post:published', ScarePosts.maybeInject);
Bus.on('npc:dm', Achievements.check);
Bus.emit('state:changed');
```

Why this matters: right now, adding a new system means editing every other
system. With a bus, adding the narrator means *only* writing the narrator. This
is how you scale to 10x content without 10x coupling.

---

## 3. The Build Plan (phases, in order)

Each phase is a vertical slice: it ships a playable, coherent game. Phases are
ordered by dependency and risk, not by narrative order.

### Phase 0 — Foundation (the boring, critical stuff)

**Goal:** make the game *survive* and *scale* before adding features.

1. **Restore persistence.** Implement `State.save()` / `State.load()` with
   `localStorage`, autosave (every 5s + on every meaningful action), offline
   progress simulation, and a versioned migration system (`version` field +
   `migrate()` function). This is non-negotiable and must come first.
2. **Add the event bus.** `Bus.on/off/emit`. Refactor the existing direct
   `UI.renderX()` calls into event emissions. This is mechanical but unlocks
   everything after it.
3. **Add number notation.** `Engine.fmt()` already exists; extend it to
   scientific/engineering notation with a toggle. Every number on screen goes
   through one formatter.
4. **Add cost/production curves.** Replace the hardcoded `cost`/`prod` fields
   with `{ base, growth }` curves and a generic `costOf(id, owned)` /
   `prodOf(id, owned)` function. This is the balance foundation.

**Exit criteria:** the game saves, loads, simulates offline progress, and
survives a refresh. Numbers format correctly at any scale.

### Phase 1 — The Narrator (the soul)

**Goal:** the voice over everything, delivered diegetically.

1. **Narrator system** — a `Narrator` object with three registers (coach,
   product manager, auditor) and a line table keyed by event. It subscribes to
   the bus and fires lines on milestones, purchases, unlocks, and reveals.
2. **Delivery channels** — narrator lines arrive as DMs, notifications, and
   bot-log entries. Never a floating text box. The narrator *is* the
   notification bell.
3. **Register transitions** — the register shifts at thresholds (first
   delegation → product manager; first shadowban → auditor). The shift is
   itself a narrated event.

**Exit criteria:** every mechanic has a narrator line. The voice is present
from the first post to the reveal, and it never lies about what it is.

### Phase 2 — The Money Loop (the emotional engine)

**Goal:** the sponsor system and the bank as the only real number.

1. **Sponsor system** — a `DATA.SPONSORS` table (GrindFuel, MindsetWater,
   etc.), each with a clout threshold, a payout, and a demand (more
   engagement). Sponsors convert clout → cash on a schedule.
2. **Bank integration** — the bank already exists; wire sponsor payouts into
   it. The bank balance becomes the *only* number that isn't inflated by the
   scale slider.
3. **The loop** — cash buys clout (pods, bots, marketplace), clout earns cash
   (sponsors). The player is always converting one into the other, and the
   narrator frames it as "scaling your personal brand."

**Exit criteria:** the player earns real money from fake clout, spends it on
more fake clout, and the bank balance is the quiet, sad counterpoint to the
booming impression count.

### Phase 3 — Prestige (the retention engine)

**Goal:** the reset, brand equity as the permanent currency.

1. **Reset mechanic** — a "Delete Account" action that resets the run and
   awards Brand Equity based on total impressions earned. The earlier you
   reset, the less you earn, but the faster you climb again.
2. **Brand Equity tree** — a permanent upgrade tree bought with Brand Equity.
   Each node is a permanent multiplier or QoL unlock.
3. **Persona system** — each reset generates a new persona (name, headline,
   avatar). The dead-internet reveal deepens: you're reincarnating into the
   same empty room.
4. **Layer scaffolding** — build the *structure* for four prestige layers
   (Persona → Brand → Platform → Algorithm), even if only layer 1 is
   populated in this phase.

**Exit criteria:** the player can reset and climb again faster with permanent
upgrades. The game is now replayable, which is the whole point.

### Phase 4 — Content Depth (the 10x)

**Goal:** fill the registries to world-class density.

1. **Generators** — expand from 5 to ~20, gated across prestige layers.
2. **Upgrades** — expand from 6 to ~60, with diminishing returns and prestige
   gating.
3. **Pods, workers, bot configs, dark listings** — expand each to ~10+.
4. **Sponsors** — a full ladder of increasingly hollow brands.
5. **Scare posts** — a `DATA.SCARE_POSTS` table with three stages (glitch,
   address, confession), injected into the feed at reveal-progress thresholds.

**Exit criteria:** the game has enough content that a player never sees the
same upgrade twice in a run, and the prestige system makes it all replayable.

### Phase 5 — Challenges & Achievements (the replayability layer)

**Goal:** rule-changing modifiers and permanent records.

Achievements are re-skinned as LinkedIn **Endorsements**: a permanent profile
record of every time the player chose to debase themselves. The double meaning
is the joke — an endorsement (a stranger vouching for a skill you don't have)
and an achievement (a badge for performing for an empty room) are the same
object, and the game calls them both.

1. **Challenges** — a `DATA.CHALLENGES` table. Each challenge changes a rule
   (no emojis, no marketplace, survive a shadowban) and pays a permanent
   reward. Challenges are *selected* at the start of a run, roguelite-style,
   from the Endorsements modal. Completed challenges survive prestige (their
   rewards are permanent), and their effects are summed in `Challenges.reward()`.
2. **Achievements / Endorsements** — a `DATA.ACHIEVEMENTS` table, checked on
   the event bus in `js/endorsements.js`. Achievements are the vehicle for the
   scare posts and the reveal (secret achievements). Skills fill in as a
   `DATA.SKILLS` table endorsed by interchangeable `DATA.ENDORSERS` (all bots).
3. **The one real person** — a secret achievement (`one-real-person`) and a
   one-time feed event, fired by `Endorsements.maybeOneRealPerson()` once the
   player has scrolled deep enough to have been trained to scroll past it.

**Exit criteria:** the player has reasons to replay beyond "number go up" —
challenges to attempt, endorsements to hunt, secrets to find.

### Phase 6 — The Reveal & Endgame (the payoff)

**Goal:** the dead-internet reveal and the post-reveal game.

1. **Reveal progress** — a hidden counter that ticks up as the player
   automates. At thresholds, scare posts escalate (glitch → address →
   confession).
2. **The reveal** — a drip, not a cutscene. The narrator's thesis lands. The
   feed is revealed as all bots.
3. **Post-reveal content** — a new prestige layer ("Become the Algorithm"),
   a new number ("Retention"), and the inverted satire (you farm *other*
   players now).
4. **The ending that isn't** — the game never stops. The player keeps
   posting. The rent is still due.

**Exit criteria:** the full arc is playable from first post to the empty
room, and the player can keep playing after the reveal.

**Implemented.** The reveal is a drip, not a cutscene. A hidden `Reveal.progress()`
counter climbs with automation (generators + workers + bot) and lifetime
impressions. Scare posts (`DATA.SCARE_POSTS`, stages 1–3) inject into the feed
as ordinary posts, escalating at 0.3 (glitch) → 0.55 (address) → 0.8
(confession) → 1.0 (reveal). The reveal fires a narrator DM, makes every
active sponsor confess, and flips the game into its post-reveal phase:
**Retention** accrues (3× if you "Become the Algorithm"), and two secret
achievements (`dead-internet`, `rent-due`) unlock. The reveal state survives
prestige — you can't un-know that the room was empty. Lives in `js/reveal.js`.

### Phase 7 — Balance & Polish (the 80%)

**Goal:** make it *feel* right.

1. **Balance pass** — tune every cost/production curve so the player is
   always "one purchase away" from a breakthrough. This is iterative and
   requires playtesting.
2. **QoL** — buy max/10x/100x, auto-buy toggles, hotkeys, notification
   batching, offline caps.
3. **Performance audit** — profile the tick loop, the feed render, and the
   notification system. Ensure 60fps at endgame scale.
4. **Juice pass** — the rarity reveal, the idle gut-punch, the shadowban
   dread, the scare-post chill. Every emotional beat gets its feedback.

**Exit criteria:** the game is balanced, fast, and satisfying. A player can
lose an hour without noticing, and a week without quitting.

---

## 4. Performance Architecture

The game must run at 60fps with hundreds of posts and thousands of
notifications. The existing code already has the right instincts; here's the
full strategy.

### 4.1 The tick loop

- **One `requestAnimationFrame` loop**, not `setInterval`. The current
  `Engine.tick` at 100ms is fine for *simulation*, but the *render* should be
  rAF-driven and decoupled from simulation.
- **Simulation at fixed timestep** (e.g., 100ms), **render at rAF**. The
  simulation is cheap (math); the render is expensive (DOM). Decouple them.
- **Cache everything derived.** `totalIps()` is already cached. Extend this to
  every derived value: total production, next unlock, achievement progress.
  Invalidate on change, not on every frame.

### 4.2 The feed

- **Virtualization.** The current in-place update + `IntersectionObserver` is
  good, but at 1000+ posts it needs to go further: only render the ~20 posts
  near the viewport, recycle DOM nodes, and keep the rest as data.
- **Batched updates.** The current `renderFeedDebounced()` is correct. Extend
  it: all feed mutations in a frame are coalesced into one DOM write.
- **No `innerHTML` rebuilds on the hot path.** The current code already does
  in-place updates. Preserve this. `innerHTML` is for cold paths (modals,
  app switches).

### 4.3 The numbers

- **One formatter, memoized.** `Engine.fmt()` should memoize by value so
  repeated formatting of the same number is free.
- **Tick-only updates.** Numbers that change every frame (impressions) update
  every frame. Numbers that change rarely (followers) update on change. The
  current `popIfChanged` pattern is correct; formalize it.

### 4.4 Memory

- **Bounded collections.** Posts, notifications, DMs, analytics history — all
  capped (the current code already caps some). Formalize caps so a week-long
  session doesn't leak.
- **No orphaned DOM.** Every particle, confetti, and milestone removes itself.
  The current code does this; audit for leaks.

---

## 5. Data & Content Pipeline

The 10x content goal requires a *pipeline*, not hand-writing.

### 5.1 Content as data files

Move content out of `data.js` and into structured data (JSON or a
spreadsheet-exported format). This lets non-programmers (writers) add content
without touching code.

### 5.2 The content schema

Every content type shares a schema so the engine can iterate generically:

```js
{
  id, name, icon, desc, flavor,     // presentation
  cost: { base, growth },           // balance
  prod: { base, perUnit },          // balance
  auth: -0.1,                       // authenticity
  unlock: { layer, condition },    // gating
  text: { ... },                    // the satire (narrator lines, flavor)
}
```

### 5.3 The writing pipeline

The satire is the product. The writing needs the same rigor as the code:

- **A content bible** — the tone, the voice, the three narrator registers,
  the scare-post stages. (Already drafted in `DESIGN.md`.)
- **A line budget** — how many narrator lines per event, how many scare posts
  per stage, how many flavor strings per generator. Enough to avoid
  repetition, not so many it's unmaintainable.
- **A review pass** — every line checked against the tone guardrails: never
  mean to the player, never lies about what the narrator is, always complicit.

---

## 6. Testing Strategy

An incremental game is a *simulation*. It needs tests, especially for the
balance math and the persistence.

### 6.1 What to test

- **Balance invariants** — cost curves are always steeper than production
  curves; no generator is ever strictly dominated; prestige always pays off
  eventually.
- **Persistence** — save/load round-trips are lossless; migration from old
  versions works; offline progress is correct.
- **State integrity** — no NaN, no negative counts, no orphaned references.
- **Event correctness** — the narrator fires on the right events; achievements
  unlock at the right thresholds; the reveal triggers at the right progress.

### 6.2 How to test

- **Unit tests** for the pure functions (cost curves, notation, balance).
- **Property tests** for the invariants (e.g., "for all generators, cost
  grows faster than production").
- **Simulation tests** — run the engine headless for N ticks and assert the
  numbers behave (no NaN, monotonic where expected, prestige works).
- **Manual playtesting** for the *feel* — the balance, the juice, the
  emotional beats. This can't be automated.

---

## 7. The Delivery Order (summary)

| Phase | What | Why first |
|---|---|---|
| 0 | Persistence, event bus, notation, curves | Everything depends on it |
| 1 | Narrator | The soul; cheap to add once the bus exists |
| 2 | Money loop | The emotional engine |
| 3 | Prestige | The retention engine |
| 4 | Content depth | The 10x |
| 5 | Challenges & achievements | Replayability |
| 6 | Reveal & endgame | The payoff |
| 7 | Balance & polish | The 80% |

The order is deliberate: **foundation → soul → emotion → retention → depth →
replayability → payoff → polish.** Each phase makes the game *more* of what it
is, and each phase is shippable on its own.

---

## 8. The One Rule That Governs Everything

**The number always goes up. The void never fills.**

Every architectural decision — the event bus, the data-driven content, the
prestige layers, the persistence, the balance curves — exists to serve that
one sentence. The game is a machine for making a number go up, and the satire
is that the number going up is the only thing that ever felt like being loved.

Build the machine. Let the machine tell the joke.

---

*The satire is the game. The game is the satire. The room was always empty —
and the rent was always due.*
