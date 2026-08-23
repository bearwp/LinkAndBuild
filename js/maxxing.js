/* ============================================================
   LINK & BUILD — Maxxing
   The growth-maxxing systems. Everything here is a real social
   media technique, re-skinned as gameplay that lives in the meta
   layer (composer, post cards, profile, DMs) rather than on the
   website itself.

   Systems:
   - niche pillars (pick 3 tags, consistency compounds)
   - engagement rate + dead followers (bought followers who never engage)
   - golden hour (first-hour window doubles reach; scheduler automates it)
   - reply to comments (manual boost; engage bot does it silently)
   - daily posting streak (the addiction as retention)
   - rage-bait tone (hot take: more reach, less authenticity, ratio risk)
   - trending tags / newsjacking (countdown + multiplier)
   - reply-guy race (be first to comment on a big post)
   - A/B test (pay $5, algorithm picks a winner)
   - collab / S4S (DM negotiation into the money loop)
   ============================================================ */

const Maxxing = {
  /* ---------- niche pillars ---------- */
  // pick up to 3 pillar tags. Once chosen, posts using a pillar tag count
  // toward consistency; posts using none of them reset it.
  choosePillars(ids) {
    const s = State.data;
    const uniq = Array.from(new Set(ids)).filter(id => Tags.def(id)).slice(0, 3);
    s.pillars.chosen = uniq;
    s.pillars.consistency = 0;
    if (uniq.length) {
      Juice.toast('🎯 Niche pillars set. The algorithm rewards consistency.');
      Narrator.say('pillars_set', 'dm');
    }
    Bus.emit('pillars:changed');
  },

  // is a post on-pillar? (any tag matches a pillar)
  onPillar(post) {
    const s = State.data;
    if (!s.pillars.chosen.length) return false;
    return (post.tags || []).some(id => s.pillars.chosen.includes(id));
  },

  // the consistency multiplier: 1 + 0.15 per consecutive on-pillar post,
  // capped at +45% (a focused niche is worth something, not everything).
  pillarMult() {
    const s = State.data;
    if (!s.pillars.chosen.length) return 1;
    return 1 + Math.min(0.45, s.pillars.consistency * 0.15);
  },

  // called on publish: on-pillar extends the streak, off-pillar resets it.
  trackPillar(post) {
    const s = State.data;
    if (!s.pillars.chosen.length) return;
    if (this.onPillar(post)) {
      s.pillars.consistency++;
      s.pillars.bestConsistency = Math.max(s.pillars.bestConsistency || 0, s.pillars.consistency);
    } else {
      s.pillars.consistency = 0;
    }
  },

  /* ---------- engagement rate + dead followers ---------- */
  // The algorithm punishes a low engagement rate. Bought followers (clout
  // packages) are "dead" — they raise the follower count but never engage,
  // dragging the rate down. Real engagement is recent likes + comments.
  // Rate = recent engagement / audience. We sample the analytics history
  // (which records likes + followers every second) and measure how many
  // likes landed per follower in the last window.
  engagementRate() {
    const s = State.data;
    const denom = s.followers + s.connections + (s.deadFollowers || 0);
    if (denom <= 0) return 0;
    const h = (s.analytics && s.analytics.history) || [];
    // recent likes from the history window (last ~30 samples ≈ 30s)
    let recentLikes = 0;
    if (h.length >= 2) {
      const start = Math.max(0, h.length - 30);
      recentLikes = h[h.length - 1].likes - h[start].likes;
    } else {
      // no history yet: fall back to a small fraction of lifetime likes
      recentLikes = (s.likes || 0) * 0.01;
    }
    return recentLikes / denom;
  },

  // a multiplier that throtts reach when the rate is poor. 1 at a healthy
  // rate (~2% recent engagement), down to 0.5 at a dead-follower swamp. The
  // trap: buy followers to hit sponsor thresholds, and your reach quietly dies.
  rateMult() {
    const rate = this.engagementRate();
    if (rate >= 0.02) return 1;
    if (rate <= 0) return 0.5;
    // linear between 0.5 and 1.0
    return 0.5 + (rate / 0.02) * 0.5;
  },

  // how many of the player's followers are dead (for the profile chip)
  deadCount() {
    return State.data.deadFollowers || 0;
  },

  /* ---------- golden hour ---------- */
  // The first hour after a post decides its distribution. Manual engagement
  // in that window doubles reach. The Scheduler generator automates it away
  // (the joke: the automation steals the anxiety).
  GOLDEN_WINDOW: 60, // seconds of boosted reach
  GOLDEN_MULT: 2,    // reach multiplier inside the window

  // reach multiplier for a post, considering the golden hour window.
  // Scheduler-managed posts get a flat 1.5 (auto-optimal, no anxiety).
  goldenMult(post) {
    const s = State.data;
    if (post.authorId !== 'you') return 1;
    const gh = s.goldenHour[post.id];
    if (!gh) return 1;
    if (gh.autoManaged) return 1.5;
    const left = gh.windowEnd - Date.now();
    if (left > 0) return this.GOLDEN_MULT;
    return 1;
  },

  // called from tickPosts: keep the window fresh on the post card
  goldenLeft(post) {
    const s = State.data;
    const gh = s.goldenHour[post.id];
    if (!gh || gh.autoManaged) return null;
    return Math.max(0, gh.windowEnd - Date.now());
  },

  /* ---------- reply to comments ---------- */
  // Replying to a comment boosts the post (manual effort, +authenticity).
  // The engage bot does it silently — you watch the bot being you.
  replyToComment(postId, commentIndex) {
    const s = State.data;
    const post = s.posts.find(p => p.id === postId);
    if (!post || post.authorId !== 'you') return;
    const c = post.comments && post.comments[commentIndex];
    if (!c || c.replied) return;
    c.replied = true;
    c.replyText = 'Thanks! Really appreciate the support. 🙏';
    post.repliedCount = (post.repliedCount || 0) + 1;
    s.effort += 0.3;
    s.authenticity = Math.max(0, Math.min(100, s.authenticity + 0.5));
    // each reply nudges the post's reach back up
    post.reach = (post.reach || 0) * 1.15;
    Juice.pop();
    Bus.emit('post:replied', post);
    UI.updatePostCard(post);
  },

  /* ---------- daily posting streak ---------- */
  // Post every day and the streak grows. Miss a day and it resets. The
  // streak is the thing that keeps you coming back to an empty room — and
  // it keeps counting after the reveal, which is the horror.
  dayIndex() {
    return Math.floor(Date.now() / 86400000);
  },

  trackStreak() {
    const s = State.data;
    const today = this.dayIndex();
    const st = s.streak;
    if (st.lastPostDay === today) return; // already posted today
    if (st.lastPostDay === today - 1) {
      st.count++; // consecutive day
    } else {
      st.count = 1; // first post, or a broken streak
    }
    st.lastPostDay = today;
    if (st.count === 1) Narrator.say('streak_start', 'notif');
    if (st.count > 0 && st.count % 5 === 0) {
      Juice.milestone('🔥 ' + st.count + ' DAY STREAK', 'The algorithm loves consistency. The room stays empty.', '');
    }
    Bus.emit('streak:changed');
  },

  // decay the streak if a day was skipped (checked on load + tick)
  checkStreakDecay() {
    const s = State.data;
    const st = s.streak;
    if (!st.count) return;
    const today = this.dayIndex();
    if (st.lastPostDay < today - 1) {
      const broken = st.count;
      st.count = 0;
      if (broken >= 3) {
        Narrator.say('streak_broken', 'notif');
        Juice.toast('🔥 Your ' + broken + '-day streak died. Post today to restart it.');
      }
      Bus.emit('streak:changed');
    }
  },

  /* ---------- rage-bait tone ---------- */
  // A hot take reaches more but costs authenticity and risks a ratio.
  // Returns { reachMult, authCost } for the chosen tone.
  toneEffect(tone) {
    if (tone === 'hot') return { reachMult: 2.5, authCost: 12 };
    if (tone === 'unpopular') return { reachMult: 3.5, authCost: 20 };
    return { reachMult: 1, authCost: 0 };
  },

  // after publishing a rage-bait post, roll the ratio risk
  rollRatio(post) {
    const s = State.data;
    if (post.tone !== 'hot' && post.tone !== 'unpopular') return;
    // ~10% chance the take gets ratioed: a callout post + a reach penalty
    if (Math.random() < 0.1) {
      post.ratioed = true;
      post.reach = (post.reach || 0) * 0.5;
      s.authenticity = Math.max(0, s.authenticity - 5);
      setTimeout(() => {
        const callout = Engine.makeNPCPost();
        callout.content = 'Unpopular take: your last post was embarrassing. Ratioed. Delete it.';
        callout.authorName = 'The Algorithm';
        callout.authorRole = 'Content Moderator';
        callout.authorEmoji = '👁️';
        callout.authorColor = '#111';
        callout.fourthWall = true;
        s.posts.unshift(callout);
        Engine.trimPosts();
        Bus.emit('post:ratioed', { post, callout });
      }, 4000);
      Juice.warn();
    }
  },

  /* ---------- trending tags (newsjacking) ---------- */
  // A trending tag appears with a countdown. Using it gives a multiplier but
  // it expires. The narrator pushes it — the algorithm amplifying a thing.
  spawnTrending() {
    const s = State.data;
    if (s.trending && s.trending.tagId && s.trending.expiresAt > Date.now()) return;
    const pool = DATA.TAGS.filter(t => t.id !== 'beg');
    const t = Engine.pick(pool);
    s.trending = {
      tagId: t.id,
      expiresAt: Date.now() + 120000, // 2 minutes to ride it
      used: false,
    };
    Narrator.say('trending', 'notif');
    Bus.emit('trending:spawned', { tagId: t.id });
  },

  trendingInfo() {
    const s = State.data;
    if (!s.trending || !s.trending.tagId) return null;
    const left = s.trending.expiresAt - Date.now();
    if (left <= 0) return null;
    return { tagId: s.trending.tagId, left, used: s.trending.used };
  },

  // the multiplier a post gets for riding the trend (only the first time)
  trendingMult(post) {
    const s = State.data;
    if (!post || !post.tags) return 1;
    if (s.trending && s.trending.tagId && !s.trending.used && post.tags.includes(s.trending.tagId)) {
      s.trending.used = true;
      return 1.8;
    }
    return 1;
  },

  /* ---------- reply-guy race ---------- */
  // A big account posts; you have a few seconds to be first. First comment
  // gets a visibility boost. After the reveal, you race bots — and lose.
  raceWindow: 8000, // ms to be first
  raceMult: 3,      // reach boost for winning

  maybeSpawnRace() {
    const s = State.data;
    if (s.reveal && s.reveal.revealed) return; // post-reveal: no more races
    if (s.followers < 20) return;
    if (this._nextRaceAt && Date.now() < this._nextRaceAt) return;
    this._nextRaceAt = Date.now() + 60000 + Math.random() * 90000;
    // spawn from an archetype the player follows so the race post shows in
    // the feed; fall back to any archetype.
    const followed = s.followedAuthors || [];
    const pool = followed.length ? followed : DATA.ARCHETYPES.map(a => a.id);
    const archId = Engine.pick(pool);
    const post = Engine.makeNPCPost(archId);
    post.race = true;
    post.raceEndsAt = Date.now() + this.raceWindow;
    s.posts.unshift(post);
    Engine.trimPosts();
    Bus.emit('race:spawned', post);
  },

  // the player comments first on a race post
  winRace(postId) {
    const s = State.data;
    const post = s.posts.find(p => p.id === postId);
    if (!post || !post.race) return;
    if (post.raceWon) return;
    post.raceWon = true;
    post.raceWinner = 'you';
    post.reach = (post.reach || 0) * this.raceMult;
    s.races[postId] = { won: true, claimedAt: Date.now() };
    s.impressions += 500;
    Juice.milestone('🏆 TOP COMMENT', 'You were first. The algorithm saw you.', '');
    Juice.chime();
    Narrator.say('race_won', 'notif');
    Bus.emit('race:won', post);
  },

  // called from tickPosts: resolve the race. The window is short — if the
  // player doesn't comment in time, a bot is first. Post-reveal the bots
  // always win (and it costs reach).
  raceTick(post) {
    const s = State.data;
    if (!post.race || post.raceWon) return;
    // the window expired without the player commenting: a bot was first
    if (post.raceEndsAt && Date.now() > post.raceEndsAt) {
      post.raceWon = true;
      post.raceWinner = 'bot';
      if (s.reveal && s.reveal.revealed) {
        post.reach = (post.reach || 0) * 0.5;
        Juice.toast('A bot beat you to the comment. It was always going to.');
      }
      Bus.emit('race:won', post);
      return;
    }
    if (s.reveal && s.reveal.revealed && Math.random() < 0.02) {
      post.raceWon = true;
      post.raceWinner = 'bot';
      post.reach = (post.reach || 0) * 0.5;
      Juice.toast('A bot beat you to the comment. It was always going to.');
      Bus.emit('race:won', post);
    }
  },

  /* ---------- A/B test ---------- */
  // Pay $5; the algorithm shows two versions of a post to a sample and picks
  // a winner, which gets boosted. A per-post gamble.
  startAbTest(postId) {
    const s = State.data;
    const post = s.posts.find(p => p.id === postId);
    if (!post || post.authorId !== 'you') return;
    if (s.abTests[postId]) return;
    if (s.os.bank.balance < 5) {
      Juice.toast('Not enough money for an A/B test. Take an opportunity first.');
      return;
    }
    Bank.deposit(-5, 'A/B test', '🧪');
    s.abTests[postId] = { decided: false, cost: 5 };
    Juice.toast('🧪 A/B test running. The algorithm is sampling your post.');
    Bus.emit('ab:started', post);
    // decide after a few seconds
    setTimeout(() => {
      const ab = s.abTests[postId];
      if (!ab || ab.decided) return;
      ab.decided = true;
      ab.winner = Math.random() < 0.55; // 55% the post wins the test
      if (ab.winner) {
        post.reach = (post.reach || 0) * 2.5;
        post.publishedAt = Date.now();
        Juice.milestone('🧪 A/B WINNER', 'The algorithm chose you. The other version never existed.', '');
      } else {
        Juice.toast('🧪 A/B test lost. The algorithm preferred a version you never saw.');
      }
      Bus.emit('ab:decided', { post, winner: ab.winner });
    }, 4000);
  },

  abState(postId) {
    return State.data.abTests[postId] || null;
  },

  /* ---------- collab / S4S ---------- */
  // A DM negotiation: collab with an equal account (mutual swap), a bigger
  // one (pay them a cut of clout), or a smaller one (they pay you).
  COLLAB_POOL: [
    { id: 'c1', name: 'Priya Sharma', role: 'Product Manager', emoji: '👩‍💻', color: '#9c27b0', reach: 800, split: 50 },
    { id: 'c2', name: 'Mike Johnson', role: 'Founder', emoji: '🧔', color: '#00acc1', reach: 1200, split: 50 },
    { id: 'c3', name: 'Sarah Chen', role: 'Marketing Director', emoji: '👩‍💼', color: '#e91e63', reach: 2000, split: 60 },
    { id: 'c4', name: 'David Kim', role: 'Engineer', emoji: '👨‍💻', color: '#00897b', reach: 400, split: 40 },
  ],

  maybeCollab() {
    const s = State.data;
    if (s.followers < 30) return;
    if (this._nextCollabAt && Date.now() < this._nextCollabAt) return;
    this._nextCollabAt = Date.now() + 90000 + Math.random() * 120000;
    const person = Engine.pick(this.COLLAB_POOL);
    s.collabs.push({
      id: 'col' + Date.now(),
      personId: person.id,
      state: 'offer', // offer -> accepted/declined
      split: person.split,
      time: Date.now(),
    });
    Bus.emit('collab:offer', { person });
  },

  collabState(id) {
    return State.data.collabs.find(c => c.id === id) || null;
  },

  acceptCollab(id, split) {
    const s = State.data;
    const c = this.collabState(id);
    if (!c || c.state !== 'offer') return;
    c.state = 'accepted';
    c.split = split || c.split;
    const person = this.COLLAB_POOL.find(p => p.id === c.personId);
    const yourShare = Math.round(person.reach * (c.split / 100));
    // the collab is a mutual audience swap: your post reaches their network
    s.followers += Math.max(1, Math.round(person.reach * 0.05));
    s.impressions += person.reach * 10;
    s.authenticity = Math.max(0, Math.min(100, s.authenticity + 1));
    Juice.milestone('🤝 COLLAB ACCEPTED', 'Your post will reach ' + person.name + '\'s network.', '');
    Juice.chime();
    Narrator.say('collab_accepted', 'dm');
    Bus.emit('collab:accepted', { c, person });
  },

  declineCollab(id) {
    const s = State.data;
    const c = this.collabState(id);
    if (!c || c.state !== 'offer') return;
    c.state = 'declined';
    Bus.emit('collab:declined', { c });
  },

  /* ---------- tick (called from the engine) ---------- */
  tick(dtMs) {
    this.checkStreakDecay();
    // trending tags spawn occasionally
    if (Math.random() < dtMs / 1000 * 0.02) this.spawnTrending();
    this.maybeSpawnRace();
    this.maybeCollab();
  },
};

