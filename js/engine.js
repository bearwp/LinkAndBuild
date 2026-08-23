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

  // aura — the single scalar that tracks how big you feel, 0.0 (pauper) to
  // 1.0 (god). It is the presentation's one source of truth for the whole
  // pauper→god arc: avatar ornamentation, ambient glow, feed warmth, and the
  // juice magnitude all read off this. It scales on a log-ish curve so early
  // followers feel like nothing and late followers feel like ascendancy —
  // mirroring the "nobody" multiplier: reach is earned, not given.
  aura() {
    const s = State.data;
    const f = s.followers || 0;
    if (f <= 0) return 0;
    // 1 → ~0.25, 10 → ~0.5, 100 → 0.75, 1000 → 1.0; caps at god tier
    return Math.min(1, Math.log10(1 + f) / 3);
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
  costOf(def, owned) {
    const c = def && def.cost;
    if (c && typeof c === 'object') {
      return Math.floor(c.base * Math.pow(c.growth || 1, owned || 0));
    }
    return Math.floor(c || 0); // legacy scalar cost
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

  // cached per-second production; recomputed once per simulation tick
  _rateCache: null,
  _ipsDirty: true,
  invalidateIps() { this._ipsDirty = true; },

  // Every generator's per-second output, summed and reported per named number.
  // A generator's `out` field says exactly what it makes (impressions/sec,
  // likes/sec, followers/sec) and nothing is derived from another counter via
  // a hidden coefficient. The player's whole economy is this table.
  rates() {
    if (!this._ipsDirty) return this._rateCache;
    const s = State.data;
    const r = { imp: 0, like: 0, follow: 0 };
    for (const g of DATA.GENERATORS) {
      const n = s.generators[g.id] || 0;
      if (n <= 0) continue;
      const out = g.out || {};
      r.imp += (out.imp || 0) * n;
      r.like += (out.like || 0) * n;
      r.follow += (out.follow || 0) * n;
    }
    // upgrades multiplier (generic: sums every owned gen_mult upgrade)
    const gmult = this.upgradeMult('gen_mult');
    r.imp *= gmult;
    r.like *= gmult;
    r.follow *= gmult;
    // premium
    if (s.premium) { r.imp *= 1.5; r.like *= 1.5; }
    // shadowban throttle
    if (s.shadowbanned) { r.imp *= 0.2; r.like *= 0.2; r.follow *= 0.2; }
    // prestige: permanent reach multiplier (brand equity)
    r.imp *= Prestige.multiplier('reach');
    // challenge rewards: permanent reach multiplier
    r.imp *= 1 + Challenges.reward('reach');
    this._rateCache = r;
    this._ipsDirty = false;
    return this._rateCache;
  },

  // legacy alias — impressions per second from generators
  totalIps() {
    return this.rates().imp;
  },

  // The factory pipeline — the honest per-second rates, shown verbatim. The
  // "assembly line" the player sees is exactly this: what each generator says
  // it produces, summed. No coefficients, no derivation.
  pipeline() {
    const r = this.rates();
    return {
      ips: r.imp,
      impressions: r.imp,
      likes: r.like,
      comments: r.imp * 0.1,
      shares: r.imp * 0.05,
      followers: r.follow,
      connections: r.imp * 0.03,
      influence: r.imp * 0.2,
    };
  },

  // which generator (if any) currently owns each gate of the distribution loop.
  // A gate has a "handler": either YOU (the hand, still doing it yourself) or a
  // machine you bought to delegate that step of the pipeline. This is the
  // "do once, then delegate" made visible — every stage shows who's doing it.
  gates() {
    const s = State.data;
    const owned = id => (s.generators[id] || 0) > 0;
    // each gate's handler is the highest-tier owned generator for that gate
    const resolve = gate => {
      const gens = DATA.GENERATORS.filter(g => (g.gate === gate) && owned(g.id));
      if (!gens.length) return null;
      // highest tier wins (the "outermost" machine supersedes the inner ones)
      gens.sort((a, b) => b.tier - a.tier);
      return gens[0];
    };
    return {
      content:  resolve('content')  || { hand: true, name: 'You write' },
      audience: resolve('reach')    || { hand: true, name: 'You follow' },
      engage:   resolve('engage')   || { hand: true, name: 'You reply' },
      schedule: resolve('schedule') || { hand: true, name: 'You post by hand' },
    };
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
    // tags: the semantic vocabulary of the post. If provided, they drive the
    // quality multiplier (postMult) and are spent from the bucket.
    const tagIds = opts.tags ? (Array.isArray(opts.tags) ? opts.tags : [opts.tags]) : [];
    const tagMult = tagIds.length ? Tags.postMult(tagIds) : 1;
    const potential = (template ? template.potential : 1) *
      (1 + (opts.emojis || 0) * 0.08) *
      (opts.question ? 1.2 : 1) *
      (opts.potentialMult || 1) *
      tagMult *
      (opts.format === 'carousel' ? 1.3 : opts.format === 'poll' ? 1.1 : opts.format === 'video' ? 1.2 : opts.format === 'photo' ? 1.15 : 1);
    const rarity = this.rollRarity(potential);

    // A post's seed reach is its own honest rate: how many people it reaches
    // per second, driven by the audience you've actually built. A nobody with
    // zero followers reaches nobody — no floor, no pity impressions. You only
    // get reach once you've built a network. The generator ladder (imp/s) is
    // the *passive* economy; a post is the *active* burst. Both are raw counts.
    const base = (s.followers * 0.1 + s.connections * 0.1) * this.upgradeMult('post_mult') * (1 + Challenges.reward('postMult'));
    const authCost = (template ? template.auth : 0) + (opts.emojis || 0) * -0.5 + (opts.question ? -1 : 0) + (opts.format === 'carousel' ? -2 : 0);

    const post = {
      id: 'p' + Date.now() + Math.floor(Math.random() * 9999),
      authorId: 'you',
      content: content,
      template: template ? template.id : null,
      format: opts.format || 'text',
      emojis: opts.emojis || 0,
      tagged: opts.tagged || 0,
      question: !!opts.question,
      tags: tagIds,
      potential: potential,
      rarity: rarity,
      base: base,
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

  makeNPCPost(archId, person) {
    const arch = archId ? DATA.ARCHETYPES.find(a => a.id === archId) : this.pickWeighted(DATA.ARCHETYPES, a => a.weight);
    const content = this.pick(arch.posts);
    const rarity = this.rollRarity(1 + Math.random() * 1.5);
    const base = arch.influence || 10;
    // tags: the archetype's tag pool, sampled so each post carries just 1-2
    const tagPool = arch.tags && arch.tags.length ? arch.tags : ['great-post'];
    const nTags = 1 + ((Math.random() * 2) | 0);
    const tags = [];
    for (let i = 0; i < nTags; i++) tags.push(tagPool[(Math.random() * tagPool.length) | 0]);
    return {
      id: 'n' + Date.now() + Math.floor(Math.random() * 9999),
      authorId: arch.id,
      content: content,
      template: null,
      format: 'text',
      rarity: rarity,
      base: base,
      tags: tags,
      stats: { impressions: 0, likes: 0, comments: 0, shares: 0 },
      publishedAt: Date.now(),
      status: 'live',
      isNPC: true,
      // A single archetype can back several people (e.g. 'greatpost' → 4
      // different accounts). When we know which person is posting, show their
      // identity — not the shared archetype name like "Comment King".
      authorName: person ? person.name : arch.name,
      authorRole: person ? person.role : arch.role,
      authorEmoji: person ? person.emoji : arch.emoji,
      authorColor: person ? person.color : arch.color,
      authorPersonId: person ? person.id : null,
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

  /* ---------- distribution loop ---------- */
  // The honest LinkedIn model, from the diagram:
  //
  //   POST → small audience → does it get engagement? → engagement signals
  //   relevance → expand distribution → new audience → more engagement → ...
  //
  // This is NOT a flat drip of impressions. A post starts with a seed audience
  // (its base). Each viewer engages at a rarity-driven "resonance" rate. That
  // engagement is what EARNS more reach: the post expands to each engager's
  // network. The reach then fades as the post ages out of the feed. So a post
  // that resonates compounds; a boring post just trickles and dies. Engagement
  // is the *cause* of distribution, not a side effect of impressions.

  audienceMult(s) {
    // how reachable you are: every follower and connection you've actually
    // built is a real viewer. A nobody with a handful of followers reaches
    // almost nobody; a growing network carries the post. No cap, no curve —
    // it is literally the people you have.
    return 1 + s.followers * 0.1 + s.connections * 0.1;
  },

  // how long (seconds) a post stays "new" enough to keep its reach alive.
  // Past this the feed has moved on and the post just sits.
  POST_LIFESPAN: 240,

  stepPost(post, s, dtSec) {
    // lazily seed reach for old saves / new posts: the post's own audience.
    // Your posts reach your network; NPC posts reach their own influence.
    if (post.reach == null) {
      const seed = post.authorId === 'you' ? post.base * this.audienceMult(s) : post.base;
      post.reach = seed;
    }

    // the audience that sees it this second, fading as the post ages out of
    // the feed. Reach is a raw viewer count — it does not expand or compound.
    const ageSec = (Date.now() - post.publishedAt) / 1000;
    const freshness = Math.max(0, 1 - ageSec / this.POST_LIFESPAN);
    const viewers = post.reach * freshness * dtSec;

    // each viewer engages at a flat, honest rate — a fraction like, a smaller
    // fraction comment, a sliver share. No rarity multipliers.
    const likes = viewers * 0.1;
    const comments = viewers * 0.03;
    const shares = viewers * 0.01;
    const engaged = likes + comments + shares;

    return { viewers, engaged, likes, comments, shares, reach: post.reach };
  },

  // per-tick chance a post "goes viral" — the variable-ratio jackpot. The odds
  // scale with how fast the post is already moving and with rarity (the
  // fiction: the rarity draw IS the odds), plus a small baseline so even a
  // trickle of impressions can pop. A cooldown keeps one post from chain-
  // bursting, so it lands as a surprise, not a metronome.
  viralChance(post, imp) {
    if (post._lastViral && Date.now() - post._lastViral < 7000) return 0;
    // rarity is the odds: a legendary draw is more likely to catch. No flow
    // term — a post's chance doesn't inflate with how many people saw it.
    const rarityBoost = { legendary: 4, epic: 2.5, rare: 1.4, uncommon: 0.9, common: 0.6 }[post.rarity] || 0.6;
    return Math.min(0.4, 0.0005 * rarityBoost);
  },

  // the "jokers" that multiplied a post's impressions — the modifier chain.
  // Each chip is a real multiplier in play, shown in the order it fired. No
  // hidden scale term.
  comboChain(post) {
    const s = State.data;
    const chips = [];
    // rarity (the draw)
    const rarityBoost = { legendary: 4, epic: 2.5, rare: 1.4, uncommon: 0.9 }[post.rarity];
    if (rarityBoost > 1) {
      chips.push({ icon: '🎲', label: 'RARITY', text: '×' + rarityBoost });
    }
    // post multiplier (upgrades)
    const postMult = this.upgradeMult('post_mult');
    if (postMult > 1) {
      chips.push({ icon: '📈', label: 'POST MULT', text: '×' + postMult.toFixed(1) });
    }
    // audience reach (the people you've actually built)
    const audience = this.audienceMult(s);
    if (audience > 1) {
      chips.push({ icon: '👥', label: 'AUDIENCE', text: '×' + audience.toFixed(1) });
    }
    return chips;
  },

  tickPosts(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    for (const post of s.posts) {
      if (post.status !== 'live') continue;
      // NPC posts are world texture, but they only earn once you've chosen to
      // follow their archetype — the feed shows only followed authors, so an
      // unfollowed NPC post ticking would be an invisible, compounding number
      // with no cause on screen. Their cards stay frozen at 0 until you follow
      // them, at which point the distribution loop starts and you watch it.
      const isNPC = post.authorId !== 'you';
      if (isNPC && !(s.followedAuthors || []).includes(post.authorId)) continue;
      // the distribution loop: reach → viewers → engagement → expand reach
      const step = this.stepPost(post, s, dtSec);
      const imp = step.viewers;                     // people who saw it this tick
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
      // viral burst: the moment the post's network shares it out — one extra
      // wave of the audience that's already reading it. A real count, not an
      // arbitrary jackpot.
      if (Math.random() < this.viralChance(post, imp)) {
        post._lastViral = Date.now();
        const burst = post.reach;
        post.stats.impressions += burst;
        if (yours) {
          s.impressions += burst;
          s.totalImpressions += burst;
          Bus.emit('post:viral', post);
        }
      }
      // likes/comments/shares come from the distribution step (weighted): a
      // view spawns engagement, and stronger engagement spawns more reach.
      post.stats.likes += step.likes;
      post.stats.comments += step.comments;
      post.stats.shares += step.shares;
      if (yours) {
        s.likes += step.likes;
        s.totalLikes += step.likes;
      }
      // spawn real comments fast
      const commentChance = imp * 0.12 * dtSec;
      if (Math.random() < commentChance && post.comments.length < 30) {
        post.stats.comments += 1;
        // NPC posts draw comments from their own archetype's comment pool,
        // so comments read differently from the post body.
        const arch = post.isNPC ? DATA.ARCHETYPES.find(a => a.id === post.authorId) : null;
        const c = this.pick(DATA.COMMENTERS);
        const text = arch && arch.comments.length ? this.pick(arch.comments) : this.pick(c.phrases);
        post.comments.push({
          author: c.name,
          role: c.role,
          emoji: c.emoji,
          color: c.color,
          text: text,
          time: Date.now(),
          troll: false,
        });
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
      // mutual engagement: the people you actually built relationships with
      // reciprocate. Their likes/comments are the "relationship" feeling — a
      // warm audit trail that only fades once the generator ladder makes real
      // people obsolete. Scales with how many relationships you have, and it
      // is what automation later silently replaces with bots.
      if (yours) {
        const rels = s.followedAuthors.length + s.network.length;
        if (rels > 0 && Math.random() < dtSec * rels * 0.015) {
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
    // Manual-first: the feed is quiet until you buy automation. Numbers climb
    // at exactly the per-second rates your generators publish — nothing is
    // derived from another counter.
    const rate = this.rates();
    const imp = rate.imp * dtSec;
    s.impressions += imp;
    s.totalImpressions += imp;
    s.likes += rate.like * dtSec;
    s.followers += rate.follow * dtSec * (1 + Challenges.reward('followers'));
    s.connections += rate.imp * dtSec * 0.03;
    s.influence += rate.imp * dtSec * 0.2 + rate.like * dtSec * 0.5;
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

  /* ---------- idle bots (automate everything except money) ---------- */
  // Bots are the idle layer. They automate the manual loops: scrolling
  // (absorb tags), posting (spend tags), and engaging (build rapport).
  // You can never automate money — opportunities must be taken by hand.
  tickBots(dt) {
    const s = State.data;
    const dtSec = dt / 1000;
    const b = s.bots || { scroll: 0, post: 0, engage: 0 };

    // scroll bot: auto-harvests tags from followed posts (skips ones you've
    // already harvested, and marks the ones it takes as spent)
    if (b.scroll > 0) {
      const npcs = s.posts.filter(p => p.isNPC && s.followedAuthors.includes(p.authorId) && !p._absorbed);
      const rate = Math.min(1, b.scroll * 0.15 * dtSec);
      let absorbed = 0;
      for (let i = 0; i < Math.ceil(rate * npcs.length); i++) {
        const p = npcs[(Math.random() * npcs.length) | 0];
        if (p && p.tags && p.tags.length) {
          p._absorbed = true;
          absorbed += Tags.absorb(p);
        }
      }
      if (absorbed > 0) s.bucket.total += 0; // absorb already counts total
    }

    // post bot: spends bucket tags to auto-publish posts
    if (b.post > 0 && Tags.count() >= 2) {
      const rate = b.post * 0.05 * dtSec; // ~1 post per 20s per bot
      if (Math.random() < rate) {
        const n = 2 + ((Math.random() * 2) | 0);
        const ids = Tags.pick(n);
        if (ids.length >= 2) {
          const text = Tags.buildText(ids);
          const post = this.makePost(text, { tags: ids, format: 'text', source: 'bot' });
          Tags.spend(ids);
          s.posts.unshift(post);
          s.analytics.postsPublished++;
          Bus.emit('post:autoposted', post);
        }
      }
    }

    // engage bot: likes/comments on followed posts, building rapport
    if (b.engage > 0) {
      const npcs = s.posts.filter(p => p.isNPC && s.followedAuthors.includes(p.authorId) && !p.likedByYou);
      const rate = b.engage * 0.2 * dtSec;
      if (npcs.length && Math.random() < rate) {
        const p = npcs[(Math.random() * npcs.length) | 0];
        p.likedByYou = true;
        p.stats.likes += 1;
        s.likes += 1;
        this.buildRapport(p.authorId, 1);
        Bus.emit('post:liked', p);
      }
    }

    // influence bot: converts your reach into influence automatically. This
    // is the "automate influence" beat — but it never touches money.
    if (b.influence > 0) {
      const rate = b.influence * 0.1 * dtSec;
      s.influence += s.impressions * rate * 0.001;
    }
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
    // reactions come from your automation: more generators = more engagement
    // landing on your posts.
    const rate = Math.max(1, src.gens) * (s.premium ? 1.5 : 1);
    // profile views (golden cookie-ish)
    if (now - this.lastView > Math.max(500, 2000 / rate) && !s.shadowbanned) {
      this.lastView = now;
      const reward = Math.floor(this.rnd(5, 20) * (1 + s.followers / 500));
      s.impressions += reward;
      this.addNotif('view', this.pick(DATA.NOTIFS.view), reward, '👀');
    }
    // generic notifications
    if (now - this.lastNotif > Math.max(500, 1500 / rate)) {
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
    if (now - this.lastRecruiter > Math.max(5000, 12000) && s.followers > 20) {
      this.lastRecruiter = now;
      this.addNotif('recruiter', this.pick(DATA.NOTIFS.recruiter), Math.floor(this.rnd(50, 150)), '🚨');
      Juice.milestone('🚨 RECRUITER DM', 'You\'ve made it. They want you.', 'viral');
    }
  },

  /* ---------- auto posting (AI factory) ---------- */
  tickAutoPost(dt) {
    const s = State.data;
    if (!s.generators['aifactory']) return;
    const now = Date.now();
    const interval = Math.max(500, 10000); // every 10s the factory posts
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

  /* ---------- followed-author post streamer ---------- */
  // Everyone you follow posts on their own cadence (a few seconds apart,
  // randomly jittered). The feed lives on the rhythm of the people you've
  // chosen to follow — not on how many generators you've bought.
  _followPostAt: {}, // authorId -> next ms timestamp
  // Resolve which real person backs an archetype (for attribution). Multiple
  // accounts can share an archetype, so pick from the ones the player actually
  // follows/connects with; fall back to any person on that archetype.
  personForArch(archId) {
    const s = State.data;
    const wanted = [];
    const pool = DATA.RECOMMENDED.concat(DATA.NETWORK_PEOPLE);
    for (const p of pool) if (p.arch === archId) wanted.push(p);
    if (!wanted.length) return null;
    // prefer someone the player follows, then connects with, else any
    const mine = wanted.filter(p => s.followed.includes(p.id));
    if (mine.length) return mine[(Math.random() * mine.length) | 0];
    const net = wanted.filter(p => s.network.includes(p.id));
    if (net.length) return net[(Math.random() * net.length) | 0];
    return wanted[(Math.random() * wanted.length) | 0];
  },
  tickStream(dt) {
    const s = State.data;
    const now = Date.now();
    const followed = s.followedAuthors || [];
    if (!followed.length) return;
    for (const authorId of followed) {
      const at = this._followPostAt[authorId];
      if (at !== undefined && now < at) continue;
      // random gap per person, so the feed flows without flooding
      this._followPostAt[authorId] = now + 6000 + Math.random() * 9000;
      const person = this.personForArch(authorId);
      const post = this.makeNPCPost(authorId, person);
      s.posts.unshift(post);
      this.trimPosts();
      Bus.emit('post:streamed', { post });
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
    return gens;
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
  //   generators -> inbound DMs and notifications (your machine draws spam)
  sources() {
    const s = State.data;
    const gens = Object.values(s.generators).reduce((a, b) => a + b, 0);
    return { gens };
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
    if (now - this.lastFourthWall > Math.max(15000, 45000)) {
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

    setInterval(() => {
      const now = performance.now();
      const dt = now - this.lastTick;
      this.lastTick = now;
      const dtMs = Math.min(dt, 5000);

      this.invalidateIps();
      this.tickPosts(dtMs);
      this.tickAutomation(dtMs);
      this.tickBots(dtMs);
      this.tickBotMaintenance(dtMs);
      Sponsors.tick();
      Endorsements.maybeSkill();
      Endorsements.maybeOneRealPerson();
      Challenges.tick();
      Reveal.tick();
      this.tickNotifications(dtMs);
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
      // live-update the factory assembly line while the growth console is open
      UI.factoryLive();
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
    // spend the tags the post uses from the bucket (if any were provided)
    if (post.tags && post.tags.length) Tags.spend(post.tags);
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
    // first post -> the algorithm notices you (a warm DM opens the loop)
    if (s.analytics.postsPublished === 1) {
      setTimeout(() => {
        this.addNotif('dm', 'The Algorithm: "You posted. The market responded."', 0, '👁️');
        Juice.milestone('👁️ THE ALGORITHM NOTICES', 'It does not like everyone. Keep going.', '');
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
      // clicking on NPC posts is the "click power" — a single impression
      State.data.impressions += this.upgradeMult('click_mult');
      // liking builds rapport with the author — the seed of a relationship
      this.buildRapport(post.authorId, 1);
      // engaging is how a nobody becomes known: each like earns a little
      // influence, so you can climb into someone's league and get followed back
      State.data.influence += 1;
    }
    // onboarding: your first like is the first beat of the arc
    if (!State.data.onboarding.firstLike) {
      State.data.onboarding.firstLike = true;
      Bus.emit('onboarding:first-like', post);
    }
    Juice.like();
    Bus.emit('post:liked', post);
  },

  // rapport: the relationship you build with an author by engaging with them.
  // High rapport + similar following = they follow you back, and their posts
  // reach you more. This is the "network with people" loop.
  buildRapport(authorId, amount) {
    const s = State.data;
    if (!authorId) return;
    const r = s.rapport[authorId] || (s.rapport[authorId] = { rapport: 0, liked: 0, commented: 0, connected: false, followed: false });
    r.rapport += amount;
    // they follow you back only if you're in their league: your influence
    // must be at least half theirs. A nobody spamming a Top Voice gets
    // ignored; a peer gets the follow. This is the "similar following" beat.
    const arch = DATA.ARCHETYPES.find(a => a.id === authorId);
    const theirInfluence = arch ? arch.influence : 0;
    const inTheirLeague = theirInfluence <= 0 || s.influence >= theirInfluence * 0.5;
    if (r.rapport >= 5 && !r.followed && inTheirLeague) {
      r.followed = true;
      // they follow you back — a real relationship
      s.followers += 1;
      if (!s.followedAuthors.includes(authorId)) s.followedAuthors.push(authorId);
      Juice.toast('They followed you back. The relationship is real.');
      // onboarding: the first follow-back is the payoff that unlocks the UI
      if (!s.onboarding.niceComment) {
        s.onboarding.niceComment = true;
        Bus.emit('onboarding:nice-comment', { authorId });
      }
      Bus.emit('person:followed');
    }
  },

  followPerson(id) {
    const s = State.data;
    if (s.followed.includes(id)) return;
    s.followed.push(id);
    // map the followed person to their archetype so their posts show in the feed
    const rec = DATA.RECOMMENDED.find(p => p.id === id) || DATA.NETWORK_PEOPLE.find(p => p.id === id);
    if (rec && rec.arch && !s.followedAuthors.includes(rec.arch)) {
      s.followedAuthors.push(rec.arch);
      // following someone is the manual act that fills the feed: their posts
      // stream in now that you've chosen to see them. Each post is attributed
      // to the actual person, so shared archetypes stay distinct people.
      for (let i = 0; i < 2; i++) {
        s.posts.unshift(this.makeNPCPost(rec.arch, rec));
      }
      this.trimPosts();
    }
    s.connections += 1;
    s.followers += 1;
    s.authenticity = Math.min(100, s.authenticity + 1);
    // following fills YOUR feed — it does not put you in front of their
    // network. Engagement only comes from your own posts reaching people.
    Juice.pop();
    Juice.toast('Followed! Their posts now fill your feed.');
    Bus.emit('person:followed');
  },

  connectPerson(id) {
    const s = State.data;
    if (s.network.includes(id)) return;
    s.network.push(id);
    const rec = DATA.NETWORK_PEOPLE.find(p => p.id === id);
    if (rec && rec.arch && !s.followedAuthors.includes(rec.arch)) {
      s.followedAuthors.push(rec.arch);
      // connecting fills YOUR feed, same as following — it does not put you in
      // front of their network. Engagement only comes from your own posts.
      for (let i = 0; i < 2; i++) {
        s.posts.unshift(this.makeNPCPost(rec.arch, rec));
      }
      this.trimPosts();
    }
    s.connections += 1;
    s.authenticity = Math.min(100, s.authenticity + 1);
    Juice.pop();
    Juice.toast('Connected! Their posts now fill your feed.');
    Bus.emit('person:connected');
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
    if (post.isNPC) this.buildRapport(post.authorId, 2);
    // commenting earns more influence than liking — deeper engagement
    if (post.isNPC) State.data.influence += 2;
    // onboarding: your first comment is the second beat of the arc
    if (!s.onboarding.firstComment) {
      s.onboarding.firstComment = true;
      Bus.emit('onboarding:first-comment', post);
    }
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

  /* ---------- opportunities (influence -> money) ---------- */
  // The payoff of the whole loop. Influence unlocks opportunities; you take
  // them by hand for real money. You can never automate this.
  availableOpportunities() {
    const s = State.data;
    return DATA.OPPORTUNITIES.filter(o => !s.opportunities.taken.includes(o.id) && s.influence >= o.influence);
  },

  takeOpportunity(id) {
    const s = State.data;
    const o = DATA.OPPORTUNITIES.find(x => x.id === id);
    if (!o) return false;
    if (s.opportunities.taken.includes(id)) return false;
    if (s.influence < o.influence) {
      Juice.toast('Not enough influence yet. Keep building.');
      return false;
    }
    s.opportunities.taken.push(id);
    Bank.deposit(o.payout, o.name, o.icon);
    Juice.milestone('💼 ' + o.name, '+' + o.payout.toFixed(2) + ' real dollars. The loop closes.', '');
    Juice.chime();
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 50);
    Bus.emit('opportunity:taken', { id });
    return true;
  },

  /* ---------- post boost (sponsor a post to be seen more) ---------- */
  // The brief's "sponsor posts to get them seen by more people." You pay real
  // money to push a post to a wider audience. This is a spend, not a payout —
  // the money loop closes the other way: opportunities earn, boosts spend.
  boostPost(postId) {
    const s = State.data;
    const post = s.posts.find(p => p.id === postId);
    if (!post || post.authorId !== 'you') return;
    const cost = 5; // $5 to boost a post
    if (s.os.bank.balance < cost) {
      Juice.toast('Not enough money. Take an opportunity first.');
      return;
    }
    Bank.deposit(-cost, 'Boosted a post', '🚀');
    // a boosted post reaches a wider audience: bump its reach and reset its
    // freshness so it surges back into the feed.
    post.reach = (post.reach || 0) * 3 + 1000;
    post.publishedAt = Date.now();
    post.boosted = true;
    Juice.milestone('🚀 POST BOOSTED', 'Your post is being seen by more people. The algorithm approves.', '');
    Juice.chime();
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 40);
    Bus.emit('post:boosted', post);
  },

  /* ---------- idle bots (buy) ---------- */
  buyBot(kind) {
    const s = State.data;
    const defs = {
      scroll: { name: 'Scroll Bot', icon: '🖱️', cost: 100, desc: 'Automatically scrolls the feed and absorbs tags.' },
      post: { name: 'Post Bot', icon: '✍️', cost: 500, desc: 'Automatically writes posts from your bucket tags.' },
      engage: { name: 'Engage Bot', icon: '🤖', cost: 250, desc: 'Automatically likes and comments, building rapport.' },
      influence: { name: 'Influence Bot', icon: '📈', cost: 1000, desc: 'Automatically converts your reach into influence.' },
    };
    const d = defs[kind];
    if (!d) return;
    if (s.impressions < d.cost) {
      Juice.toast('Not enough impressions. Keep scrolling.');
      return;
    }
    s.impressions -= d.cost;
    s.bots[kind] = (s.bots[kind] || 0) + 1;
    Juice.chime();
    Juice.toast('Bought a ' + d.name + '. ' + d.desc);
    Bus.emit('bot:bought', { kind });
  },

  // bots cost money to run. Every tick, each active bot drains a small
  // recurring maintenance fee from the bank. This is the "you can't automate
  // money" beat made literal: bots spend, you earn by hand. If the bank runs
  // dry, the bots go idle until you take an opportunity.
  tickBotMaintenance(dtMs) {
    const s = State.data;
    const b = s.bots || {};
    const total = (b.scroll || 0) + (b.post || 0) + (b.engage || 0) + (b.influence || 0);
    if (total <= 0) return;
    const dtSec = dtMs / 1000;
    // $0.01 per bot per second of uptime — small enough to feel like a
    // background hum, big enough that a full farm drains a real balance.
    const cost = total * 0.01 * dtSec;
    const bal = s.os.bank.balance;
    if (bal <= 0) {
      // broke: bots idle out. The loop stalls until you take an opportunity.
      if (!s._botsIdle) {
        s._botsIdle = true;
        Juice.toast('Your bots went idle. The bank is empty. Take an opportunity.');
      }
      return;
    }
    s._botsIdle = false;
    Bank.deposit(-cost, 'Bot maintenance', '🤖');
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
    // (at the per-second rates your generators publish)
    const rate = this.rates();
    const imp = rate.imp * dtSec;
    s.impressions += imp;
    s.totalImpressions += imp;
    s.likes += rate.like * dtSec;
    s.followers += rate.follow * dtSec;
    s.connections += rate.imp * dtSec * 0.03;
    s.influence += rate.imp * dtSec * 0.2;

    s.lastSeen = now;
    return dtSec;
  },
};
