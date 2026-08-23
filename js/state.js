/* ============================================================
   LINK & BUILD — Game State
   Player state, persistence, and save/load.
   ============================================================ */

function defaultState() {
  return {
    name: 'You',
    headline: 'Just here for the game.',
    avatar: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a66c2"/><stop offset="1" stop-color="#7fb8e8"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="38" r="18" fill="#fff"/><path d="M18 90c0-19 14-30 32-30s32 11 32 30" fill="#fff"/></svg>'),
    connections: 0,
    followers: 0,
    impressions: 0,
    likes: 0,
    influence: 0,
    authenticity: 100,
    hoursSaved: 0,
    effort: 0,
    scale: 1,               // global number/growth multiplier (0.1x – 10x)
    notation: 'standard',   // 'standard' | 'scientific' | 'engineering'
    premium: false,
    verified: false,
    shadowbanned: false,
    flagged: false,
    flagShown: false,
    generators: {},          // id -> count owned
    upgrades: {},            // id -> count owned
    posts: [],               // published posts
    notifications: [],      // newest first
    notifCount: 0,           // unread
    dms: [],                 // incoming LockedIn DMs (side panel)
    calendar: [],            // scheduled coffees / quick chats
    followed: [],            // ids of recommended people the player follows
    followedAuthors: [],     // archetype ids whose posts appear in the feed
    network: [],             // ids of network people the player connected with
    bucket: {                // the tag bucket: tags absorbed from scrolling
      tags: {},              // tagId -> count held
      total: 0,              // total tags ever absorbed (lifetime)
      spent: 0,              // total tags ever spent on posts
      starterGranted: false, // one-time starting topics given to the player
    },
    rapport: {},             // authorId -> { rapport, liked, commented, connected, followed }
    opportunities: {         // influence -> money deals
      taken: [],             // opportunity ids claimed (one-time)
    },
    bots: {                  // idle automation: automate everything except money
      scroll: 0,             // auto-scroll bot count (absorbs tags)
      post: 0,               // auto-post bot count (writes posts from bucket)
      engage: 0,             // auto-engage bot count (likes/comments, builds rapport)
      influence: 0,          // auto-influence bot count (reach -> influence)
    },
    // the growth-maxxing systems: pillars (niche), engagement rate, streaks,
    // golden hour, rage-bait, trending tags, reply-guy races, A/B tests, collabs.
    pillars: {               // niche pillars: pick 3 tags and stick to them
      chosen: [],            // tagIds the player committed to
      consistency: 0,        // consecutive posts that stayed on-pillar
      bestConsistency: 0,    // lifetime best streak (for the reward cap)
    },
    deadFollowers: 0,        // bought followers who never engage (drag the rate down)
    streak: {                // the daily posting streak (the addiction as retention)
      count: 0,              // current streak length
      lastPostDay: 0,        // day index of the last post that counted
    },
    trending: {              // newsjacking: a trending tag with a countdown
      tagId: null,           // the trending tag id
      expiresAt: 0,          // timestamp when it expires
      used: false,           // whether the player already rode this one
    },
    races: {},               // reply-guy race state: postId -> { won, claimedAt }
    abTests: {},             // postId -> { variant, decided, winner, cost }
    collabs: [],             // collab/S4S DMs: { id, personId, state, split }
    goldenHour: {},          // postId -> { windowEnd, autoManaged } (first-hour boost)
    milestonesSeen: {},      // id -> true
    fourthWallShown: false,
    onboarding: {            // the first-post arc: like -> comment -> nice comment -> unlock
      firstLike: false,
      firstComment: false,
      niceComment: false,
      unlocked: false,
    },
    narrator: {              // the algorithm's voice over everything
      register: 'coach',     // 'coach' | 'pm' | 'auditor'
      revealed: false,       // dead-internet reveal has landed
      scareStage: 0,         // 0 | 1 | 2 | 3 (glitch -> address -> confession)
    },
    reveal: {                // the dead-internet reveal + post-reveal game
      progress: 0,           // hidden counter (0..1) that drives scare escalation
      revealed: false,       // the thesis has landed
      postedAfter: false,    // kept posting after the reveal
      algorithm: false,      // chose to "become the algorithm"
    },
    retention: 0,            // post-reveal number: other players you are farming
    sponsors: {              // the money loop: clout -> cash -> clout
      active: [],            // sponsor ids currently paying out
      lastPayout: 0,         // timestamp of the last scheduled payout
      revealed: [],          // sponsor ids whose reveal has landed
    },
    prestige: {              // the reset: brand equity as the permanent currency
      brandEquity: 0,        // permanent currency, carries across every run
      resets: 0,             // how many times you've deleted your account
      layer: 1,              // 1 Persona | 2 Brand | 3 Platform | 4 Algorithm
      upgrades: {},          // id -> level owned (permanent)
      totalEarned: 0,        // lifetime brand equity (for the stats screen)
    },
    achievements: {          // endorsements — permanent records, survive prestige
      earned: [],            // achievement ids unlocked (ever)
      endorsements: {},      // skillId -> [ { name, role, emoji, color, time } ]
      oneRealPersonSeen: false,
    },
    challenges: {            // roguelite modifiers selected at the start of a run
      active: null,          // { id, startedAt } — the current run's challenge
      completed: {},         // id -> true (earned reward, permanent)
      stats: {               // per-challenge tracking, reset each run
        posts: 0,            // posts published this run
        silentPosts: 0,      // posts with no emojis/tags/question
        survivedShadowban: false,
      },
    },
    signedUp: false,          // has the player completed the signup page
    createdAt: Date.now(),
    lastSeen: Date.now(),
    version: State.VERSION,
    viralPosts: 0,
    totalImpressions: 0,
    analytics: {
      history: [],       // [{ t, impressions, likes, followers }] — sampled every 5s
      postsPublished: 0,
      totalLikes: 0,
      totalComments: 0,
      bestPost: null,
      analyticsLevel: 0, // analytics upgrades
    },
    os: {
      booted: false,
      unlockedApps: ['linkedin', 'bank'],  // apps the player has unlocked
      activeApp: 'linkedin',
      bank: { balance: 12.47, transactions: [] },
    },
  };
}

