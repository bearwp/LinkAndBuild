/* ============================================================
   LINK & BUILD — The Narrator
   The algorithm, personified as a product manager who loves you
   the way a farmer loves a crop. It is the voice over everything,
   delivered diegetically through DMs, notifications, and the bot
   log — never a floating text box.

   It subscribes to the event bus and fires lines on milestones,
   purchases, unlocks, and reveals. It never lies about what it
   is: it says "we", "the platform", "the algorithm". The player
   just never asks.
   ============================================================ */

const Narrator = {
  // identity of the voice (it is the platform, not a person)
  NAME: 'LockedIn',
  ROLE: 'The Algorithm',
  EMOJI: '👁️',
  COLOR: '#111',

  // how often (ms) the narrator may speak, to avoid spamming the inbox
  COOLDOWN: 4000,
  _lastSpoke: 0,

  /* ---------- register ---------- */
  register() {
    return State.data.narrator.register;
  },

  // pick a line for an event from the current register's pool
  line(event) {
    const pool = DATA.NARRATOR.lines[event];
    if (!pool) return null;
    const reg = pool[this.register()] || pool.coach;
    if (!reg || !reg.length) return null;
    return reg[Math.floor(Math.random() * reg.length)];
  },

  /* ---------- delivery channels ---------- */
  // a DM from the algorithm itself (the most intimate channel)
  dm(text) {
    const s = State.data;
    s.dms.unshift({
      id: 'narr' + Date.now() + Math.floor(Math.random() * 9999),
      name: this.NAME,
      role: this.ROLE,
      emoji: this.EMOJI,
      color: this.COLOR,
      text: text,
      time: Date.now(),
      read: false,
      narrator: true,
    });
    if (s.dms.length > 200) s.dms.pop();
    Bus.emit('dm:received');
  },

  // a notification (the bell — the narrator *is* the bell)
  notif(text) {
    Engine.addNotif('narrator', text, 0, this.EMOJI);
  },

  // a bot-log entry (only once the bot exists; the voice lives in the machine)
  log(text) {
    const s = State.data;
    if (!s.os.bot.created) return;
    s.os.bot.activity.push({ type: 'log', text: text, time: Date.now(), icon: this.EMOJI });
    if (s.os.bot.activity.length > 40) s.os.bot.activity.shift();
  },

  /* ---------- the speak primitive ---------- */
  // fire a line for an event, choosing a channel by the event's weight.
  // big beats (reveal, register shifts) arrive as DMs; routine beats as
  // notifications; automation beats also echo into the bot log.
  say(event, channel, force) {
    const text = this.line(event);
    if (!text) return;
    const now = Date.now();
    if (!force && now - this._lastSpoke < this.COOLDOWN) return;
    this._lastSpoke = now;

    channel = channel || 'notif';
    if (channel === 'dm') this.dm(text);
    else if (channel === 'log') this.log(text);
    else this.notif(text);
  },

  /* ---------- register transitions ---------- */
  // shift the register at thresholds. The shift is itself a narrated event.
  maybeTransition() {
    const s = State.data;
    const n = s.narrator;
    // register shifts follow the delegation axis (the single source of truth),
    // not ad-hoc counts — the voice's register *is* your era.
    const era = Engine.era();
    if (n.register === 'coach') {
      // first delegation -> product manager
      if (era >= 2) {
        n.register = 'pm';
        this.say('to_pm', 'dm');
        return;
      }
    }
    if (n.register === 'pm') {
      // industrial scale (or shadowban) -> auditor
      if (era >= 3 || s.shadowbanned) {
        n.register = 'auditor';
        this.say('to_auditor', 'dm');
      }
    }
  },

  /* ---------- event handlers ---------- */
  init() {
    // first post
    Bus.on('post:published', (post) => {
      if (State.data.analytics.postsPublished === 1) this.say('first_post', 'dm');
    });

    // the first-post arc: like -> comment -> nice comment -> unlock
    Bus.on('onboarding:first-like', () => this.say('first_like', 'dm', true));
    Bus.on('onboarding:first-comment', () => this.say('first_comment', 'dm', true));
    Bus.on('onboarding:nice-comment', () => {
      this.say('nice_comment', 'dm', true);
      // enough engagement: unlock the rest of the interface
      if (!State.data.onboarding.unlocked) {
        State.data.onboarding.unlocked = true;
        UI.applyProgression();
        Juice.chime();
        Juice.toast('🔓 The interface unlocked. Welcome to the machine.');
      }
    });

    // rarity reveals
    Bus.on('post:published', (post) => {
      if (post.rarity === 'legendary') this.say('legendary', 'notif');
      else if (post.rarity === 'epic') this.say('epic', 'notif');
    });

    // delegation / automation
    Bus.on('generator:bought', (e) => {
      const total = Object.values(State.data.generators).reduce((a, b) => a + b, 0);
      if (total === 1) this.say('first_generator', 'dm');
      if (e && e.id === 'aifactory') this.say('factory', 'dm');
      this.maybeTransition();
    });
    Bus.on('worker:hired', (e) => {
      const total = Object.keys(State.data.workers).length;
      if (total === 1) this.say('first_worker', 'notif');
      this.maybeTransition();
    });
    Bus.on('bot:created', () => {
      this.say('bot_created', 'log');
      this.maybeTransition();
    });

    // unlocks
    Bus.on('app:unlocked', (e) => {
      if (e && e.app === 'telegram') this.say('telegram', 'notif');
      else if (e && e.app === 'bot') this.say('bot', 'notif');
      else if (e && e.app === 'dark') this.say('dark', 'notif');
    });

    // milestones
    Bus.on('milestone:reached', (e) => {
      if (!e || !e.id) return;
      if (e.id === 'f100') this.say('followers_100', 'notif');
      else if (e.id === 'f1000') this.say('followers_1000', 'notif');
      else if (e.id === 'm1') this.say('impressions_1m', 'notif');
      this.maybeTransition();
    });

    // risk / shadowban
    Bus.on('detection:shadowban', () => {
      this.say('shadowban', 'dm');
      this.maybeTransition();
    });
    Bus.on('detection:restored', () => this.say('restored', 'notif'));

    // the reveal (dead internet) — fired by the reveal system in a later phase
    Bus.on('reveal:triggered', () => {
      State.data.narrator.revealed = true;
      this.say('reveal', 'dm');
    });
  },
};
