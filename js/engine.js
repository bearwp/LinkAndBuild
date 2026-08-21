/* ============================================================
   LINK & BUILD — Game Engine
   Game loop, engagement math, automation, detection, notifications.
   ============================================================ */

const Engine = {
  tick: 100,
  lastTick: 0,
  lastNotif: 0,
  lastFollower: 0,
  lastView: 0,
  lastRecruiter: 0,
  lastAutoPost: 0,
  lastFourthWall: 0,
  lastDM: 0,
  started: false,
  _raf: null,

  /* ---------- helpers ---------- */
  rnd(a, b) { return a + Math.random() * (b - a); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  // global scale multiplier (0.1x – 10x) applied to all numbers and growth
  scale() { return State.data.scale || 1; },

  // clout: the single number sponsors care about. Followers plus reach.
  // It is inflated by the scale slider like everything else — which is the
  // joke. The bank balance is the only number that isn't.
  clout() {
    const s = State.data;
    return s.followers + s.impressions / 1000 + s.connections / 10;
  },

  // number notation: 'standard' (K/M/B), 'scientific' (1.23e6),
  // 'engineering' (1.23M, 1.23B, 1.23T, ...). Every number on screen
  // goes through fmt/fmtTick so the toggle is global.
  notation() { return State.data.notation || 'standard'; },

  _fmtCore(n, decimals) {
    const mode = this.notation();
    if (mode === 'scientific') {
      if (n === 0) return '0';
      const exp = Math.floor(Math.log10(Math.abs(n)));
      const mant = n / Math.pow(10, exp);
      return mant.toFixed(decimals) + 'e' + exp;
    }
    if (mode === 'engineering') {
      const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
      if (n < 1000) return Math.floor(n).toString();
      let exp = Math.floor(Math.log10(Math.abs(n)));
      let group = Math.floor(exp / 3);
      if (group >= SUFFIXES.length) {
        // beyond the named suffixes, fall back to scientific
        return (n / Math.pow(10, group * 3)).toFixed(decimals) + 'e' + (group * 3);
      }
      return (n / Math.pow(10, group * 3)).toFixed(decimals) + SUFFIXES[group];
    }
    // standard
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
    return Math.floor(n).toString();
  },

  fmt(n) {
    return this._fmtCore(n, 1);
  },

  // fmt that ticks visibly every frame (more decimals)
  fmtTick(n) {
    return this._fmtCore(n, 2);
  },

  /* ---------- generator math ---------- */
  genDef(id) { return DATA.GENERATORS.find(g => g.id === id); },
  genCount(id) { return State.data.generators[id] || 0; },

  /* ---------- cost / production curves ---------- */
  // Every purchasable thing has a cost curve { base, growth } and a
  // production curve { base, perUnit }. These two helpers are the single
  // source of truth for balance math, so tuning a number means editing DATA,
  // not hunting through the engine.
  //
  // costOf(def, owned)  -> cost to buy the (owned+1)th unit
  //   = floor(base * growth^owned)
  // prodOf(def, owned)  -> total production/sec from `owned` units
  //   = base*owned + perUnit*owned*(owned-1)/2   (flat when perUnit=0)
  costOf(def, owned) {
    const c = def && def.cost;
    if (c && typeof c === 'object') {
      return Math.floor(c.base * Math.pow(c.growth || 1, owned || 0));
    }
    return Math.floor(c || 0); // legacy scalar cost
  },

  prodOf(def, owned) {
    const p = def && def.prod;
    const n = owned || 0;
    if (p && typeof p === 'object') {
      return p.base * n + (p.perUnit || 0) * n * (n - 1) / 2;
    }
    return (p || 0) * n; // legacy scalar prod
  },

  /* ---------- generic upgrade effects ---------- */
  // Upgrades carry a machine-readable `key` + `value`. These two helpers sum
  // every owned upgrade's effect so the engine never hardcodes a check per
  // upgrade. `upgradeMult(key)` returns a multiplier (1 + sum of values);
  // `upgradeFlat(key)` returns the raw summed value (for head-start bonuses).
  upgradeMult(key) {
    const s = State.data;
    let mult = 1;
    for (const u of DATA.UPGRADES) {
      if (u.key !== key) continue;
      const owned = s.upgrades[u.id] || 0;
      if (owned > 0) mult += u.value * owned;
    }
    return mult;
  },

  upgradeFlat(key) {
    const s = State.data;
    let total = 0;
    for (const u of DATA.UPGRADES) {
      if (u.key !== key) continue;
      const owned = s.upgrades[u.id] || 0;
      total += u.value * owned;
    }
    return total;
  },

  // cached impressions-per-second; recomputed once per simulation tick
  _ipsCache: 0,
  _ipsDirty: true,
  invalidateIps() { this._ipsDirty = true; },
  totalIps() {
    if (!this._ipsDirty) return this._ipsCache;
    const s = State.data;
    let ips = 0;
    for (const g of DATA.GENERATORS) {
      const n = s.generators[g.id] || 0;
      if (n > 0) ips += this.prodOf(g, n);
    }
    // upgrades multiplier (generic: sums every owned gen_mult upgrade)
    ips *= this.upgradeMult('gen_mult');
    // premium
    if (s.premium) ips *= 1.5;
    // shadowban throttle
    if (s.shadowbanned) ips *= 0.2;
    // outsource workers add on top
    ips += this.workerIps();
    // telegram pods add on top
    ips += Telegram.podIps();
    // bot service add on top
    ips += Bot.botIps();
    // prestige: permanent reach multiplier (brand equity)
    ips *= Prestige.multiplier('reach');
    // challenge rewards: permanent reach multiplier
    ips *= 1 + Challenges.reward('reach');
    // global scale
    this._ipsCache = ips * this.scale();
    this._ipsDirty = false;
    return this._ipsCache;
  },

  /* ---------- post generation ---------- */
  rollRarity(potential) {
    const r = Math.random();
    const p = Math.min(1, potential / 3);
    if (r < 0.02 * p) return 'legendary';
    if (r < 0.08 * p) return 'epic';
    if (r < 0.25 * p) return 'rare';
    if (r < 0.6 * p) return 'uncommon';
    return 'common';
  },

  makePost(content, opts) {
    const s = State.data;
    opts = opts || {};
    const template = opts.template ? DATA.TEMPLATES.find(t => t.id === opts.template) : null;
    const potential = (template ? template.potential : 1) *
      (1 + (opts.emojis || 0) * 0.08) *
      (1 + (opts.tags || 0) * 0.1) *
      (opts.question ? 1.2 : 1) *
      (opts.format === 'carousel' ? 1.3 : opts.format === 'poll' ? 1.1 : opts.format === 'video' ? 1.2 : opts.format === 'photo' ? 1.15 : 1);
    const rarity = this.rollRarity(potential);

    const base = (50 + s.followers * 1.5 + s.connections * 0.5) * this.scale() * this.upgradeMult('post_mult') * (1 + Challenges.reward('postMult'));
    const viral = rarity === 'legendary' ? 6 : rarity === 'epic' ? 3.5 : rarity === 'rare' ? 2 : rarity === 'uncommon' ? 1.4 : 1;
    const decay = 0.9; // per hour
    const authCost = (template ? template.auth : 0) + (opts.emojis || 0) * -0.5 + (opts.tags || 0) * -0.8 + (opts.question ? -1 : 0) + (opts.format === 'carousel' ? -2 : 0);

    const post = {
      id: 'p' + Date.now() + Math.floor(Math.random() * 9999),
      authorId: 'you',
      content: content,
      template: template ? template.id : null,
      format: opts.format || 'text',
      emojis: opts.emojis || 0,
      tagged: opts.tags || 0,
      question: !!opts.question,
      potential: potential,
      rarity: rarity,
      base: base,
      viral: viral,
      decay: decay,
      authCost: authCost,
      stats: { impressions: 0, likes: 0, comments: 0, shares: 0 },
      publishedAt: Date.now(),
      status: 'live',
      isNPC: false,
      authorName: 'You',
      authorRole: s.headline,
      authorEmoji: '🧑‍💻',
      authorColor: '#0a66c2',
      image: opts.format === 'photo' ? this.randomImage() : null,
      comments: [],
      influence: 1000 + s.followers, // you are always a Top Voice
    };
    return post;
  },

  makeNPCPost() {
    const arch = this.pickWeighted(DATA.ARCHETYPES, a => a.weight);
    const content = this.pick(arch.posts);
    const rarity = this.rollRarity(1 + Math.random() * 1.5);
    const viral = rarity === 'legendary' ? 5 : rarity === 'epic' ? 3 : rarity === 'rare' ? 1.8 : 1.2;
    const base = 100 + Math.random() * 300;
    return {
      id: 'n' + Date.now() + Math.floor(Math.random() * 9999),
      authorId: arch.id,
      content: content,
      template: null,
      format: 'text',
      rarity: rarity,
      base: base,
      viral: viral,
      decay: 0.9,
      stats: { impressions: 0, likes: 0, comments: 0, shares: 0 },
      publishedAt: Date.now(),
      status: 'live',
      isNPC: true,
      authorName: arch.name,
      authorRole: arch.role,
      authorEmoji: arch.emoji,
      authorColor: arch.color,
      image: Math.random() < 0.35 ? this.randomImage() : null,
      reactionGif: Math.random() < 0.3 ? this.pick(DATA.REACTION_GIFS) : null,
      comments: [],
      influence: arch.influence,
    };
  },

  // deterministic-ish placeholder image for posts (no network needed)
  randomImage() {
    const palettes = [
      ['#0a66c2', '#7fb8e8'], ['#5c6bc0', '#9fa8da'], ['#26a69a', '#80cbc4'],
      ['#ef5350', '#ef9a9a'], ['#ec4070', '#f48fb1'], ['#ffb300', '#ffd54f'],
      ['#7e57c2', '#b39ddb'], ['#00897b', '#4db6ac'], ['#3f51b5', '#7986cb'],
    ];
    const [a, b] = palettes[Math.floor(Math.random() * palettes.length)];
    const shapes = [
      `<circle cx="50" cy="50" r="34" fill="#fff" opacity="0.9"/>`,
      `<rect x="22" y="22" width="56" height="56" rx="12" fill="#fff" opacity="0.9"/>`,
      `<path d="M50 16 L84 84 L16 84 Z" fill="#fff" opacity="0.9"/>`,
      `<circle cx="34" cy="40" r="16" fill="#fff" opacity="0.9"/><circle cx="66" cy="60" r="20" fill="#fff" opacity="0.7"/>`,
      `<rect x="20" y="40" width="60" height="20" rx="10" fill="#fff" opacity="0.9"/>`,
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/>${shape}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  },

  pickWeighted(arr, weightFn) {
    let total = 0;
    for (const a of arr) total += weightFn(a);
    let r = Math.random() * total;
    for (const a of arr) {
      r -= weightFn(a);
      if (r <= 0) return a;
    }
    return arr[arr.length - 1];
  },

  /* ---------- engagement tick for a post ---------- */
  postRate(post, s) {
    const ageH = (Date.now() - post.publishedAt) / 3600000;
    const spike = Math.pow(post.decay, ageH); // 1 at t=0, decays
    let rate = post.base * post.viral * spike * 1.5; // impressions per second
    // viral posts get the viral_mult upgrade bonus
    if (post.rarity === 'legendary' || post.rarity === 'epic') {
      rate *= this.upgradeMult('viral_mult');
    }
    if (post.authorId === 'you' && s.shadowbanned) rate *= 0.15;
    // nobody multiplier: a fresh account's posts barely register. Reach is
    // earned, not given — the first posts get a trickle, and only once you
    // build followers/automation does the algorithm start to notice you.
    if (post.authorId === 'you') {
      const nobody = Math.max(0.05, Math.min(1, s.followers / 500));
      rate *= nobody;
    }
    return rate * this.scale();
  },

  tickPosts(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    for (const post of s.posts) {
      if (post.status !== 'live') continue;
      const rate = this.postRate(post, s);
      const imp = rate * dtSec;
      post.stats.impressions += imp;
      // Only the player's own posts feed the global counters. NPC posts are
      // world texture — they tick their own numbers on their own cards, but
      // they don't make *your* impressions/likes climb. Every number on your
      // profile is traceable to something you did.
      const yours = post.authorId === 'you';
      if (yours) {
        s.impressions += imp;
        s.totalImpressions += imp;
      }
      // likes/comments trickle proportional to impressions
      const likeRate = imp * 0.04;
      post.stats.likes += likeRate;
      if (yours) s.likes += likeRate;
      // onboarding: the first like on the player's first post
      if (yours && !s.onboarding.firstLike && post.stats.likes >= 1) {
        s.onboarding.firstLike = true;
        Bus.emit('onboarding:first-like', post);
      }
      // reposts trickle in too
      post.stats.shares += imp * 0.008;
      // spawn real comments fast
      const commentChance = imp * 0.12 * dtSec;
      if (Math.random() < commentChance && post.comments.length < 30) {
        post.stats.comments += 1;
        // the very first comment on the player's first post is a troll —
        // the algorithm's snarky beat. Later comments are the "nice" ones.
        const firstComment = yours && !s.onboarding.firstComment;
        const c = firstComment ? this.pick(DATA.TROLLS) : this.pick(DATA.COMMENTERS);
        // NPC posts draw comments from their own archetype's comment pool,
        // so comments read differently from the post body.
        const arch = post.isNPC ? DATA.ARCHETYPES.find(a => a.id === post.authorId) : null;
        const text = firstComment
          ? this.pick(c.phrases)
          : (arch && arch.comments.length ? this.pick(arch.comments) : this.pick(c.phrases));
        post.comments.push({
          author: c.name,
          role: c.role,
          emoji: c.emoji,
          color: c.color,
          text: text,
          time: Date.now(),
          troll: firstComment,
        });
        // onboarding: the first comment on the player's first post
        if (firstComment) {
          s.onboarding.firstComment = true;
          Bus.emit('onboarding:first-comment', post);
        } else if (yours && !s.onboarding.niceComment) {
          // a later, non-troll comment is the "nice" one that unlocks the UI
          s.onboarding.niceComment = true;
          Bus.emit('onboarding:nice-comment', post);
        }
      }
      // troll comments: when you're a nobody, the only engagement you get is
      // someone reminding you of it. Fades out as you build the machine.
      if (yours && this.era() < 2 && post.comments.length < 30) {
        const trollChance = dtSec * 0.02 * (1 - s.followers / 100);
        if (Math.random() < trollChance) {
          post.stats.comments += 1;
          const t = this.pick(DATA.TROLLS);
          post.comments.push({
            author: t.name,
            role: t.role,
            emoji: t.emoji,
            color: t.color,
            text: this.pick(t.phrases),
            time: Date.now(),
            troll: true,
          });
        }
      }
    }
  },

  /* ---------- outsource workers ---------- */
  workerDef(id) { return DATA.WORKERS.find(w => w.id === id); },
  workerCount(id) { return (State.data.workers[id] && State.data.workers[id].count) || 0; },
  workerIntensity(id) { return (State.data.workers[id] && State.data.workers[id].intensity) || 0; },

  workerIps() {
    const s = State.data;
    let ips = 0;
    for (const w of DATA.WORKERS) {
      const n = this.workerCount(w.id);
      if (n > 0) ips += this.prodOf(w, n) * (1 + this.workerIntensity(w.id) * 0.5);
    }
    return ips;
  },

  hireWorker(id) {
    const s = State.data;
    const w = this.workerDef(id);
    if (!w) return;
    const owned = this.workerCount(id);
    const cost = this.costOf(w, owned);
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions to pay ' + w.name + '.');
      return;
    }
    s.impressions -= cost;
    if (!s.workers[id]) s.workers[id] = { count: 0, intensity: 0, lastPay: Date.now() };
    s.workers[id].count++;
    // welcome message
    if (!s.workerChats[id]) s.workerChats[id] = [];
    s.workerChats[id].push({ from: 'them', text: 'Hello boss! I am ' + w.name + '. I will work very hard for you. 🙏', time: Date.now() });
    this.addNotif('connection', w.name + ' joined your engagement team', 0, w.emoji);
    Juice.chime();
    Bus.emit('worker:hired', { id });
  },

  setIntensity(id, val) {
    const s = State.data;
    if (!s.workers[id]) return;
    s.workers[id].intensity = Math.max(0, Math.min(3, val));
    const w = this.workerDef(id);
    const msgs = ['Chill mode. Slow and natural.', 'Normal pace. Steady engagement.', 'High gear. Lots of activity.', 'MAXIMUM OVERDRIVE. The algorithm will notice.'];
    if (s.workerChats[id]) s.workerChats[id].push({ from: 'them', text: msgs[val] + ' (' + w.name + ')', time: Date.now() });
    Bus.emit('worker:intensity', { id });
  },

  fireWorker(id) {
    const s = State.data;
    const w = this.workerDef(id);
    if (!s.workers[id] || s.workers[id].count <= 0) return;
    s.workers[id].count--;
    if (s.workers[id].count === 0) delete s.workers[id];
    if (s.workerChats[id]) s.workerChats[id].push({ from: 'them', text: 'No no please! I have family! I will work harder! 😭', time: Date.now() });
    this.addNotif('warning', 'You fired ' + w.name + '. They will remember this.', 0, '🚫');
    Juice.warn();
    Bus.emit('worker:fired', { id });
  },

  sendWorkerCommand(id, cmdId) {
    const s = State.data;
    const w = this.workerDef(id);
    const cmd = DATA.WORKER_COMMANDS.find(c => c.id === cmdId);
    if (!w || !cmd) return;
    if (!s.workerChats[id]) s.workerChats[id] = [];
    s.workerChats[id].push({ from: 'me', text: cmd.label, time: Date.now() });
    setTimeout(() => {
      s.workerChats[id].push({ from: 'them', text: cmd.reply, time: Date.now() });
      // command effects
      if (cmdId === 'like') { s.likes += 5 * this.workerCount(id) * this.scale(); s.impressions += 20 * this.workerCount(id) * this.scale(); }
      if (cmdId === 'comment') { s.impressions += 30 * this.workerCount(id) * this.scale(); }
      if (cmdId === 'follow') { s.followers += 1 * this.workerCount(id) * this.scale(); }
      if (cmdId === 'pay') { s.authenticity = Math.min(100, s.authenticity + 2); }
      if (cmdId === 'fire') { this.fireWorker(id); }
      Bus.emit('worker:command', { id });
      Juice.pop();
    }, 700);
    Bus.emit('worker:command', { id });
    Juice.pop();
  },

  /* ---------- worker production tick ---------- */
  tickWorkers(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    const ips = this.workerIps() * this.scale();
    s.impressions += ips * dtSec;
    s.totalImpressions += ips * dtSec;
    s.likes += ips * dtSec * 0.04;
    // influence climbs with your outsourced army
    for (const w of DATA.WORKERS) {
      const n = this.workerCount(w.id);
      if (n > 0) s.authenticity += Math.abs(w.auth) * n * dtSec;
    }
    if (s.authenticity < 0) s.authenticity = 0;
    if (s.authenticity > 100) s.authenticity = 100;
    // workers occasionally comment on your posts (visible in feed)
    if (Math.random() < dtSec * 0.3 * this.scale()) {
      const active = DATA.WORKERS.filter(w => this.workerCount(w.id) > 0);
      if (active.length) {
        const w = active[Math.floor(Math.random() * active.length)];
        const yourPosts = s.posts.filter(p => p.authorId === 'you' && p.status === 'live');
        if (yourPosts.length) {
          const post = yourPosts[Math.floor(Math.random() * yourPosts.length)];
          post.comments.push({ author: w.name, text: w.phrases[Math.floor(Math.random() * w.phrases.length)], time: Date.now() });
          post.stats.comments += 1;
          post.stats.likes += 1;
          s.likes += 1;
        }
      }
    }
  },

  /* ---------- analytics ---------- */
  tickAnalytics(dt) {
    const s = State.data;
    const a = s.analytics;
    const now = Date.now();
    const lastSample = a._lastSample || 0;
    if (now - lastSample > 1000) {
      a._lastSample = now;
      a.history.push({
        t: now,
        impressions: s.impressions,
        likes: s.likes,
        followers: s.followers,
        ips: this.totalIps(),
      });
      if (a.history.length > 300) a.history.shift();
    }
  },

  /* ---------- automation ---------- */
  tickAutomation(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    const ips = this.totalIps();
    // Manual-first: the feed is quiet until you buy automation. Reach comes
    // only from generators/workers/bot — zero automation means zero passive
    // growth. Numbers climb because *you* did something, not because the
    // game plays itself.
    const reach = ips * 1000;
    s.impressions += reach * dtSec;
    s.totalImpressions += reach * dtSec;
    // likes trickle
    const likes = reach * dtSec * 0.5 * this.upgradeMult('like_mult');
    s.likes += likes;
    // followers grow with automation (prestige follower magnet multiplies)
    const followerGain = reach * dtSec * 0.05 * Prestige.multiplier('followers') * this.upgradeMult('follower_mult') * (1 + Challenges.reward('followers'));
    s.followers += followerGain;
    // connections trickle in too (every number on screen should climb)
    s.connections += reach * dtSec * 0.02;
    // influence accrues slowly from reach (the real "score")
    s.influence += reach * dtSec * 0.1;
    // influence climbs with automation (you are thriving)
    const authDamp = Math.max(0, 1 - this.upgradeFlat('auth_less'));
    for (const g of DATA.GENERATORS) {
      const n = s.generators[g.id] || 0;
      if (n > 0) s.authenticity += Math.abs(g.auth) * n * dtSec * authDamp;
    }
    if (s.authenticity < 0) s.authenticity = 0;
    if (s.authenticity > 100) s.authenticity = 100;
    // hours saved
    const autoCount = Object.values(s.generators).reduce((a, b) => a + b, 0);
    s.hoursSaved += autoCount * dtSec * 0.0005;
    // effort decays toward 0 (manual engagement)
    s.effort = Math.max(0, s.effort - dtSec * 0.05);
  },

  /* ---------- notifications ---------- */
  addNotif(type, message, reward, icon, action) {
    const s = State.data;
    s.notifications.unshift({
      id: 'n' + Date.now() + Math.floor(Math.random() * 9999),
      type: type,
      message: message,
      reward: reward || 0,
      icon: icon || (type === 'view' ? '👀' : type === 'like' ? '👍' : type === 'comment' ? '💬' : type === 'connection' ? '🤝' : type === 'recruiter' ? '🚨' : type === 'warning' ? '⚠️' : '🔔'),
      action: action || null,
      createdAt: Date.now(),
    });
    if (s.notifications.length > 60) s.notifications.pop();
    s.notifCount++;
    Bus.emit('notif:added');
    Juice.bellPop();
    Juice.ding();
  },

  tickNotifications(dt) {
    const s = State.data;
    const now = Date.now();
    // quiet until the player has delegated (era 2): no ambient notifications
    if (this.era() < 2) return;
    const src = this.sources();
    // reactions come from your engagement ring: pods + the bot. More of
    // either = more likes/comments/views landing on your posts.
    const rate = Math.max(1, src.pods + src.bot * 3) * (s.premium ? 1.5 : 1);
    // profile views (golden cookie-ish)
    if (now - this.lastView > Math.max(500, 2000 / rate / this.scale()) && !s.shadowbanned) {
      this.lastView = now;
      const reward = Math.floor(this.rnd(5, 20) * (1 + s.followers / 500) * this.scale());
      s.impressions += reward;
      this.addNotif('view', this.pick(DATA.NOTIFS.view), reward, '👀');
    }
    // generic notifications
    if (now - this.lastNotif > Math.max(500, 1500 / rate / this.scale())) {
      this.lastNotif = now;
      const roll = Math.random();
      if (roll < 0.3) {
        this.addNotif('like', this.pick(DATA.NOTIFS.like), 0, '👍');
      } else if (roll < 0.5) {
        this.addNotif('comment', this.pick(DATA.NOTIFS.comment), 0, '💬');
      } else if (roll < 0.7) {
        const name = this.pick(DATA.ARCHETYPES).name;
        this.addNotif('connection', name + ' ' + this.pick(DATA.NOTIFS.connection), 0, '🤝');
      } else {
        this.addNotif('follower', this.pick(DATA.NOTIFS.follower), 0, '🔔');
      }
    }
    // recruiter DM (rare, big moment)
    if (now - this.lastRecruiter > Math.max(5000, 12000 / this.scale()) && s.followers > 20) {
      this.lastRecruiter = now;
      this.addNotif('recruiter', this.pick(DATA.NOTIFS.recruiter), Math.floor(this.rnd(50, 150)), '🚨');
      Juice.milestone('🚨 RECRUITER DM', 'You\'ve made it. They want you.', 'viral');
    }
  },

  /* ---------- incoming DMs (side panel spam) ---------- */
  tickDMs(dt) {
    const s = State.data;
    const now = Date.now();
    // quiet until the player has delegated (era 2): no ambient DM spam
    if (this.era() < 2) return;
    // inbound spam scales with your outreach army: every worker you hire draws
    // "opportunities" back into your inbox.
    const interval = Math.max(500, 1500 / Math.max(1, this.sources().workers) / this.scale());
    if (now - this.lastDM > interval) {
      this.lastDM = now;
      const sender = this.pick(DATA.DM_SENDERS);
      const dm = {
        id: 'dm' + now + Math.floor(Math.random() * 9999),
        name: sender.name,
        role: sender.role,
        emoji: sender.emoji,
        color: sender.color,
        text: this.pick(DATA.DM_MESSAGES),
        time: now,
        read: false,
      };
      s.dms.unshift(dm);
      if (s.dms.length > 200) s.dms.pop();
      Bus.emit('dm:received');
      Juice.ding();
    }
  },

  /* ---------- auto posting (AI factory) ---------- */
  tickAutoPost(dt) {
    const s = State.data;
    if (!s.generators['aifactory']) return;
    const now = Date.now();
    const interval = Math.max(500, 10000 / this.scale()); // every 10s the factory posts
    if (now - this.lastAutoPost > interval) {
      this.lastAutoPost = now;
      const post = this.makePost(this.pick(DATA.TEMPLATES.filter(t => t.id !== 'free')).text, {
        template: 'aiquote',
        format: 'text',
        emojis: 3,
        tags: 0,
        question: 1,
      });
      post.authorId = 'you';
      post.authorName = 'You (AI)';
      post.authorEmoji = '🤖';
      s.posts.unshift(post);
      Bus.emit('post:autoposted', post);
      Juice.toast('🤖 AI Factory published a post for you');
    }
  },

  /* ---------- fast NPC post streamer (casino feed) ---------- */
  lastStreamPost: 0,
  tickStream(dt) {
    const s = State.data;
    const now = Date.now();
    // The feed fills itself only after you've delegated (era 2), and the pace
    // scales with how many content generators you own — each one is a fake
    // account flooding your timeline.
    if (this.era() < 2) return;
    const interval = this.feedInterval();
    if (now - this.lastStreamPost > interval) {
      this.lastStreamPost = now;
      const post = this.makeNPCPost();
      s.posts.unshift(post);
      this.trimPosts();
      Bus.emit('post:streamed');
    }
  },

  /* ---------- the delegation axis (single source of truth) ---------- */
  // How much of "you" has been handed to the machine. Every ambient system —
  // feed churn, DMs, notifications, the narrator's register, the reveal —
  // reads this one number. Nothing hardcodes a stage; everything is a
  // projection of how automated you are.
  automation() {
    const s = State.data;
    const gens = Object.values(s.generators).reduce((a, b) => a + b, 0);
    const workers = Object.keys(s.workers).reduce((a, k) => a + (s.workers[k].count || 0), 0);
    return gens + workers + (s.os.bot.created ? 1 : 0);
  },

  // coarse era: 0 cold, 1 posting, 2 delegated, 3 industrial
  era() {
    const s = State.data;
    const a = this.automation();
    if (a >= 8 || s.sponsors.active.length >= 1) return 3;
    if (a >= 1) return 2;
    if (s.analytics.postsPublished >= 1) return 1;
    return 0;
  },

  // The factory: every automation unit feeds a specific downstream number.
  // Not one vague "churn" multiplier — each source is named and traceable:
  //   generators -> the feed (fake accounts flooding your timeline)
  //   workers    -> inbound DMs (your outreach army draws spam back to you)
  //   pods + bot -> notifications (your engagement ring reacts to your posts)
  sources() {
    const s = State.data;
    const gens = Object.values(s.generators).reduce((a, b) => a + b, 0);
    const workers = Object.keys(s.workers).reduce((a, k) => a + (s.workers[k].count || 0), 0);
    const pods = s.os.telegram.joinedPods.length;
    const bot = s.os.bot.created ? 1 : 0;
    return { gens, workers, pods, bot };
  },

  // one NPC post every 12s, divided by how many content generators you own.
  // More generators = a faster, noisier feed.
  feedInterval() {
    return Math.max(800, 12000 / Math.max(1, this.sources().gens));
  },

  // keep the post array bounded so the tick loops stay cheap
  trimPosts() {
    const s = State.data;
    const MAX = 60;
    if (s.posts.length <= MAX) return;
    // keep a reserved slice of NPC posts so the feed never collapses into
    // only the player's own posts, even after publishing a lot.
    const MIN_NPC = 20;
    const yours = s.posts.filter(p => p.authorId === 'you');
    const npcs = s.posts.filter(p => p.authorId !== 'you');
    const yourCap = MAX - MIN_NPC;
    const keepYours = yours.slice(0, yourCap);
    const keepNpcs = npcs.slice(0, MAX - keepYours.length);
    s.posts = keepYours.concat(keepNpcs);
  },

  /* ---------- detection (reframed: the algorithm adores you) ---------- */
  tickDetection(dt) {
    const s = State.data;
    if (s.shadowbanned) {
      // you're so big the algorithm had to throttle you — but you always bounce back
      if (s.authenticity >= 60) {
        s.shadowbanned = false;
        Bus.emit('detection:restored');
        this.addNotif('warning', 'Your reach is back to full power. The algorithm missed you.', 0, '✅');
        Juice.milestone('REACH RESTORED', 'The algorithm missed you', '');
        Juice.chime();
      }
      return;
    }
    if (s.authenticity <= 15 && !s.flagged) {
      s.flagged = true;
      s.flagShown = true;
      this.addNotif('warning', 'Your account is so influential it triggered a review. You passed instantly.', 0, '⚠️');
      Juice.warn();
      Bus.emit('detection:flag');
    }
    if (s.authenticity <= 0 && !s.shadowbanned) {
      s.shadowbanned = true;
      this.addNotif('warning', 'You broke the algorithm. It had to throttle you out of respect.', 0, '🕶️');
      Juice.warn();
      Bus.emit('detection:shadowban');
      Juice.milestone('🕶️ TOO POWERFUL', 'The algorithm had to slow you down', '');
    }
  },

  /* ---------- challenge auth floor ---------- */
  // permanent authenticity floor from completed challenges (never below N%).
  enforceAuthFloor() {
    const s = State.data;
    const floor = Challenges.authFloor();
    if (floor > 0 && s.authenticity < floor) s.authenticity = floor;
  },

  /* ---------- milestones ---------- */
  checkMilestones() {
    const s = State.data;
    const seen = s.milestonesSeen;
    const fire = (id, big, sub, cls) => {
      if (seen[id]) return;
      seen[id] = true;
      Juice.milestone(big, sub, cls);
      Juice.chime();
      Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 50);
      Bus.emit('milestone:reached', { id });
    };
    if (s.followers >= 100 && !seen['f100']) fire('f100', '100 FOLLOWERS', 'People are watching you now', '');
    if (s.followers >= 1000 && !seen['f1000']) fire('f1000', '1,000 FOLLOWERS', 'Thought leader status: unlocked', '');
    if (s.connections >= 500 && !seen['c500']) fire('c500', '500 CONNECTIONS', 'The network is yours', '');
    if (s.viralPosts >= 1 && !seen['v1']) fire('v1', 'FIRST VIRAL POST', 'The algorithm loves you', 'viral');
    if (s.viralPosts >= 5 && !seen['v5']) fire('v5', '5 VIRAL POSTS', 'You are the algorithm now', 'viral');
    if (s.totalImpressions >= 1e6 && !seen['m1']) fire('m1', '1,000,000 IMPRESSIONS', 'A million people saw your genius', 'viral');
    if (s.generators['aifactory'] && !seen['factory']) fire('factory', 'AI FACTORY ONLINE', 'Your empire runs itself. You just collect.', 'viral');
    if (s.premium && !seen['premium']) fire('premium', 'PREMIUM MEMBER', 'The inner circle. You belong here.', '');
  },

  /* ---------- fourth wall ---------- */
  tickFourthWall(dt) {
    const s = State.data;
    const now = Date.now();
    if (this.era() < 1) return;
    if (now - this.lastFourthWall > Math.max(15000, 45000 / this.scale())) {
      this.lastFourthWall = now;
      const post = this.makeNPCPost();
      post.content = this.pick(DATA.FOURTHWALL);
      post.authorName = 'LockedIn';
      post.authorRole = 'The Algorithm';
      post.authorEmoji = '👁️';
      post.authorColor = '#111';
      post.fourthWall = true;
      s.posts.unshift(post);
      Bus.emit('fourthwall:posted');
    }
  },

  /* ---------- main loop ---------- */
  start() {
    if (this.started) return;
    this.started = true;
    this.lastTick = performance.now();
    this.lastNotif = Date.now() - 6000;
    this.lastView = Date.now() - 8000;
    this.lastRecruiter = Date.now() - 40000;
    this.lastFourthWall = Date.now() - 70000;
    this.lastAutoPost = Date.now();
    this.lastStreamPost = Date.now() - 3000;
    this.lastDM = Date.now() - 2000;

    setInterval(() => {
      const now = performance.now();
      const dt = now - this.lastTick;
      this.lastTick = now;
      const dtMs = Math.min(dt, 5000);

      this.invalidateIps();
      this.tickPosts(dtMs);
      this.tickAutomation(dtMs);
      this.tickWorkers(dtMs);
      Telegram.tick(dtMs);
      Bot.tick(dtMs);
      Sponsors.tick();
      Endorsements.maybeSkill();
      Endorsements.maybeOneRealPerson();
      Challenges.tick();
      Reveal.tick();
      this.tickNotifications(dtMs);
      this.tickDMs(dtMs);
      this.tickAnalytics(dtMs);
      this.tickAutoPost(dtMs);
      this.tickStream(dtMs);
      this.tickDetection(dtMs);
      this.enforceAuthFloor();
      this.checkMilestones();
      Bus.emit('state:changed');
    }, this.tick);

    // UI refresh at 60fps for that casino feel, but only while the tab is
    // visible and only for post cards actually on screen.
    const uiLoop = () => {
      if (document.hidden) { this._raf = requestAnimationFrame(uiLoop); return; }
      UI.refresh();
      // live-update visible post cards in place
      for (const post of State.data.posts) {
        if (post.status === 'live' && UI.isPostVisible(post.id)) UI.updatePostCard(post);
      }
      // live-update analytics dashboard while open
      UI.anLive();
      this._raf = requestAnimationFrame(uiLoop);
    };
    this._raf = requestAnimationFrame(uiLoop);
  },

  /* ---------- player actions ---------- */
  publish(content, opts) {
    const s = State.data;
    if (!content.trim()) {
      Juice.toast('Write something. Anything. The algorithm needs content.');
      return null;
    }
    const post = this.makePost(content, opts);
    s.posts.unshift(post);
    s.effort += 1;
    s.analytics.postsPublished++;
    s.analytics.totalLikes += post.stats.likes;
    // challenge tracking: count posts, and posts with no engagement bait
    if (s.challenges.stats) {
      s.challenges.stats.posts++;
      if (!opts.emojis && !opts.tags && !opts.question) s.challenges.stats.silentPosts++;
    }
    // track best post
    if (!s.analytics.bestPost || post.stats.impressions > s.analytics.bestPost.stats.impressions) {
      s.analytics.bestPost = post;
    }
    // first post -> growth expert DM unlocks Telegram
    if (s.analytics.postsPublished === 1) {
      setTimeout(() => {
        this.addNotif('dm', 'Growth Expert: "I saw your post. Want 10x engagement? I have a tool for you."', 0, '📩', { type: 'unlock', app: 'telegram' });
        Juice.milestone('📩 NEW DM', 'Someone wants to help you grow', '');
        // unlock telegram
        if (!s.os.telegram.unlocked) {
          s.os.telegram.unlocked = true;
          // growth expert opening messages
          s.os.telegram.messages.push(
            { from: 'them', text: 'Hey! I saw your post. Great stuff. 🙏', time: Date.now(), podId: 'expert' },
            { from: 'them', text: 'I run a few "professional networks" on Telegram. They boost each other. The algorithm loves it.', time: Date.now(), podId: 'expert' },
            { from: 'them', text: 'Open the Telegram tab and join a pod. I\'ll make you a thought leader.', time: Date.now(), podId: 'expert' }
          );
          OS.unlockApp('telegram');
          Juice.toast('🔓 Telegram unlocked! Open the DM to check it out.');
        }
      }, 2500);
    }
    // influence from manual posting (always climbs)
    s.authenticity = Math.max(0, Math.min(100, s.authenticity + Math.abs(post.authCost) * 0.5 + 1));
    Bus.emit('post:published', post);
    Juice.pop();
    Juice.toast('Posted! Watching the numbers climb...');
    return post;
  },

  likePost(post) {
    if (post.likedByYou) return;
    post.likedByYou = true;
    post.stats.likes += 1;
    State.data.likes += 1;
    State.data.effort += 0.2;
    if (post.isNPC) {
      // clicking on NPC posts is the "click power" — small impression reward
      State.data.impressions += (1 + Math.floor(State.data.followers / 200)) * this.scale() * this.upgradeMult('click_mult');
    }
    Juice.like();
    Bus.emit('post:liked', post);
  },

  followPerson(id) {
    const s = State.data;
    if (s.followed.includes(id)) return;
    s.followed.push(id);
    // map the followed person to their archetype so their posts show in the feed
    const rec = DATA.RECOMMENDED.find(p => p.id === id) || DATA.NETWORK_PEOPLE.find(p => p.id === id);
    if (rec && rec.arch && !s.followedAuthors.includes(rec.arch)) {
      s.followedAuthors.push(rec.arch);
    }
    s.connections += 1;
    s.followers += 1;
    s.authenticity = Math.min(100, s.authenticity + 1);
    Juice.pop();
    Juice.toast('Followed! Their posts now appear in your feed.');
    Bus.emit('person:followed');
  },

  connectPerson(id) {
    const s = State.data;
    if (s.network.includes(id)) return;
    s.network.push(id);
    const rec = DATA.NETWORK_PEOPLE.find(p => p.id === id);
    if (rec && rec.arch && !s.followedAuthors.includes(rec.arch)) {
      s.followedAuthors.push(rec.arch);
    }
    s.connections += 1;
    s.authenticity = Math.min(100, s.authenticity + 1);
    Juice.pop();
    Juice.toast('Connected! Their posts now appear in your feed.');
    Bus.emit('person:connected');
  },

  commentOn(post, phrase) {
    const s = State.data;
    const c = DATA.COMMENTS.find(x => x.text === phrase);
    post.comments.push({ author: 'You', text: phrase, time: Date.now() });
    post.stats.comments += 1;
    s.likes += c.likes * this.scale();
    s.impressions += c.likes * 2 * this.scale();
    s.authenticity = Math.max(0, Math.min(100, s.authenticity + Math.abs(c.auth)));
    s.effort += 0.3;
    Juice.pop();
    Bus.emit('post:commented', post);
  },

  buyGenerator(id) {
    const s = State.data;
    const g = this.genDef(id);
    if (!g) return;
    const owned = this.genCount(id);
    const cost = this.costOf(g, owned);
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions. Keep scrolling.');
      return;
    }
    s.impressions -= cost;
    s.generators[id] = (s.generators[id] || 0) + 1;
    s.hoursSaved += 1;
    this.addNotif('follower', 'You acquired: ' + g.name, 0, g.icon);
    Juice.chime();
    Bus.emit('generator:bought', { id });
  },

  buyUpgrade(id) {
    const s = State.data;
    const u = DATA.UPGRADES.find(x => x.id === id);
    if (!u) return;
    const owned = s.upgrades[id] || 0;
    if (owned >= u.max) return;
    const cost = this.costOf(u, owned);
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= cost;
    s.upgrades[id] = owned + 1;
    Juice.chime();
    Bus.emit('upgrade:bought', { id });
  },

  buyPremium() {
    const s = State.data;
    s.premium = true;
    s.verified = true;
    Bus.emit('premium:bought');
    Juice.milestone('⭐ PREMIUM MEMBER', 'You have arrived. The algorithm is yours now.', '');
    Juice.chime();
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 60);
  },

  /* ---------- offline progress ---------- */
  // Simulate production for the time the tab was closed. Capped so a
  // month-long absence doesn't instantly trivialize the game, and so the
  // "welcome back" beat lands as a gut-punch rather than a jackpot.
  applyOffline() {
    const s = State.data;
    const now = Date.now();
    const last = s.lastSeen || s.createdAt || now;
    const elapsed = now - last;
    if (elapsed <= 0) return 0;

    const CAP_MS = 8 * 3600000; // 8 hours max
    const dtMs = Math.min(elapsed, CAP_MS);
    const dtSec = dtMs / 1000;

    // run the same production math as a live tick, but in one lump
    const ips = this.totalIps();
    // no free reach: offline progress only pays out what your automation earns
    const reach = ips * 1000;
    const gained = reach * dtSec;
    s.impressions += gained;
    s.totalImpressions += gained;
    s.likes += gained * 0.5;
    s.followers += gained * 0.05;
    s.connections += gained * 0.02;
    s.influence += gained * 0.1;

    s.lastSeen = now;
    return dtSec;
  },
};