const State = {
  data: null,
  VERSION: 1,
  KEY: 'lockedin.save.v1',

  /* ---------- persistence ---------- */
  save() {
    if (!this.data) return;
    // Never persist a dev/showcase state. It's a preview, not a save.
    if (this.data.dev === true) return;
    this.data.lastSeen = Date.now();
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
    } catch (e) {
      // storage full or unavailable — the game keeps running, it just won't persist
      console.warn('[State] save failed', e);
    }
  },

  load() {
    let raw = null;
    try { raw = localStorage.getItem(this.KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Dev/showcase states are never a real save. If a dev session got
        // autosaved, discard it so the player always boots into a ghost town.
        if (parsed.dev === true) {
          console.warn('[State] discarding dev showcase save');
          this.data = defaultState();
          return false;
        }
        this.data = this.migrate(parsed);
        return true;
      } catch (e) {
        console.warn('[State] corrupt save, starting fresh', e);
      }
    }
    this.data = defaultState();
    return false;
  },

  /* ---------- versioned migration ---------- */
  // Each migration bumps a save from version N to N+1. Add new steps here
  // as the state shape evolves; never mutate old saves in place destructively.
  migrate(save) {
    let v = save.version || 0;

    // v0 -> v1: add lastSeen + version fields (pre-persistence saves)
    if (v < 1) {
      save.version = 1;
      save.lastSeen = save.lastSeen || save.createdAt || Date.now();
      v = 1;
    }

    // future migrations go here:
    // if (v < 2) { ...; v = 2; }

    // merge with defaults so any newly-added fields are present
    const base = defaultState();
    const merged = Object.assign({}, base, save);
    // deep-merge nested objects that defaults define (os, analytics)
    for (const key of ['os', 'analytics']) {
      if (save[key] && typeof save[key] === 'object') {
        merged[key] = Object.assign({}, base[key], save[key]);
      }
    }
    merged.os = Object.assign({}, base.os, save.os || {});
    merged.os.bank = Object.assign({}, base.os.bank, (save.os && save.os.bank) || {});
    merged.narrator = Object.assign({}, base.narrator, save.narrator || {});
    merged.onboarding = Object.assign({}, base.onboarding, save.onboarding || {});
    merged.reveal = Object.assign({}, base.reveal, save.reveal || {});
    merged.sponsors = Object.assign({}, base.sponsors, save.sponsors || {});
    merged.prestige = Object.assign({}, base.prestige, save.prestige || {});
    merged.achievements = Object.assign({}, base.achievements, save.achievements || {});
    merged.challenges = Object.assign({}, base.challenges, save.challenges || {});
    merged.challenges.stats = Object.assign({}, base.challenges.stats, (save.challenges && save.challenges.stats) || {});
    merged.bucket = Object.assign({}, base.bucket, save.bucket || {});
    merged.bucket.tags = Object.assign({}, base.bucket.tags, (save.bucket && save.bucket.tags) || {});
    merged.rapport = Object.assign({}, base.rapport, save.rapport || {});
    merged.opportunities = Object.assign({}, base.opportunities, save.opportunities || {});
    merged.opportunities.taken = (save.opportunities && save.opportunities.taken) || [];
    merged.bots = Object.assign({}, base.bots, save.bots || {});
    merged.pillars = Object.assign({}, base.pillars, save.pillars || {});
    merged.pillars.chosen = (save.pillars && save.pillars.chosen) || [];
    merged.streak = Object.assign({}, base.streak, save.streak || {});
    merged.trending = Object.assign({}, base.trending, save.trending || {});
    merged.races = Object.assign({}, base.races, save.races || {});
    merged.abTests = Object.assign({}, base.abTests, save.abTests || {});
    merged.collabs = Array.isArray(save.collabs) ? save.collabs : [];
    merged.goldenHour = Object.assign({}, base.goldenHour, save.goldenHour || {});
    merged.version = this.VERSION;
    return merged;
  },

  reset() {
    this.data = defaultState();
    try { localStorage.removeItem(this.KEY); } catch (e) {}
  },
};
