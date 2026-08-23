/* ============================================================
   LINK & BUILD — The Reveal (dead internet) & Endgame
   The payoff. As the player automates, a hidden progress counter
   climbs, and the feed starts to turn on them — scare posts escalate
   through three stages (glitch -> address -> confession). When the
   counter tops out, the reveal lands: it was all bots. Then the
   post-reveal game begins: a new number ("Retention"), and the offer
   to *become* the thing that farmed them.

   The reveal is a drip, not a cutscene. Scare posts are posts in the
   feed, obeying the same rules as everything else. The horror is that
   they are indistinguishable until you read them twice.
   ============================================================ */

const Reveal = {
  /* ---------- progress (the hidden counter) ---------- */
  // How deep the player is into automating their life. The more the game
  // plays itself, the closer the reveal. Two drivers: automation and raw
  // lifetime impressions.
  progress() {
    const s = State.data;
    // The reveal is the automation axis run forward to its conclusion: the
    // more you delegate, the closer you get to discovering none of it was real.
    const automation = Engine.automation();
    const autoP = Math.min(1, automation / 25);
    const impP = Math.min(1, s.totalImpressions / 1e9);
    return Math.min(1, 0.7 * autoP + 0.3 * impP);
  },

  /* ---------- scare posts ---------- */
  // inject a scare post for a stage into the feed. It is a post like any
  // other — authored by a "person" who is not a person.
  makeScarePost(stage) {
    const s = State.data;
    const pool = DATA.SCARE_POSTS.filter(sp => sp.stage === stage);
    if (!pool.length) return null;
    const sp = Engine.pick(pool);
    const post = {
      id: 'scare' + Date.now() + Math.floor(Math.random() * 9999),
      authorId: 'scare:' + stage,
      content: sp.content,
      template: null,
      format: 'text',
      rarity: 'rare',
      base: 300 + Math.random() * 400,
      viral: 1.5,
      decay: 0.95,
      stats: { impressions: 0, likes: 0, comments: 0, shares: 0 },
      publishedAt: Date.now(),
      status: 'live',
      isNPC: true,
      scare: true,
      scareStage: stage,
      authorName: sp.authorName,
      authorRole: sp.authorRole,
      authorEmoji: sp.authorEmoji,
      authorColor: sp.authorColor,
      comments: [],
      influence: 500,
    };
    s.posts.unshift(post);
    Engine.trimPosts();
    Bus.emit('scare:posted', post);
    return post;
  },

  // escalate the scare stage once (called at each threshold crossing)
  escalate(toStage) {
    const s = State.data;
    if (s.narrator.scareStage >= toStage) return;
    s.narrator.scareStage = toStage;
    const post = this.makeScarePost(toStage);
    const key = toStage === 1 ? 'scare_glitch' : toStage === 2 ? 'scare_address' : 'scare_confession';
    Narrator.say(key, 'notif');
    State.save();
  },

  /* ---------- the reveal ---------- */
  // The thesis lands. Not a cutscene — a DM, plus the feed is now flagged as
  // all bots. Fired exactly once.
  trigger() {
    const s = State.data;
    if (s.reveal.revealed) return;
    s.reveal.revealed = true;
    s.narrator.revealed = true;
    s.reveal.progress = 1;
    Narrator.say('reveal', 'dm');
    // every active sponsor confesses there was never a company
    for (const id of s.sponsors.active.slice()) Sponsors.reveal(id);
    // a final scare post — the confession, undiluted
    this.makeScarePost(3);
    Juice.milestone('👁️ THE REVEAL', 'It was never real. None of it was real.', 'viral');
    Juice.chime();
    Bus.emit('reveal:triggered');
    State.save();
  },

  /* ---------- post-reveal game ---------- */
  // once you've seen the truth, you can become the thing that farmed you.
  becomeAlgorithm() {
    const s = State.data;
    if (!s.reveal.revealed || s.reveal.algorithm) return;
    s.reveal.algorithm = true;
    Narrator.say('became_algorithm', 'dm');
    Juice.milestone('🕸️ BECOME THE ALGORITHM', 'The narrator reports to you now. It always did.', 'viral');
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 100);
    Bus.emit('reveal:became-algorithm');
    State.save();
  },

  /* ---------- tick (called from the engine) ---------- */
  tick() {
    const s = State.data;
    // pre-reveal: drive escalation
    if (!s.reveal.revealed) {
      const p = this.progress();
      s.reveal.progress = p;
      if (p >= 1) {
        this.trigger();
      } else if (p >= 0.8) {
        this.escalate(3);
      } else if (p >= 0.55) {
        this.escalate(2);
      } else if (p >= 0.3) {
        this.escalate(1);
      }
      return;
    }
    // post-reveal: retention accrues — you are farming other players now.
    // Runs every 100ms engine tick, so this is a per-tick gain.
    const ips = Engine.totalIps();
    const mult = s.reveal.algorithm ? 3 : 1;
    s.retention += (ips * 0.005 + 0.05) * mult;
  },

  init() {
    // keeping posting after the reveal is the whole ending
    Bus.on('post:published', () => {
      const s = State.data;
      if (!s.reveal.revealed) return;
      if (!s.reveal.postedAfter) {
        s.reveal.postedAfter = true;
        Narrator.say('still_posting', 'notif');
        Bus.emit('reveal:posted-after');
        State.save();
      }
    });
  },
};