/* ---------- narrator lines for the maxxing systems ---------- */
(function () {
  const lines = {
    pillars_set: {
      coach: ["A niche. Good. The algorithm rewards people who stay in their lane.", "You've picked your lane. Consistency compounds. Stay in it."],
      pm: ["Pillars registered. The funnel is now a focused funnel.", "Niche locked. We'll route your audience accordingly."],
      auditor: ["You chose three topics. The room was empty either way. The topics made it feel like a plan."],
    },
    streak_start: {
      coach: ["Day one. The streak begins. Don't break it.", "A streak. The algorithm loves a streak."],
      pm: ["Streak initialized. Retention looks strong.", "Day one logged. Keep the cadence."],
      auditor: ["The streak begins. You'll protect it like it's real. It isn't."],
    },
    streak_broken: {
      coach: ["The streak broke. It always hurts. Post today to start again.", "You missed a day. The algorithm noticed. It forgives, but it remembers."],
      pm: ["Streak broken. Cadence lost. Rebuild it.", "A gap. The algorithm prefers consistency."],
      auditor: ["The streak broke. You'll feel it more than the followers do. The followers are bots. The streak was real."],
    },
    trending: {
      coach: ["Something's trending. The algorithm is amplifying it. Ride it.", "A topic is hot right now. Post about it. The algorithm is listening."],
      pm: ["Trending topic detected. Amplification window open.", "The algorithm is pushing a topic. Ride the wave."],
      auditor: ["Something is trending. The algorithm amplifies what it wants you to chase. You'll chase it. You always do."],
    },
    race_won: {
      coach: ["You were first. The algorithm saw you.", "First comment. The visibility is yours."],
      pm: ["Top comment secured. Reach boosted.", "First to the thread. The algorithm rewards speed."],
      auditor: ["You were first. It meant nothing. But it felt like winning."],
    },
    collab_accepted: {
      coach: ["A collab. Two audiences, one post. The algorithm approves.", "You're reaching their network now. Good."],
      pm: ["Collab logged. Audience swap in progress.", "Cross-promotion registered. The funnel widens."],
      auditor: ["You collabbed with another empty room. Two voids, one post."],
    },
    jobs_applied: {
      coach: ["You applied. They'll never call. Post more.", "An application. The algorithm watched. It liked how it felt."],
      pm: ["Application logged. We'll route more opportunities to you.", "A job application. The funnel widens."],
      auditor: ["You applied to a job that doesn't exist, at a company that is a shell. The algorithm approved."],
    },
  };
  // merge into the narrator's data (loaded after data.js, before narrator init)
  const merge = () => {
    if (!window.DATA || !window.DATA.NARRATOR) return;
    for (const key in lines) {
      window.DATA.NARRATOR.lines[key] = lines[key];
    }
  };
  // top-level consts don't attach to window, so look up the real DATA
  if (typeof DATA !== 'undefined' && DATA.NARRATOR) {
    for (const key in lines) DATA.NARRATOR.lines[key] = lines[key];
  }
  window.addEventListener('DOMContentLoaded', merge);
})();
