/* ============================================================
   LINK & BUILD — Game State
   Player state, persistence, and save/load.
   ============================================================ */

const SAVE_KEY = 'linkandbuild_save_v1';

function defaultState() {
  return {
    name: 'You',
    headline: 'Just here for the game.',
    connections: 0,
    followers: 0,
    impressions: 0,
    likes: 0,
    influence: 0,
    authenticity: 100,
    hoursSaved: 0,
    effort: 0,
    premium: false,
    verified: false,
    shadowbanned: false,
    flagged: false,
    flagShown: false,
    generators: {},          // id -> count owned
    upgrades: {},            // id -> count owned
    workers: {},             // workerId -> { count, intensity, lastPay }
    workerChats: {},         // workerId -> [ {from, text, time} ]
    posts: [],               // published posts
    notifications: [],      // newest first
    notifCount: 0,           // unread
    milestonesSeen: {},      // id -> true
    fourthWallShown: false,
    lastSaved: Date.now(),
    createdAt: Date.now(),
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
      unlockedApps: ['linkedin'],  // apps the player has unlocked
      activeApp: 'linkedin',
      telegram: {
        unlocked: false,
        joinedPods: [],   // pod ids joined
        messages: [],     // [{ from, text, time, podId }]
      },
      bot: { unlocked: false, created: false, name: '', activity: [], intensity: 1 },
      dark: { unlocked: false },
    },
  };
}

const State = {
  data: null,

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = Object.assign(defaultState(), parsed);
        // ensure nested objects exist
        if (!this.data.generators) this.data.generators = {};
        if (!this.data.upgrades) this.data.upgrades = {};
        if (!this.data.workers) this.data.workers = {};
        if (!this.data.workerChats) this.data.workerChats = {};
        if (!this.data.posts) this.data.posts = [];
        if (!this.data.notifications) this.data.notifications = [];
        if (!this.data.milestonesSeen) this.data.milestonesSeen = {};
        if (!this.data.analytics) this.data.analytics = { history: [], postsPublished: 0, totalLikes: 0, totalComments: 0, bestPost: null, analyticsLevel: 0 };
        if (!this.data.os) this.data.os = { booted: false, unlockedApps: ['linkedin'], activeApp: 'linkedin', telegram: { unlocked: false, joinedPods: [], messages: [] }, bot: { unlocked: false, created: false, name: '', activity: [], intensity: 1 }, dark: { unlocked: false } };
        return true;
      }
    } catch (e) {
      console.warn('Save load failed', e);
    }
    this.data = defaultState();
    return false;
  },

  save() {
    this.data.lastSaved = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.data = defaultState();
  },
};
