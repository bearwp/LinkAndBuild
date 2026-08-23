/* ============================================================
   LINK & BUILD — The Guide (onboarding + objectives)
   One always-visible "next step" that walks the player through
   the arc one beat at a time. The game is quiet by default; the
   guide is the thing that tells you what to reach for next, so a
   quiet moment feels like progress, not dead air.

   Steps are data rows. Each has an id, a title, a hint (what to
   actually do), a `done` predicate against state, and an optional
   progress number so the bar can fill as you get closer.
   ============================================================ */

const GUIDE_STEPS = [
  {
    id: 'first-post',
    title: 'Publish your first post',
    hint: 'Open the composer and say something. Anything.',
    done: s => s.analytics.postsPublished >= 1,
    progress: s => Math.min(1, s.analytics.postsPublished),
  },
  {
    id: 'first-follow',
    title: 'Follow someone',
    hint: 'Now that you\'re posting, follow people from "People you may know" to fill your feed.',
    done: s => (s.followedAuthors || []).length >= 1,
    progress: s => Math.min(1, (s.followedAuthors || []).length),
  },
  {
    id: 'first-absorb',
    title: 'Absorb your first tags',
    hint: 'Scroll the feed. Each post you scroll drops its tags into your bucket.',
    done: s => (s.bucket && s.bucket.total) >= 1,
    progress: s => Math.min(1, (s.bucket && s.bucket.total) || 0),
  },
  {
    id: 'first-catch',
    title: 'Write a post from your bucket',
    hint: 'Open "Catch topics", grab tags from your bucket, and post.',
    done: s => (s.bucket && s.bucket.spent) >= 2,
    progress: s => Math.min(1, ((s.bucket && s.bucket.spent) || 0) / 2),
  },
  {
    id: 'first-rapport',
    title: 'Get someone to follow you back',
    hint: 'Like and comment on a post. At 5 rapport they follow you back.',
    done: s => Object.values(s.rapport || {}).some(r => r.followed),
    progress: s => {
      const vals = Object.values(s.rapport || {});
      if (!vals.length) return 0;
      return Math.min(1, Math.max.apply(null, vals.map(r => r.rapport / 5)));
    },
  },
  {
    id: 'first-bot',
    title: 'Buy your first idle bot',
    hint: 'Open the Growth Console → Idle Bots. Bots automate everything except money.',
    done: s => Object.values(s.bots || {}).reduce((a, b) => a + b, 0) >= 1,
    progress: s => Math.min(1, s.impressions / 100),
  },
  {
    id: 'first-opportunity',
    title: 'Take your first opportunity',
    hint: 'Build influence until a deal unlocks. Take it by hand for real money.',
    done: s => (s.opportunities && s.opportunities.taken.length) >= 1,
    progress: s => Math.min(1, s.influence / 500),
  },
  {
    id: 'first-prestige',
    title: 'Reset for Brand Equity',
    hint: 'Delete the account. Start fresh. Keep the brand.',
    done: s => s.prestige.resets >= 1,
    progress: s => Math.min(1, s.influence / 100000),
  },
];

const Guide = {
  _doneCount: 0,

  current(s) {
    for (const step of GUIDE_STEPS) {
      if (!step.done(s)) return step;
    }
    return null; // everything done
  },

  // what the bar shows when every step is complete
  finished(s) {
    return GUIDE_STEPS.every(st => st.done(s));
  },

  render() {
    const s = State.data;
    const el = document.getElementById('guide');
    if (!el) return;
    const step = this.current(s);

    if (!step) {
      el.classList.add('guide-done');
      el.innerHTML =
        '<div class="guide-icon">🏆</div>' +
        '<div class="guide-body"><div class="guide-title">The arc is yours</div>' +
        '<div class="guide-hint">Keep posting. The rent is still due.</div></div>';
      return;
    }

    const pct = Math.round(Math.max(0, Math.min(1, step.progress(s))) * 100);
    el.classList.remove('guide-done');
    el.innerHTML =
      '<div class="guide-icon">🎯</div>' +
      '<div class="guide-body">' +
      '<div class="guide-title">' + step.title + '</div>' +
      '<div class="guide-hint">' + step.hint + '</div>' +
      '<div class="guide-bar"><div class="guide-fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
  },

  // advance check — run on state:changed (throttled by the engine tick).
  // when a step crosses from incomplete to complete, celebrate it.
  check() {
    const s = State.data;
    // count completed steps; when the count goes up, celebrate the new one
    const doneCount = GUIDE_STEPS.reduce((n, st) => n + (st.done(s) ? 1 : 0), 0);
    if (doneCount > this._doneCount) {
      this._doneCount = doneCount;
      const next = this.current(s);
      const nextTitle = next ? next.title : 'the endless feed';
      Juice.chime();
      Juice.toast('🎯 Objective complete. Next: ' + nextTitle + '.');
    }
  },

  _doneCount: 0,

  init() {
    // render immediately and on every state change (engine emits state:changed)
    this.render();
    Bus.on('state:changed', () => {
      this.render();
      this.check();
    });
    // some state changes don't route through the engine tick; refresh on key events
    Bus.on('post:published', () => this.render());
    Bus.on('generator:bought', () => this.render());
    Bus.on('app:unlocked', () => this.render());
    Bus.on('prestige:reset', () => this.render());
    Bus.on('sponsor:activated', () => this.render());
  },
};
