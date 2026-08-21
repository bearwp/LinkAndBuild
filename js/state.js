/* ============================================================
   LINK & BUILD — Game State
   Player state, persistence, and save/load.
   ============================================================ */

const SAVE_KEY = 'linkandbuild_save_v1';

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
    dms: [],                 // incoming LinkedIn DMs (side panel)
    calendar: [],            // scheduled coffees / quick chats
    followed: [],            // ids of recommended people the player follows
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
        if (!this.data.dms) this.data.dms = [];
        if (!this.data.calendar) this.data.calendar = [];
        if (!this.data.followed) this.data.followed = [];
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
