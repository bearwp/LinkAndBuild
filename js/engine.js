/* ============================================================
   LINK & BUILD — Game Engine
   Game loop, engagement math, automation, detection, notifications.
   ============================================================ */

const Engine = {
  tick: 100,
  lastTick: 0,
  lastSave: 0,
  lastNotif: 0,
  lastFollower: 0,
  lastView: 0,
  lastRecruiter: 0,
  lastAutoPost: 0,
  lastFourthWall: 0,
  lastDM: 0,
  started: false,

  /* ---------- helpers ---------- */
  rnd(a, b) { return a + Math.random() * (b - a); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  },

  // fmt that ticks visibly every frame (more decimals)
  fmtTick(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return Math.floor(n).toString();
  },

  /* ---------- generator math ---------- */
  genDef(id) { return DATA.GENERATORS.find(g => g.id === id); },
  genCount(id) { return State.data.generators[id] || 0; },

  totalIps() {
    const s = State.data;
    let ips = 0;
    for (const g of DATA.GENERATORS) {
      const n = s.generators[g.id] || 0;
      if (n > 0) ips += g.prod * n;
    }
    // upgrades multiplier
    let mult = 1;
    if (s.upgrades['synergy']) mult *= 1.1;
    if (s.upgrades['humble']) mult *= 1.15;
    ips *= mult;
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
    return ips;
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

    const base = 50 + s.followers * 1.5 + s.connections * 0.5;
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
    if (post.authorId === 'you' && s.shadowbanned) rate *= 0.15;
    return rate;
  },

  tickPosts(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    for (const post of s.posts) {
      if (post.status !== 'live') continue;
      const rate = this.postRate(post, s);
      const imp = rate * dtSec;
      post.stats.impressions += imp;
      s.impressions += imp;
      s.totalImpressions += imp;
      // likes/comments trickle proportional to impressions
      const likeRate = imp * 0.04;
      post.stats.likes += likeRate;
      s.likes += likeRate;
      // reposts trickle in too
      post.stats.shares += imp * 0.008;
      // spawn real comments fast
      const commentChance = imp * 0.12 * dtSec;
      if (Math.random() < commentChance && post.comments.length < 30) {
        post.stats.comments += 1;
        const c = this.pick(DATA.COMMENTERS);
        post.comments.push({
          author: c.name,
          role: c.role,
          emoji: c.emoji,
          color: c.color,
          text: this.pick(c.phrases),
          time: Date.now(),
        });
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
      if (n > 0) ips += w.prod * n * (1 + this.workerIntensity(w.id) * 0.5);
    }
    return ips;
  },

  hireWorker(id) {
    const s = State.data;
    const w = this.workerDef(id);
    if (!w) return;
    const owned = this.workerCount(id);
    const cost = Math.floor(w.cost * Math.pow(1.3, owned));
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
    UI.renderGrowth();
    UI.renderDMs();
    UI.refresh();
  },

  setIntensity(id, val) {
    const s = State.data;
    if (!s.workers[id]) return;
    s.workers[id].intensity = Math.max(0, Math.min(3, val));
    const w = this.workerDef(id);
    const msgs = ['Chill mode. Slow and natural.', 'Normal pace. Steady engagement.', 'High gear. Lots of activity.', 'MAXIMUM OVERDRIVE. The algorithm will notice.'];
    if (s.workerChats[id]) s.workerChats[id].push({ from: 'them', text: msgs[val] + ' (' + w.name + ')', time: Date.now() });
    UI.renderGrowth();
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
    UI.renderGrowth();
    UI.renderDMs();
    UI.refresh();
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
      if (cmdId === 'like') { s.likes += 5 * this.workerCount(id); s.impressions += 20 * this.workerCount(id); }
      if (cmdId === 'comment') { s.impressions += 30 * this.workerCount(id); }
      if (cmdId === 'follow') { s.followers += 1 * this.workerCount(id); }
      if (cmdId === 'pay') { s.authenticity = Math.min(100, s.authenticity + 2); }
      if (cmdId === 'fire') { this.fireWorker(id); }
      UI.renderMessaging();
      UI.renderDMs();
      Juice.pop();
    }, 700);
    UI.renderMessaging();
    UI.renderDMs();
    Juice.pop();
  },

  /* ---------- worker production tick ---------- */
  tickWorkers(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    const ips = this.workerIps();
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
    if (Math.random() < dtSec * 0.3) {
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
    if (now - lastSample > 5000) {
      a._lastSample = now;
      a.history.push({
        t: now,
        impressions: s.impressions,
        likes: s.likes,
        followers: s.followers,
        ips: this.totalIps(),
      });
      if (a.history.length > 200) a.history.shift();
    }
  },

  /* ---------- automation ---------- */
  tickAutomation(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    const ips = this.totalIps();
    s.impressions += ips * dtSec;
    s.totalImpressions += ips * dtSec;
    // likes trickle
    const likes = ips * dtSec * 0.05;
    s.likes += likes;
    // followers grow with automation
    const followerGain = ips * dtSec * 0.001;
    s.followers += followerGain;
    // connections trickle in too (every number on screen should climb)
    s.connections += ips * dtSec * 0.0004;
    // influence accrues slowly from reach (the real "score")
    s.influence += ips * dtSec * 0.002;
    // influence climbs with automation (you are thriving)
    for (const g of DATA.GENERATORS) {
      const n = s.generators[g.id] || 0;
      if (n > 0) s.authenticity += Math.abs(g.auth) * n * dtSec;
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
    UI.updateBell();
    Juice.bellPop();
    Juice.ding();
  },

  tickNotifications(dt) {
    const s = State.data;
    const now = Date.now();
    const rate = s.premium ? 1.6 : 1;
    // profile views (golden cookie-ish)
    if (now - this.lastView > (2000 / rate) && !s.shadowbanned) {
      this.lastView = now;
      const reward = Math.floor(this.rnd(5, 20) * (1 + s.followers / 500));
      s.impressions += reward;
      this.addNotif('view', this.pick(DATA.NOTIFS.view), reward, '👀');
    }
    // generic notifications
    if (now - this.lastNotif > (1500 / rate)) {
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
    if (now - this.lastRecruiter > 12000 && s.followers > 20) {
      this.lastRecruiter = now;
      this.addNotif('recruiter', this.pick(DATA.NOTIFS.recruiter), Math.floor(this.rnd(50, 150)), '🚨');
      Juice.milestone('🚨 RECRUITER DM', 'You\'ve made it. They want you.', 'viral');
    }
  },

  /* ---------- incoming DMs (side panel spam) ---------- */
  tickDMs(dt) {
    const s = State.data;
    const now = Date.now();
    // DMs stream in faster as you grow — the more influence, the more opportunities
    const base = 4000;
    const interval = Math.max(1200, base - s.followers * 2 - s.connections * 1.5);
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
      if (s.dms.length > 40) s.dms.pop();
      UI.renderDMs();
      Juice.ding();
    }
  },

  /* ---------- auto posting (AI factory) ---------- */
  tickAutoPost(dt) {
    const s = State.data;
    if (!s.generators['aifactory']) return;
    const now = Date.now();
    const interval = 10000; // every 10s the factory posts
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
      UI.renderFeed();
      UI.updatePostCard(post);
      Juice.toast('🤖 AI Factory published a post for you');
    }
  },

  /* ---------- fast NPC post streamer (casino feed) ---------- */
  lastStreamPost: 0,
  tickStream(dt) {
    const s = State.data;
    const now = Date.now();
    const interval = 800; // a new post every 0.8s (bounded by trimPosts)
    if (now - this.lastStreamPost > interval) {
      this.lastStreamPost = now;
      const post = this.makeNPCPost();
      s.posts.unshift(post);
      this.trimPosts();
      UI.renderFeed();
    }
  },

  // keep the post array bounded so the tick loops stay cheap
  trimPosts() {
    const s = State.data;
    const MAX = 60;
    if (s.posts.length <= MAX) return;
    // keep all player posts, drop oldest NPC posts beyond the cap
    const yours = s.posts.filter(p => p.authorId === 'you');
    const npcs = s.posts.filter(p => p.authorId !== 'you');
    const keep = MAX - yours.length;
    if (keep < 0) {
      s.posts = yours.slice(0, MAX);
    } else {
      s.posts = yours.concat(npcs.slice(0, keep));
    }
  },

  /* ---------- detection (reframed: the algorithm adores you) ---------- */
  tickDetection(dt) {
    const s = State.data;
    if (s.shadowbanned) {
      // you're so big the algorithm had to throttle you — but you always bounce back
      if (s.authenticity >= 60) {
        s.shadowbanned = false;
        UI.hideShadowban();
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
      UI.showFlag();
    }
    if (s.authenticity <= 0 && !s.shadowbanned) {
      s.shadowbanned = true;
      this.addNotif('warning', 'You broke the algorithm. It had to throttle you out of respect.', 0, '🕶️');
      Juice.warn();
      UI.showShadowban();
      Juice.milestone('🕶️ TOO POWERFUL', 'The algorithm had to slow you down', '');
    }
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
    if (now - this.lastFourthWall > 45000) {
      this.lastFourthWall = now;
      const post = this.makeNPCPost();
      post.content = this.pick(DATA.FOURTHWALL);
      post.authorName = 'LinkedIn';
      post.authorRole = 'The Algorithm';
      post.authorEmoji = '👁️';
      post.authorColor = '#111';
      post.fourthWall = true;
      s.posts.unshift(post);
      UI.renderFeed();
    }
  },

  /* ---------- main loop ---------- */
  start() {
    if (this.started) return;
    this.started = true;
    this.lastTick = performance.now();
    this.lastSave = Date.now();
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

      this.tickPosts(dtMs);
      this.tickAutomation(dtMs);
      this.tickWorkers(dtMs);
      Telegram.tick(dtMs);
      Bot.tick(dtMs);
      this.tickNotifications(dtMs);
      this.tickDMs(dtMs);
      this.tickAnalytics(dtMs);
      this.tickAutoPost(dtMs);
      this.tickStream(dtMs);
      this.tickDetection(dtMs);
      this.checkMilestones();

      // autosave every 10s
      if (Date.now() - this.lastSave > 10000) {
        this.lastSave = Date.now();
        State.save();
      }
    }, this.tick);

    // UI refresh at 60fps for that casino feel
    setInterval(() => {
      UI.refresh();
      // live-update visible post cards in place
      for (const post of State.data.posts) {
        if (post.status === 'live') UI.updatePostCard(post);
      }
    }, 16);
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
    UI.renderFeed();
    UI.updatePostCard(post);
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
      State.data.impressions += 1 + Math.floor(State.data.followers / 200);
    }
    Juice.like();
    UI.updatePostCard(post);
  },

  followPerson(id) {
    const s = State.data;
    if (s.followed.includes(id)) return;
    s.followed.push(id);
    s.connections += 1;
    s.followers += 1;
    s.authenticity = Math.min(100, s.authenticity + 1);
    Juice.pop();
    Juice.toast('Followed! Your network just got a little bigger.');
    UI.renderRecommended();
    UI.refresh();
  },

  commentOn(post, phrase) {
    const s = State.data;
    const c = DATA.COMMENTS.find(x => x.text === phrase);
    post.comments.push({ author: 'You', text: phrase, time: Date.now() });
    post.stats.comments += 1;
    s.likes += c.likes;
    s.impressions += c.likes * 2;
    s.authenticity = Math.max(0, Math.min(100, s.authenticity + Math.abs(c.auth)));
    s.effort += 0.3;
    Juice.pop();
    UI.updatePostCard(post);
  },

  buyGenerator(id) {
    const s = State.data;
    const g = this.genDef(id);
    if (!g) return;
    const cost = g.cost * Math.pow(1.15, this.genCount(id));
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions. Keep scrolling.');
      return;
    }
    s.impressions -= cost;
    s.generators[id] = (s.generators[id] || 0) + 1;
    s.hoursSaved += 1;
    this.addNotif('follower', 'You acquired: ' + g.name, 0, g.icon);
    Juice.chime();
    UI.renderGrowth();
    UI.refresh();
  },

  buyUpgrade(id) {
    const s = State.data;
    const u = DATA.UPGRADES.find(x => x.id === id);
    if (!u) return;
    const owned = s.upgrades[id] || 0;
    if (owned >= u.max) return;
    const cost = u.cost * Math.pow(1.5, owned);
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= cost;
    s.upgrades[id] = owned + 1;
    Juice.chime();
    UI.renderGrowth();
    UI.refresh();
  },

  buyPremium() {
    const s = State.data;
    s.premium = true;
    s.verified = true;
    UI.hideModal('premium-modal');
    Juice.milestone('⭐ PREMIUM MEMBER', 'You have arrived. The algorithm is yours now.', '');
    Juice.chime();
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 60);
    UI.refresh();
  },

  /* ---------- offline progress ---------- */
  applyOffline() {
    const s = State.data;
    const now = Date.now();
    const away = Math.max(0, (now - s.lastSaved) / 1000);
    if (away < 20) return;
    const ips = this.totalIps();
    const gained = ips * away * 0.8; // 80% efficiency offline
    if (gained > 10) {
      s.impressions += gained;
      s.totalImpressions += gained;
      s.followers += gained * 0.0005;
      setTimeout(() => {
        Juice.milestone('WHILE YOU WERE AWAY', '+' + this.fmt(gained) + ' impressions', '');
        Juice.chime();
      }, 800);
    }
  },
};
