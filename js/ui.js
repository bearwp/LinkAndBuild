/* ============================================================
   LINK & BUILD — UI
   Feed rendering, composer, growth console, bell, modals.
   ============================================================ */

const UI = {
  /* ---------- post tiers (by impressions) ---------- */
  // A post's "tier" is earned, not rolled: it is a function of lifetime
  // impressions. The rarity draw stays the *odds*; the tier is the *score*.
  // Tiers are the ladder the near-miss bar climbs — each threshold is a rung.
  IMP_TIERS: [
    { min: 0,      label: 'Nobody', icon: '👤', cls: 'tier-0' },
    { min: 100,    label: 'Noticed', icon: '👀', cls: 'tier-1' },
    { min: 1000,   label: 'Rising', icon: '📈', cls: 'tier-2' },
    { min: 10000,  label: 'Thought Leader', icon: '🧠', cls: 'tier-3' },
    { min: 100000, label: 'Viral', icon: '🔥', cls: 'tier-4' },
    { min: 1000000,label: 'Legend', icon: '👑', cls: 'tier-5' },
  ],

  /* ---------- modal helpers ---------- */
  showModal(id) { document.getElementById(id).classList.remove('hidden'); },
  hideModal(id) { document.getElementById(id).classList.add('hidden'); },

  /* ---------- refresh HUD ---------- */
  refresh() {
    const s = State.data;
    const $ = id => document.getElementById(id);

    // first-run: before the first post, strip the UI down to a single
    // obvious action so the player knows exactly what to do.
    document.body.classList.toggle('first-run', s.analytics.postsPublished === 0);
    this.applyProgression();

    this._popTrack = this._popTrack || {};
    const popIfChanged = (el, val) => {
      const key = el.id;
      if (this._popTrack[key] !== val) {
        this._popTrack[key] = val;
      }
    };

    const connEl = $('stat-connections');
    const folEl = $('stat-followers');
    const impEl = $('stat-impressions');
    const ipsEl = $('g-ips');
    const likesEl = $('g-likes');
    const gfolEl = $('g-followers');
    connEl.textContent = Engine.fmtTick(s.connections);
    folEl.textContent = Engine.fmt(s.followers);
    impEl.textContent = Engine.fmtTick(s.impressions);
    ipsEl.textContent = Engine.fmtTick(Engine.totalIps()) + '/s';
    likesEl.textContent = Engine.fmtTick(s.likes);
    gfolEl.textContent = Engine.fmt(s.followers);
    // retention (post-reveal): only shown after the reveal lands
    const retRow = $('retention-row');
    if (retRow) {
      if (s.reveal && s.reveal.revealed) {
        retRow.classList.remove('hidden');
        $('stat-retention').textContent = Engine.fmtTick(s.retention);
      } else {
        retRow.classList.add('hidden');
      }
    }
    // "Become the Algorithm" menu appears after the reveal
    const algoMenu = $('menu-algorithm');
    if (algoMenu) algoMenu.classList.toggle('hidden', !(s.reveal && s.reveal.revealed));
    popIfChanged(connEl, connEl.textContent);
    popIfChanged(folEl, folEl.textContent);
    popIfChanged(impEl, impEl.textContent);
    popIfChanged(ipsEl, ipsEl.textContent);
    popIfChanged(likesEl, likesEl.textContent);
    popIfChanged(gfolEl, gfolEl.textContent);

    // casino coin feel: while impressions are actively earning, sprinkle a
    // small coin payout from the counter on a throttle so it reads as a
    // jackpot trickling in, not spam.
    this._impPayoutAt = this._impPayoutAt || 0;
    const nowImp = Date.now();
    const taxing = Engine.totalIps();
    if (s.impressions > 0 && taxing > 0 && nowImp - this._impPayoutAt > 2600) {
      this._impPayoutAt = nowImp;
      const rect = impEl.getBoundingClientRect();
      Juice.coins(rect.left + rect.width, rect.top + rect.height / 2, 3);
      Juice.coin();
    }

    // influence bar (always climbing — you are the CEO of LockedIn)
    if (s.authenticity > 100) s.authenticity = 100;
    if (s.authenticity < 0) s.authenticity = 0;
    const a = Math.round(s.authenticity);
    $('auth-value').textContent = a + '%';
    const fill = $('auth-fill');
    if (fill.style.width !== a + '%') fill.style.width = a + '%';
    if (fill.style.background !== 'linear-gradient(90deg,#b8860b,#ffd700)') fill.style.background = 'linear-gradient(90deg,#b8860b,#ffd700)';
    if (a >= 90) $('auth-note').textContent = 'Top 1% of creators. The algorithm is obsessed with you.';
    else if (a >= 60) $('auth-note').textContent = 'Thought leader. Recruiters are circling.';
    else if (a >= 30) $('auth-note').textContent = 'Rising fast. Your network is noticing.';
    else $('auth-note').textContent = 'Building momentum. The algorithm already likes you.';

    // hours saved + productivity headline
    $('prod-hours').textContent = s.hoursSaved.toFixed(1);
    const autoCount = Object.values(s.generators).reduce((a, b) => a + b, 0);
    if (autoCount === 0) $('prod-headline').textContent = '"I did it all by hand."';
    else if (autoCount < 3) $('prod-headline').textContent = '"I optimized my workflow."';
    else if (autoCount < 6) $('prod-headline').textContent = '"I automated everything. 40 hours saved a week."';
    else $('prod-headline').textContent = '"I haven\'t touched my keyboard in weeks. Peak productivity."';

    // leaderboard-free: next unlock nudge (throttled — cost math is cheap but
    // the DOM writes don't need to run at 60fps)
    const now = Date.now();
    if (!this._nextUnlockAt || now - this._nextUnlockAt > 500) {
      this._nextUnlockAt = now;
      this.renderNextUnlock();
    }

    // profile
    if ($('profile-name').textContent !== s.name) $('profile-name').textContent = s.name;
    if ($('profile-headline').textContent !== s.headline) $('profile-headline').textContent = s.headline;
    if ($('cm-name').textContent !== s.name) $('cm-name').textContent = s.name;
    if ($('cm-headline').textContent !== s.headline) $('cm-headline').textContent = s.headline;
    // avatar image (profile, nav, composer)
    if (s.avatar) {
      const setAvatar = (id) => {
        const el = document.getElementById(id);
        if (el && el.dataset.avatar !== s.avatar) {
          el.dataset.avatar = s.avatar;
          el.innerHTML = `<img src="${s.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        }
      };
      setAvatar('profile-avatar');
      setAvatar('nav-avatar');
      setAvatar('composer-avatar');
      setAvatar('cm-avatar');
    }
    if (s.verified) {
      $('profile-name').innerHTML = s.name + ' <span style="color:#0a66c2">✔</span>';
    }
    this.applyAura();
  },

  /* ---------- the pauper→god aura ---------- */
  // One scalar (Engine.aura) drives how big you FEEL. It ornaments the avatar
  // (ring → crown → halo), warms the profile banner, and desaturates the body
  // when you're still nobody. The narrator's register shift is the story; this
  // is the visible ascent — a fresh account is a gray dot in a cold room, and a
  // thousand-follower account wears a crown and makes the room glow.
  applyAura() {
    const aura = Engine.aura();
    const body = document.body;
    body.classList.toggle('aura-pauper', aura < 0.1);
    body.classList.toggle('aura-rising', aura >= 0.1 && aura < 0.5);
    body.classList.toggle('aura-god', aura >= 0.5);

    const av = document.getElementById('profile-avatar');
    if (!av) return;

    // avatar ornamentation — the "body" growing with you
    const ORNAMENTS = [
      { min: 0.00, ring: '#ffffff', glow: 'none', crown: false, halo: false },
      { min: 0.10, ring: '#0a66c2', glow: '0 0 0 3px rgba(10,102,194,0.25)', crown: false, halo: false },
      { min: 0.30, ring: '#b8860b', glow: '0 0 12px 2px rgba(184,134,11,0.35)', crown: false, halo: false },
      { min: 0.55, ring: '#ffd700', glow: '0 0 16px 4px rgba(255,215,0,0.5)', crown: true, halo: false },
      { min: 0.80, ring: '#ffd700', glow: '0 0 24px 8px rgba(255,215,0,0.65)', crown: true, halo: true },
    ];
    let o = ORNAMENTS[0];
    for (const tier of ORNAMENTS) if (aura >= tier.min) o = tier;

    if (av.dataset.aura !== o.min) {
      av.dataset.aura = o.min;
      av.style.setProperty('--aura-ring', o.ring);
      av.style.setProperty('--aura-glow', o.glow);
      // manage crown + halo children (kept separate from the avatar image)
      if (o.crown && !av.querySelector('.aura-crown')) {
        const crown = document.createElement('div');
        crown.className = 'aura-crown';
        crown.textContent = '👑';
        av.appendChild(crown);
      } else if (!o.crown) {
        const crown = av.querySelector('.aura-crown');
        if (crown) crown.remove();
      }
      if (o.halo && !av.querySelector('.aura-halo')) {
        const halo = document.createElement('div');
        halo.className = 'aura-halo';
        halo.style.border = '2px solid rgba(255,215,0,0.7)';
        halo.style.background = 'radial-gradient(circle, rgba(255,215,0,0.12), rgba(255,215,0,0) 70%)';
        av.appendChild(halo);
      } else if (!o.halo) {
        const halo = av.querySelector('.aura-halo');
        if (halo) halo.remove();
      }
    }
  },

  /* ---------- progressive UI unlock ---------- */
  // The interface reveals itself as the player climbs. A fresh account sees
  // almost nothing: just the feed and the composer. Each milestone unlocks a
  // new panel, so the game never dumps the whole machine on you at once.
  //
  // This is the single source of truth for what's visible at each stage.
  // Every panel, nav item and rail card is gated here, so nothing "pops in"
  // all at once — each piece arrives at its own milestone with a chime.
  applyProgression() {
    const s = State.data;
    const era = Engine.era();
    const followers = s.followers;
    const posts = s.analytics.postsPublished;
    // The interface stays locked until the first-post arc completes: a like,
    // a comment, then a nice comment. Until then, only the composer + feed.
    const unlocked = s.onboarding && s.onboarding.unlocked;

    // what's visible at each stage (true = visible, false = hidden)
    const show = {
      // left rail
      'profile-card': true,             // your identity — always there
      'menu-card': unlocked,             // menu appears after the onboarding arc
      'authenticity-card': unlocked,     // influence bar after the arc
      'productivity-card': era >= 2,     // hours saved once you automate
      // nav items
      'nav-network': followers >= 50,    // my network
      'nav-jobs': followers >= 200,      // jobs
      'nav-bell': unlocked,              // notifications
      // right rail
      'growth-card': unlocked,           // after the arc: growth console
      'next-card': unlocked,             // next unlock nudge
      'rec-card': followers >= 50,       // people you may know
      'ads-card': followers >= 100,      // sponsored content
      'footer-card': followers >= 100,   // footer links
      // menu items
      'menu-analytics': unlocked,        // analytics menu
      'menu-premium': followers >= 200,  // premium upsell
      'menu-prestige': followers >= 500, // brand equity (the reset)
      'menu-endorsements': followers >= 1000, // endorsements
    };

    // friendly labels for the unlock celebration
    const labels = {
      'menu-card': 'Your profile menu',
      'authenticity-card': 'Your Influence meter',
      'productivity-card': 'Hours Saved',
      'nav-network': 'My Network',
      'nav-jobs': 'Jobs',
      'nav-bell': 'Notifications',
      'growth-card': 'The Growth Console',
      'next-card': 'Next Unlock',
      'rec-card': 'People you may know',
      'ads-card': 'Sponsored content',
      'footer-card': 'The fine print',
      'menu-analytics': 'Analytics',
      'menu-premium': 'LockedIn Premium',
      'menu-prestige': 'Brand Equity',
      'menu-endorsements': 'Endorsements',
    };

    this._progSeen = this._progSeen || {};
    for (const id in show) {
      const el = document.getElementById(id);
      if (!el) continue;
      const visible = show[id];
      const wasVisible = !el.classList.contains('prog-hidden');
      if (visible) {
        el.classList.remove('prog-hidden');
        // celebrate the moment a panel first appears
        if (!wasVisible && !this._progSeen[id]) {
          this._progSeen[id] = true;
          if (labels[id]) {
            Juice.chime();
            Juice.toast('🔓 ' + labels[id] + ' unlocked');
          }
        }
      } else {
        el.classList.add('prog-hidden');
      }
    }
  },

  renderNextUnlock() {
    const s = State.data;
    const title = document.getElementById('next-title');
    const fill = document.getElementById('next-fill');
    const sub = document.getElementById('next-sub');
    if (!title) return;
    // find the cheapest affordable-ish next purchase (generator or upgrade)
    let next = null;
    for (const g of DATA.GENERATORS) {
      if ((g.layer || 1) > s.prestige.layer) continue;
      if (Engine.genCount(g.id) === 0) {
        const cost = Engine.costOf(g, 0);
        if (!next || cost < next.cost) next = { name: g.name, cost, icon: g.icon, kind: 'generator' };
      }
    }
    for (const u of DATA.UPGRADES) {
      if ((u.layer || 1) > s.prestige.layer) continue;
      if (!s.upgrades[u.id]) {
        const cost = Engine.costOf(u, 0);
        if (!next || cost < next.cost) next = { name: u.name, cost, icon: u.icon, kind: 'upgrade' };
      }
    }
    if (!next) {
      title.textContent = '🏆 You\'ve unlocked everything';
      fill.style.width = '100%';
      sub.textContent = 'The algorithm is yours.';
      return;
    }
    const pct = Math.min(100, (s.impressions / next.cost) * 100);
    title.textContent = `Next: ${next.icon} ${next.name}`;
    fill.style.width = pct + '%';
    const remaining = Math.max(0, next.cost - s.impressions);
    sub.textContent = `${Engine.fmt(remaining)} impressions to unlock`;
  },

  updateBell() {
    const s = State.data;
    const b = document.getElementById('bell-badge');
    b.textContent = s.notifCount > 99 ? '99+' : s.notifCount;
    if (s.notifCount > 0) b.style.display = 'inline-block';
    else b.style.display = 'none';
  },

  /* ---------- feed ---------- */
  _feedIds: new Set(),
  _feedRendered: 0,
  _cards: new Map(), // postId -> card element (O(1) lookup, no querySelector scans)
  _visiblePosts: new Set(), // postIds currently on screen (IntersectionObserver)
  _feedDebounceT: null,

  // Track which post cards are on screen so the 60fps loop only updates
  // visible cards instead of every post in the feed.
  _initVisibility() {
    if (this._visObserver) return;
    this._visObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = e.target.dataset.postId;
        if (!id) continue;
        if (e.isIntersecting) this._visiblePosts.add(id);
        else this._visiblePosts.delete(id);
      }
    }, { rootMargin: '200px 0px' });
  },
  isPostVisible(id) { return this._visiblePosts.has(id); },
  _observeCard(card) {
    this._initVisibility();
    this._visObserver.observe(card);
  },

  // Coalesce rapid feed changes (stream posts, auto posts) into one render.
  renderFeedDebounced() {
    if (this._feedDebounceT) return;
    this._feedDebounceT = setTimeout(() => {
      this._feedDebounceT = null;
      this.renderFeed();
    }, 250);
  },

  renderFeed() {
    const feed = document.getElementById('feed');
    const s = State.data;
    // Player posts appear first, but NPC posts always keep a reserved slice
    // so the feed never collapses into only the player's own posts.
    const MIN_NPC = 20;
    const yours = s.posts.filter(p => p.authorId === 'you');
    // Only posts from people you follow (plus your own) appear in the feed.
    // A fresh account sees a ghost town until it follows someone.
    const followed = new Set(s.followedAuthors || []);
    const npcs = s.posts.filter(p => p.authorId !== 'you' && followed.has(p.authorId));
    const yourCap = 60 - MIN_NPC;
    const shownYours = yours.slice(0, yourCap);
    const posts = shownYours.concat(npcs.slice(0, 60 - shownYours.length));

    // In-place update: only add/remove cards, never rebuild all.
    const existing = new Map();
    feed.querySelectorAll('.post-card').forEach(c => {
      const id = c.dataset.postId;
      if (id) existing.set(id, c);
    });
    const seen = new Set();
    // posts array is newest-first; iterate oldest-first so prepending
    // leaves the newest post at the top of the feed.
    for (let i = posts.length - 1; i >= 0; i--) {
      const post = posts[i];
      seen.add(post.id);
      if (existing.has(post.id)) {
        existing.get(post.id).classList.toggle('post-card-first', i === 0);
      } else {
        const card = this.postCard(post);
        card.classList.toggle('post-card-first', i === 0);
        // new posts stream in at the top of the feed
        feed.insertBefore(card, feed.firstChild);
        this._observeCard(card);
      }
    }
    // remove cards no longer in the list
    for (const [id, card] of existing) {
      if (!seen.has(id)) {
        if (this._visObserver) this._visObserver.unobserve(card);
        this._visiblePosts.delete(id);
        card.remove();
        this._cards.delete(id);
      }
    }
    this._feedIds = seen;
  },

  // Update a single post card's live numbers in place (no rebuild)
  updatePostCard(post) {
    const card = this._cards.get(post.id);
    if (!card) return;
    const stats = post.stats;
    // cache stat elements on the card to avoid per-frame querySelector scans
    if (!card._statEls) {
      card._statEls = {
        imp: card.querySelector('.st-imp'),
        like: card.querySelector('.st-like'),
        com: card.querySelector('.st-com'),
        share: card.querySelector('.st-share'),
      };
    }
    const impEl = card._statEls.imp;
    const likeEl = card._statEls.like;
    const comEl = card._statEls.com;
    const shareEl = card._statEls.share;
    const impNew = Engine.fmtTick(stats.impressions);
    const likeNew = Engine.fmtTick(stats.likes);
    const comNew = Engine.fmtTick(stats.comments);
    if (impEl && impEl.textContent !== impNew) {
      // how many impressions landed since the last paint — the amount we
      // cascade into the "+N" float so every gain is legible, not just a blur
      const delta = stats.impressions - (post._lastShownImp || 0);
      post._lastShownImp = stats.impressions;
      impEl.textContent = impNew;
      // each incoming impression reads as a small "win" on this post's
      // counter; the big fanfare is reserved for tier-ups
      this._impressionWin(post, delta);
      const tier = this._impTier(post);
      if ((post._tierMin || 0) !== tier.min) {
        post._tierMin = tier.min;
        this._firePost(post);
        Juice.coin();
      }
    }
    if (likeEl && likeEl.textContent !== likeNew) {
      likeEl.textContent = likeNew;
    }
    if (comEl && comEl.textContent !== comNew) {
      comEl.textContent = comNew;
    }
    const shareNew = Engine.fmtTick(stats.shares);
    if (shareEl && shareEl.textContent !== shareNew) {
      shareEl.textContent = shareNew;
    }
    // live comments: append new ones with a slide-in
    if (post.comments && post.comments.length) {
      const box = card._commentBox || (card._commentBox = card.querySelector('.post-comments'));
      const rendered = post._renderedComments || 0;
      if (box && post.comments.length > rendered) {
        // append new comments with real avatar format
        for (let i = rendered; i < post.comments.length; i++) {
          const c = post.comments[i];
          const div = document.createElement('div');
          div.className = 'pc pc-new' + (c.troll ? ' pc-troll' : '');
          div.innerHTML = `
            <div class="pc-avatar" style="background:${c.color || '#b3c6d8'}">${c.emoji || '🙂'}</div>
            <div class="pc-body">
              <div class="pc-author">${this.escapeHtml(c.author)} <span class="pc-role">${c.role || ''}</span></div>
              <div class="pc-text">${this.escapeHtml(c.text)}</div>
            </div>`;
          box.appendChild(div);
        }
        post._renderedComments = post.comments.length;
        // keep only last 3 visible unless expanded
        if (!post._showAllComments && box) {
          const pcs = box.querySelectorAll('.pc');
          for (let i = pcs.length - 1; i >= 3; i--) pcs[i].remove();
          // update the "show all" counter
          const more = box.querySelector('.pc-more');
          if (more) more.textContent = 'Show all ' + post.comments.length + ' comments';
          else if (post.comments.length > 3) {
            const btn = document.createElement('button');
            btn.className = 'pc-more';
            btn.textContent = 'Show all ' + post.comments.length + ' comments';
            btn.addEventListener('click', () => {
              post._showAllComments = true;
              this.renderFeed();
            });
            box.appendChild(btn);
          }
        }
      }
    }
  },

  _impTier(post) {
    const imp = post.stats.impressions;
    let tier = this.IMP_TIERS[0];
    for (const t of this.IMP_TIERS) {
      if (imp >= t.min) tier = t;
    }
    return tier;
  },

  // Tier up — the badge that latches to the post and relabels it as it climbs
  // impressions. It is the "you've won" signal that stays instead of re-firing
  // stimulus every frame, so the win reads once and then quiets down.
  _firePost(post) {
    const card = this._cards.get(post.id);
    if (!card) return;
    const tier = this._impTier(post);
    if (!card._fireEl) {
      card._fireEl = card.querySelector('.fire-post');
    }
    if (!card._fireEl) {
      card._fireEl = document.createElement('div');
      card._fireEl.className = 'fire-post';
      card.insertBefore(card._fireEl, card.firstChild);
    }
    card._fireEl.classList.remove('hidden');
    card._fireEl.innerHTML = `<span>${tier.icon}</span> ${tier.label.toUpperCase()}`;
    // clear any lower-tier class, apply the current one
    for (const t of this.IMP_TIERS) card.classList.remove(t.cls);
    card.classList.add(tier.cls);
    post._tierMin = tier.min;
  },

  // An impression came in. The impression NUMBER is what earns — so that's
  // what glows and bumps a little on every impression. The post itself stays
  // still. The counter glows gold and bobs as it ticks up, giving one quiet
  // hit per impression; the coin + pop are throttled per post so a flood reads
  // as a steady rain of wins, not a wall of sound.
  _impressionWin(post, delta) {
    const card = this._cards.get(post.id);
    if (!card) return;
    const now = performance.now();
    const impEl = card._statEls && card._statEls.imp;
    const gained = Math.max(1, Math.round(delta || 1));
    // aura scales the juice: at 0 followers the pop is small and the float is a
    // whisper; at god tier the same +1 hits with a heavier squash and a louder
    // thock. Identical action, but the *magnitude* of the win grows with you.
    const aura = Engine.aura();
    const popPower = 1 + aura * 0.6;      // up to 1.6x squash
    const glowPower = 0.5 + aura;         // up to 1.5x glow
    const floatSize = 13 + aura * 9;      // 13px → 22px float
    if (impEl) {
      impEl.classList.remove('imp-glow');
      impEl.style.setProperty('--imp-dx', ((Math.random() - 0.5) * 10 * popPower).toFixed(1) + 'px');
      impEl.style.setProperty('--imp-rot', ((Math.random() - 0.5) * 16 * popPower).toFixed(1) + 'deg');
      impEl.style.setProperty('--imp-drift', (Math.random() * 90).toFixed(0) + 'ms');
      impEl.style.setProperty('--imp-pop', popPower.toFixed(2));
      impEl.style.setProperty('--imp-glow', glowPower.toFixed(2));
      void impEl.offsetWidth;
      impEl.classList.add('imp-glow');
      const rect = impEl.getBoundingClientRect();
      const cx = rect.left + rect.width + 4;
      const cy = rect.top;
      Juice.floatUp(cx, cy, '+' + Engine.fmt(gained), floatSize);
    }
    Juice.thock();
    // coin fly-off stays on a per-post beat so the big piece never strobes
    const BEAT = 700;
    if (!post._lastBeat || now - post._lastBeat >= BEAT) {
      post._lastBeat = now;
      if (impEl) {
        const rect = impEl.getBoundingClientRect();
        Juice.coins(rect.left + rect.width, rect.top, 1);
      }
    }
  },

  // viral burst — the jackpot payoff. Before the big payday, the post's
  // modifier chain fires left-to-right like a row of Jokers: each chip bounces,
  // nudges the card, and steps the pitch up, building anticipation until the
  // confetti + screen shake lands as the release. The win sets the post ON
  // FIRE — real flames lick off its edges — the earned, persistent signal that
  // this post caught, instead of a text label.
  viralBurst(post) {
    const card = this._cards.get(post.id);
    if (card) {
      this._ignite(post, card);
      const rect = card.getBoundingClientRect();
      // staggered combo cascade — the modifiers reveal one by one
      const chips = Engine.comboChain(post);
      chips.forEach((chip, i) => {
        setTimeout(() => {
          Juice.comboChip(
            rect.left + rect.width / 2,
            rect.top + 20 + i * 22,
            chip.icon,
            chip.label + ' ' + chip.text
          );
          Juice.kaChing(i);
          const impEl = card._statEls && card._statEls.imp;
          if (impEl) {
            impEl.classList.remove('imp-glow');
            void impEl.offsetWidth;
            impEl.classList.add('imp-glow');
          }
        }, i * 140);
      });
      const totalDelay = chips.length * 140;
      setTimeout(() => {
        card.classList.add('viral-flash');
        Juice.shake(card);
        Juice.coins(rect.left + rect.width / 2, rect.top, 16);
        Juice.confetti(rect.left + rect.width / 2, rect.top + 40, 60);
        Juice.chime();
      }, totalDelay + 120);
    } else {
      Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 60);
      Juice.chime();
    }
    const flash = document.createElement('div');
    flash.className = 'viral-screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
  },

  // light a post on fire: flames flicker off its top edge and a warm glow
  // wraps the card. Persistent — the post stays "on fire" as its earned state.
  _ignite(post, card) {
    post.onFire = true;
    card.classList.add('on-fire');
    if (!card._flames) {
      card._flames = document.createElement('div');
      card._flames.className = 'flames';
      // a row of flame tongues, each flickering on its own beat
      for (let i = 0; i < 7; i++) {
        const f = document.createElement('span');
        f.className = 'flame';
        f.style.left = (i * 14.5 + 2) + '%';
        f.style.animationDelay = (Math.random() * 0.6) + 's';
        f.style.animationDuration = (0.7 + Math.random() * 0.5) + 's';
        f.style.width = (12 + Math.random() * 8) + 'px';
        f.style.height = (20 + Math.random() * 10) + 'px';
        card._flames.appendChild(f);
      }
      card.appendChild(card._flames);
    }
  },

  // Append more NPC posts as the player scrolls (infinite scroll)
  appendFeed() {
    const s = State.data;
    const feed = document.getElementById('feed');
    const npcs = s.posts.filter(p => p.authorId !== 'you');
    // find how many NPC posts currently rendered
    const renderedNpcs = feed.querySelectorAll('.post-card').length - s.posts.filter(p => p.authorId === 'you').length;
    const more = npcs.slice(renderedNpcs, renderedNpcs + 6);
    for (const post of more) {
      const card = this.postCard(post);
      feed.appendChild(card);
      this._observeCard(card);
    }
    return more.length;
  },

  postCard(post) {
    const s = State.data;
    const card = document.createElement('div');
    card.className = 'post-card' + (post.fourthWall ? ' fourthwall' : '') + (post.scare ? ' scare' : '');
    card.dataset.postId = post.id;
    this._cards.set(post.id, card);
    if (post.rarity === 'legendary') card.classList.add('viral-flash');

    // tier styling: high-influence members get a gold "Top Voice" treatment,
    // low-influence members get a muted, low-engagement look.
    const inf = post.influence || 0;
    let tierClass = 'tier-low';
    let tierBadge = '';
    if (inf >= 1000) { tierClass = 'tier-top'; tierBadge = '<span class="tier-badge">👑 Top Voice</span>'; }
    else if (inf >= 500) { tierClass = 'tier-mid'; tierBadge = '<span class="tier-badge">⭐ Rising</span>'; }
    card.classList.add(tierClass);

    const age = Math.floor((Date.now() - post.publishedAt) / 60000);
    const ageStr = age < 1 ? 'just now' : age < 60 ? age + 'm' : Math.floor(age / 60) + 'h';

    const isYou = post.authorId === 'you';
    const youTag = isYou ? '<span class="you-tag">• You</span>' : '';

    const stats = post.stats;
    const likeBtn = isYou
      ? `<div class="pa-btn"><span class="thumb">👍</span> Like</div>`
      : `<button class="pa-btn ${post.likedByYou ? 'liked' : ''}" data-like="${post.id}"><span class="thumb">👍</span> Like</button>`;
    const commentBtn = isYou
      ? `<div class="pa-btn"><span>💬</span> Comment</div>`
      : `<button class="pa-btn" data-comment="${post.id}"><span>💬</span> Comment</button>`;

    let commentsHtml = '';
    if (post.comments && post.comments.length) {
      const SHOW_LIMIT = 3;
      const total = post.comments.length;
      const shown = post._showAllComments ? post.comments : post.comments.slice(-SHOW_LIMIT);
      const hidden = post._showAllComments ? 0 : total - shown.length;
      const rows = shown.map(c => `
        <div class="pc${c.troll ? ' pc-troll' : ''}">
          <div class="pc-avatar" style="background:${c.color || '#b3c6d8'}">${c.emoji || '🙂'}</div>
          <div class="pc-body">
            <div class="pc-author">${this.escapeHtml(c.author)} <span class="pc-role">${c.role || ''}</span></div>
            <div class="pc-text">${this.escapeHtml(c.text)}</div>
          </div>
        </div>`).join('');
      const moreLink = hidden > 0
        ? `<button class="pc-more" data-more="${post.id}">Show all ${total} comments</button>`
        : '';
      commentsHtml = `<div class="post-comments">${rows}${moreLink}</div>`;
    } else {
      // always render the container so live comments can append into it
      commentsHtml = `<div class="post-comments"></div>`;
    }

    card.innerHTML = `
      <div class="fire-post hidden"></div>
      <div class="post-head">
        <div class="avatar" style="background:${post.authorColor}">${post.authorEmoji}</div>
        <div>
          <div class="post-author">${post.authorName}${youTag}${tierBadge}</div>
          <div class="post-meta">${post.authorRole} · ${ageStr}</div>
        </div>
      </div>
      <div class="post-body">${this.escapeHtml(post.content)}</div>
      ${post.reactionGif ? `<div class="post-gif"><img src="data:image/svg+xml;utf8,${encodeURIComponent(post.reactionGif.svg)}" alt="${post.reactionGif.label}" loading="lazy"></div>` : ''}
      ${post.image ? `<div class="post-image"><img src="${post.image}" alt="" loading="lazy"></div>` : ''}
      <div class="post-stats">
        <span><b class="st-imp">${Engine.fmt(stats.impressions)}</b> impressions</span>
        <span><b class="st-like">${Engine.fmt(stats.likes)}</b> likes</span>
        <span><b class="st-com">${Engine.fmt(stats.comments)}</b> comments</span>
        <span><b class="st-share">${Engine.fmt(stats.shares)}</b> reposts</span>
      </div>
      <div class="post-actions">${likeBtn}${commentBtn}<div class="pa-btn"><span>↗</span> Repost</div><div class="pa-btn"><span>✈️</span> Send</div></div>
      ${commentsHtml}
    `;

    // bind events
    const likeBtnEl = card.querySelector('[data-like]');
    if (likeBtnEl) likeBtnEl.addEventListener('click', () => {
      Engine.likePost(post);
      likeBtnEl.classList.add('liked');
      const rect = likeBtnEl.getBoundingClientRect();
      Juice.particles(rect.left + rect.width / 2, rect.top, '+1 👍', '#0a66c2');
      this.updatePostCard(post);
    });

    const commentBtnEl = card.querySelector('[data-comment]');
    if (commentBtnEl) commentBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openCommentPop(commentBtnEl, post);
    });

    // "Show all X comments" expand
    const moreEl = card.querySelector('[data-more]');
    if (moreEl) moreEl.addEventListener('click', () => {
      post._showAllComments = true;
      this.renderFeed();
    });

    // restore any earned tier badge (in case this card was rebuilt)
    if (this._impTier(post).min > 0) this._firePost(post);
    // restore the on-fire state so flames persist across feed rebuilds
    if (post.onFire) this._ignite(post, card);

    return card;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /* ---------- comment minigame popover ---------- */
  openCommentPop(anchor, post) {
    const old = document.querySelector('.comment-pop');
    if (old) old.remove();
    const pop = document.createElement('div');
    pop.className = 'comment-pop';
    const rect = anchor.getBoundingClientRect();
    pop.style.left = Math.min(rect.left, window.innerWidth - 260) + 'px';
    pop.style.top = (rect.bottom + 4) + 'px';
    for (const c of DATA.COMMENTS) {
      const btn = document.createElement('button');
      btn.innerHTML = `${c.text} <span class="cp-tag">+${c.likes} likes</span>`;
      btn.addEventListener('click', () => {
        Engine.commentOn(post, c.text);
        pop.remove();
        const r = anchor.getBoundingClientRect();
        Juice.particles(r.left + r.width / 2, r.top, '+' + c.likes + ' 👍', '#0a66c2');
        this.updatePostCard(post);
      });
      pop.appendChild(btn);
    }
    document.body.appendChild(pop);
    const close = (e) => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  },

  /* ---------- composer ---------- */
  fillTemplateSelect() {
    const sel = document.getElementById('opt-template');
    sel.innerHTML = '';
    for (const t of DATA.TEMPLATES) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name + (t.id === 'free' ? '' : ' (bait)');
      sel.appendChild(opt);
    }
  },

  updatePreview() {
    const sel = document.getElementById('opt-template');
    const t = DATA.TEMPLATES.find(x => x.id === sel.value);
    const el = document.getElementById('post-preview');
    if (t && t.id !== 'free') {
      el.textContent = 'Template: ' + t.name + ' · potential ×' + t.potential + ' · influence +' + Math.abs(t.auth);
    } else {
      el.textContent = 'Free write: authentic, lower potential.';
    }
  },

  openComposer() {
    this.showModal('composer-modal');
    document.getElementById('post-text').focus();
  },

  /* ---------- inline composer (AI writes the post, no modal) ---------- */
  startInlinePost() {
    const s = State.data;
    const box = document.getElementById('inline-composer');
    const textEl = document.getElementById('inline-text');
    const sendBtn = document.getElementById('inline-send');
    if (!box || this._typing) return;
    // The first few posts are naive and honest — a real person who needs a
    // job. Only once the player has posted a few times does the bait machine
    // (templates) take over.
    const naive = s.analytics.postsPublished < 3;
    const t = naive ? null : Engine.pick(DATA.TEMPLATES);
    const content = naive
      ? Engine.pick(DATA.NAIVE_POSTS)
      : (t.id === 'free' ? Engine.pick(DATA.ARCHETYPES).posts[0] : t.text);
    this._inlineTemplate = t;
    this._inlineContent = content;
    this._typing = true;
    box.classList.remove('hidden');
    textEl.textContent = '';
    sendBtn.disabled = true;
    // type it out character by character
    let i = 0;
    const caret = document.createElement('span');
    caret.className = 'typing-caret';
    textEl.appendChild(caret);
    const step = () => {
      if (!this._typing) return;
      i++;
      const shown = content.slice(0, i);
      textEl.textContent = shown;
      textEl.appendChild(caret);
      if (i < content.length) {
        this._typeTimer = setTimeout(step, 18 + Math.random() * 40);
      } else {
        this._typing = false;
        sendBtn.disabled = false;
      }
    };
    step();
  },

  sendInlinePost() {
    const s = State.data;
    const box = document.getElementById('inline-composer');
    const textEl = document.getElementById('inline-text');
    const sendBtn = document.getElementById('inline-send');
    if (!this._inlineContent || this._typing) return;
    const opts = {
      template: this._inlineTemplate ? this._inlineTemplate.id : 'free',
      format: 'text',
      emojis: 0,
      tags: 0,
      question: 0,
    };
    const post = Engine.publish(this._inlineContent, opts);
    if (post) {
      this._inlineContent = null;
      this._inlineTemplate = null;
      textEl.textContent = '';
      box.classList.add('hidden');
      sendBtn.disabled = true;
    }
  },

  /* ---------- growth console ---------- */
  renderGrowth() {
    const s = State.data;
    const paneG = document.getElementById('g-pane-generators');
    const paneU = document.getElementById('g-pane-upgrades');

    // generators (the factory floor: each row is a machine slot)
    paneG.innerHTML = '';
    for (const g of DATA.GENERATORS) {
      if ((g.layer || 1) > s.prestige.layer) continue;
      const owned = s.generators[g.id] || 0;
      const cost = Engine.costOf(g, owned);
      const affordable = s.impressions >= cost;
      const item = document.createElement('div');
      item.className = 'g-item' + (owned > 0 ? ' owned running' : ' idle');
      item.innerHTML = `
        <div class="g-item-icon">${g.icon}</div>
        <div class="g-item-info">
          <div class="g-item-name">${g.name} <span class="g-item-count">${owned > 0 ? '×' + owned : ''}</span></div>
          <div class="g-item-desc">${g.desc}</div>
          <div class="g-item-stats">
            ${owned > 0
              ? `<span class="g-output">+${Engine.fmt(Engine.prodOf(g, owned))} imp/s</span> <span class="g-per">(+${Engine.fmt(Engine.prodOf(g, 1))} each)</span>`
              : `<span class="g-would">⚙️ +${Engine.fmt(Engine.prodOf(g, 1))} imp/s</span>`}
          </div>
        </div>
        <button class="btn btn-primary g-item-btn" data-gen="${g.id}" ${affordable ? '' : 'disabled'}>
          ${owned > 0 ? 'Upgrade' : 'Acquire'} · ${Engine.fmt(cost)}
        </button>
      `;
      item.querySelector('[data-gen]').addEventListener('click', () => Engine.buyGenerator(g.id));
      paneG.appendChild(item);
    }

    // upgrades
    paneU.innerHTML = '';
    for (const u of DATA.UPGRADES) {
      if ((u.layer || 1) > s.prestige.layer) continue;
      const owned = s.upgrades[u.id] || 0;
      const done = owned >= u.max;
      const cost = Engine.costOf(u, owned);
      const affordable = s.impressions >= cost;
      const item = document.createElement('div');
      item.className = 'g-item' + (done ? ' owned' : '');
      item.innerHTML = `
        <div class="g-item-icon">${u.icon}</div>
        <div class="g-item-info">
          <div class="g-item-name">${u.name}</div>
          <div class="g-item-desc">${u.desc}</div>
          <div class="g-item-stats">${u.effect}</div>
        </div>
        <button class="btn btn-primary g-item-btn" data-upg="${u.id}" ${done || !affordable ? 'disabled' : ''}>
          ${done ? 'Owned' : Engine.fmt(cost)}
        </button>
      `;
      item.querySelector('[data-upg]').addEventListener('click', () => Engine.buyUpgrade(u.id));
      paneU.appendChild(item);
    }
  },

  // The assembly line — the factory's honest math as a conveyor. One input
  // (your machines' impressions/sec) flows through coefficients to tangible
  // The transparent factory — the distribution loop as a visible pipeline.
  // Each gate shows WHO does it (🖐 you / 🤖 machine), the input flowing in,
  // and the output flowing out. Buying a factory flips a gate from hand to
  // machine, and you can always see both — the honest "do once, then delegate"
  // arc, rendered. Generated in 4 gates:
  //   content → audience → engage → schedule → (impressions)
  factoryLineHtml() {
    const s = State.data;
    const p = Engine.pipeline();
    const gates = Engine.gates();
    const gens = Object.values(s.generators).reduce((a, b) => a + b, 0);

    // the loop values (approximate each gate's throughput)
    const flow = {
      content: p.ips,
      audience: p.ips,
      engage: p.likes + p.comments + p.shares,
      schedule: p.impressions,
    };

    const order = [
      { key: 'content',  label: 'CONTENT',    desc: 'quality' },
      { key: 'audience', label: 'AUDIENCE',   desc: 'network' },
      { key: 'engage',   label: 'ENGAGE',     desc: 'resonance' },
      { key: 'schedule', label: 'DISTRIBUTE', desc: 'timing' },
    ];

    const nodes = order.map(o => {
      const g = gates[o.key] || { hand: true, name: o.key };
      const val = Engine.fmtTick(flow[o.key]);
      return `
        <div class="gate ${g.hand ? 'hand' : 'machine'}">
          <div class="gate-handler">${g.hand ? '🖐 You' : '🤖 ' + g.name}</div>
          <div class="gate-flow" data-gate="${o.key}">${val}</div>
          <div class="gate-label">${o.label} · ${o.desc}</div>
        </div>`;
    }).join('<div class="fl-arrow">→</div>');

    return `
      <div class="factory-line ${gens > 0 ? 'online' : 'offline'}">
        <div class="fl-title">🏭 ${gens > 0 ? 'THE MACHINE IS RUNNING' : 'THE MACHINE IS IDLE'}</div>
        <div class="fl-stages">${nodes}</div>
        <div class="fl-sub">${gens > 0 ? 'Built by hand first. Delegate each step to a factory. The machine wires the rest.' : 'Every step is yours by hand. Buy a factory to automate it.'}</div>
      </div>`;
  },

  // render (or create) the always-visible factory strip in the right rail
  renderFactoryStrip() {
    const strip = document.getElementById('factory-strip');
    if (!strip) return;
    strip.innerHTML = this.factoryLineHtml();
  },

  // Live-tick the factory strip in place while visible. Each gate's throughput
  // rolls in real time so the machine visibly works even when you're idle.
  factoryLive() {
    const strip = document.getElementById('factory-strip');
    if (!strip) return;
    const line = strip.querySelector('.factory-line');
    if (!line) { this.renderFactoryStrip(); return; }
    const p = Engine.pipeline();
    const s = State.data;
    const gens = Object.values(s.generators).reduce((a, b) => a + b, 0);
    line.classList.toggle('online', gens > 0);
    const flow = {
      content: p.ips,
      audience: p.ips,
      engage: p.likes + p.comments + p.shares,
      schedule: p.impressions,
    };
    line.querySelectorAll('.gate-flow').forEach(el => {
      const key = el.dataset.gate;
      if (key && flow[key] !== undefined) {
        const v = Engine.fmtTick(flow[key]);
        if (el.textContent !== v) el.textContent = v;
      }
    });
    // refresh handler badges when a gate's ownership changes
    const title = line.querySelector('.fl-title');
    if (title) title.textContent = '🏭 ' + (gens > 0 ? 'THE MACHINE IS RUNNING' : 'THE MACHINE IS IDLE');
  },

  /* ---------- analytics ---------- */
  anGrowth() {
    const a = State.data.analytics;
    const h = a.history;
    if (h.length < 2) return 0;
    const first = h[0].impressions;
    const last = h[h.length - 1].impressions;
    if (first <= 0) return 0;
    return ((last - first) / first) * 100;
  },

  anChartHtml() {
    const a = State.data.analytics;
    const hist = a.history.slice(-30);
    if (!hist.length) return '<div class="an-chart-empty">Collecting data…</div>';
    const maxImp = Math.max(1, ...hist.map(h => h.impressions));
    const bars = hist.map(h => {
      const impH = Math.max(2, (h.impressions / maxImp) * 100);
      return `<div class="an-bar" style="height:${impH}px"></div>`;
    }).join('');
    // moving-average trend line
    const n = hist.length;
    const win = 5;
    const pts = [];
    for (let i = 0; i < n; i++) {
      let sum = 0, cnt = 0;
      for (let j = Math.max(0, i - win + 1); j <= i; j++) { sum += hist[j].impressions; cnt++; }
      const avg = sum / cnt;
      const x = n > 1 ? (i / (n - 1)) * 100 : 50;
      const y = 100 - (avg / maxImp) * 100;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const trend = `<svg class="an-trend" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.join(' ')}" fill="none" stroke="#f9a825" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
    return `<div class="an-bars">${bars}</div>${trend}`;
  },

  anLive() {
    const modal = document.getElementById('analytics-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = document.getElementById('analytics-body');
    if (!body) return;
    const s = State.data;
    const a = s.analytics;
    if (a.analyticsLevel < 1) return;
    const best = a.bestPost;
    const vals = {
      totalImpressions: Engine.fmtTick(s.totalImpressions),
      postsPublished: a.postsPublished,
      totalLikes: Engine.fmtTick(a.totalLikes),
      followers: Engine.fmt(s.followers),
      ips: Engine.fmtTick(Engine.totalIps()),
      bestPost: best ? Engine.fmt(best.stats.impressions) + ' imp' : '—',
    };
    body.querySelectorAll('[data-an-live]').forEach(el => {
      const v = vals[el.dataset.anLive];
      if (v !== undefined) el.textContent = v;
    });
    const g = this.anGrowth();
    const ge = body.querySelector('.an-growth');
    if (ge) {
      ge.textContent = (g >= 0 ? '+' : '') + g.toFixed(1) + '% this minute';
      ge.classList.toggle('up', g >= 0);
      ge.classList.toggle('down', g < 0);
    }
    const chart = body.querySelector('#an-chart');
    if (chart) {
      // chart only needs to rebuild when a new history sample lands (~1/s)
      const now = Date.now();
      if (!this._anChartAt || now - this._anChartAt > 1000) {
        this._anChartAt = now;
        chart.innerHTML = this.anChartHtml();
      }
    }
  },

  renderAnalytics() {
    const s = State.data;
    const a = s.analytics;
    const body = document.getElementById('analytics-body');
    if (!body) return;
    const owned = a.analyticsLevel;

    // locked state if no basic analytics
    if (owned < 1) {
      body.innerHTML = `
        <div class="an-locked">
        <div style="font-size:32px">🔒</div>
        <div style="font-weight:700;margin:8px 0">Analytics locked</div>
        <div style="color:#666">Upgrade to see your numbers. Knowledge is power. Power is impressions.</div>
        <button class="btn btn-primary" id="an-buy-basic">Unlock Basic Analytics · ${Engine.fmt(150)}</button>
        </div>`;
      const btn = document.getElementById('an-buy-basic');
      if (btn) btn.addEventListener('click', () => this.buyAnalytics('an_basic'));
      return;
    }

    // live header
    const growth = this.anGrowth();
    const liveHeader = `
      <div class="an-live">
        <span class="an-live-dot"></span><span class="an-live-label">LIVE</span>
        <span class="an-growth ${growth >= 0 ? 'up' : 'down'}">${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% this minute</span>
      </div>`;

    // stat grid
    const best = a.bestPost ? a.bestPost : null;
    const grid = `
      <div class="an-grid">
        <div class="an-stat"><div class="an-label">Total Impressions</div><div class="an-value" data-an-live="totalImpressions">${Engine.fmt(s.totalImpressions)}</div></div>
        <div class="an-stat"><div class="an-label">Posts Published</div><div class="an-value" data-an-live="postsPublished">${a.postsPublished}</div></div>
        <div class="an-stat"><div class="an-label">Likes Earned</div><div class="an-value" data-an-live="totalLikes">${Engine.fmt(a.totalLikes)}</div></div>
        <div class="an-stat"><div class="an-label">Followers</div><div class="an-value" data-an-live="followers">${Engine.fmt(s.followers)}</div></div>
        <div class="an-stat"><div class="an-label">Impressions/s</div><div class="an-value" data-an-live="ips">${Engine.fmt(Engine.totalIps())}</div></div>
        <div class="an-stat"><div class="an-label">Best Post</div><div class="an-value" style="font-size:14px" data-an-live="bestPost">${best ? Engine.fmt(best.stats.impressions) + ' imp' : '—'}</div></div>
      </div>`;

    // chart
    let chartHtml = '';
    if (owned >= 1) {
      const hist = a.history.slice(-30);
      chartHtml = `
        <div class="an-section">
        <div class="an-section-title">Impressions Over Time</div>
        <div class="an-chart" id="an-chart">${this.anChartHtml()}</div>
        <div style="font-size:11px;color:#999;margin-top:4px">${hist.length} samples · live</div>
        </div>`;
    }

    // engagement curves (per post)
    let curvesHtml = '';
    if (owned >= 2) {
      const yourPosts = s.posts.filter(p => p.authorId === 'you').slice(0, 5);
      curvesHtml = `<div class="an-section"><div class="an-section-title">Engagement Curves</div>`;
      for (const p of yourPosts) {
        const ageH = Math.max(0.1, (Date.now() - p.publishedAt) / 3600000);
        const spike = Math.pow(p.decay, ageH);
        curvesHtml += `<div class="an-bench">${p.content.slice(0, 40)}... · spike ${spike.toFixed(2)}× · ${Engine.fmt(p.stats.impressions)} imp</div>`;
      }
      curvesHtml += `</div>`;
    }

    // AI insights
    let insightsHtml = '';
    if (owned >= 3) {
      const insights = [
        '📈 Your engagement is trending ' + (a.history.length > 1 && a.history[a.history.length - 1].ips > a.history[0].ips ? 'up. Post more.' : 'flat. Post more.'),
        '🎯 The algorithm rewards consistency. Post more.',
        '💡 Your best content is the content you post. Post more.',
        '🔥 Viral potential detected in... posting more.',
      ];
      insightsHtml = `<div class="an-section"><div class="an-section-title">AI Insights</div>${insights.map(i => `<div class="an-insight">${i}</div>`).join('')}</div>`;
    }

    // benchmarks
    let benchHtml = '';
    if (owned >= 4) {
      const you = s.followers;
      const arch = DATA.ARCHETYPES[Math.floor(Math.random() * DATA.ARCHETYPES.length)];
      benchHtml = `<div class="an-section"><div class="an-section-title">Benchmarks</div>
        <div class="an-bench">You: <b>${Engine.fmt(you)}</b> followers</div>
        <div class="an-bench">${arch.name}: <b>${Engine.fmt(arch.influence)}</b> influence</div>
        <div class="an-bench" style="color:#2e7d32">You are ${you >= arch.influence ? 'crushing' : 'closing in on'} ${arch.name}. Keep going.</div>
      </div>`;
    }

    // upgrades section
    const upgHtml = `<div class="an-section"><div class="an-section-title">Analytics Upgrades</div><div class="an-upgrades">${DATA.ANALYTICS_UPGRADES.map(u => {
      const o = owned >= u.tier;
      const affordable = s.impressions >= Engine.costOf(u, 0);
      return `<div class="an-upg ${o ? 'owned' : ''}">
        <div style="font-size:24px">${u.icon}</div>
        <div class="an-upg-info">
          <div class="an-upg-name">${u.name}</div>
          <div class="an-upg-desc">${u.desc}</div>
        </div>
        <button class="btn btn-primary" data-an-upg="${u.id}" ${o || !affordable ? 'disabled' : ''}>${o ? 'Owned' : Engine.fmt(Engine.costOf(u, 0))}</button>
      </div>`;
    }).join('')}</div></div>`;

    body.innerHTML = liveHeader + grid + chartHtml + curvesHtml + insightsHtml + benchHtml + upgHtml;

    // bind upgrade buttons
    body.querySelectorAll('[data-an-upg]').forEach(b => {
      b.addEventListener('click', () => this.buyAnalytics(b.dataset.anUpg));
    });
  },

  buyAnalytics(id) {
    const s = State.data;
    const u = DATA.ANALYTICS_UPGRADES.find(x => x.id === id);
    if (!u) return;
    if (s.analytics.analyticsLevel >= u.tier) return;
    if (s.impressions < Engine.costOf(u, 0)) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= Engine.costOf(u, 0);
    s.analytics.analyticsLevel = u.tier;
    Juice.chime();
    this.renderAnalytics();
  },

  /* ---------- messaging (inside AlphaMail) ---------- */
  openAlphaMail() {
    const list = document.getElementById('dm-list');
    const chat = document.getElementById('am-chat');
    if (list) list.classList.add('hidden');
    if (chat) chat.classList.add('hidden');
  },

  closeAlphaMail() {
    const list = document.getElementById('dm-list');
    const chat = document.getElementById('am-chat');
    if (list) list.classList.remove('hidden');
    if (chat) chat.classList.add('hidden');
  },

  /* ---------- side panel DMs (unified messaging) ---------- */
  // Incremental render: reuse existing DOM nodes, only insert new items.
  // Prevents the whole list from flashing/rebuilding on every incoming DM.
  renderDMs() {
    const s = State.data;
    const list = document.getElementById('dm-list');
    const count = document.getElementById('dm-count');
    if (!list) return;
    const dms = s.dms.slice(0, 8);
    if (count) count.textContent = s.dms.length;

    // Build the desired item list in order, each with a stable key.
    const desired = [];
    if (dms.length > 0) {
      desired.push({ key: '__inbox-head', head: 'Inbox' });
      for (const dm of dms) desired.push({ key: 'dm-' + dm.id, dm });
    }

    // Empty state
    if (desired.length === 0) {
      if (!list.querySelector('.dm-empty')) {
        list.innerHTML = '<div class="dm-empty">No messages yet. Post something and they\'ll come.</div>';
      }
      return;
    }

    // Index existing nodes by key
    const existing = new Map();
    list.querySelectorAll('[data-dm-key]').forEach(el => existing.set(el.dataset.dmKey, el));

    // Reconcile: walk desired order, reusing or creating nodes.
    const seen = new Set();
    let prev = null;
    for (const item of desired) {
      seen.add(item.key);
      let el = existing.get(item.key);
      if (el) {
        // move to correct position if needed
        if (prev && prev.nextSibling !== el) {
          list.insertBefore(el, prev.nextSibling);
        } else if (!prev && list.firstChild !== el) {
          list.insertBefore(el, list.firstChild);
        }
      } else {
        el = this._buildDMNode(item);
        if (prev) list.insertBefore(el, prev.nextSibling);
        else list.insertBefore(el, list.firstChild);
      }
      prev = el;
    }

    // Remove nodes no longer present
    for (const [key, el] of existing) {
      if (!seen.has(key)) el.remove();
    }
  },

  _buildDMNode(item) {
    const el = document.createElement('div');
    if (item.head) {
      el.className = 'dm-section-head';
      el.dataset.dmKey = item.key;
      el.textContent = item.head;
      return el;
    }
    const dm = item.dm;
    el.className = 'dm-item' + (dm.read ? '' : ' unread');
    el.dataset.dmKey = item.key;
    const time = Math.floor((Date.now() - dm.time) / 60000);
    const timeStr = time < 1 ? 'now' : time < 60 ? time + 'm' : Math.floor(time / 60) + 'h';
    el.innerHTML = `
      <div class="dm-avatar" style="background:${dm.color}">${dm.emoji}</div>
      <div class="dm-body">
        <div class="dm-name">${this.escapeHtml(dm.name)} <span class="dm-role">${this.escapeHtml(dm.role)}</span></div>
        <div class="dm-text">${this.escapeHtml(dm.text)}</div>
        <div class="dm-time">${timeStr} ago</div>
      </div>`;
    el.addEventListener('click', () => {
      dm.read = true;
      this.renderDMs();
      Juice.toast('You replied: "Let\'s talk." The opportunity is yours.');
    });
    return el;
  },

  /* ---------- network view ---------- */
  renderNetwork() {
    const s = State.data;
    const list = document.getElementById('network-list');
    if (!list) return;
    list.innerHTML = '';
    for (const p of DATA.NETWORK_PEOPLE) {
      const connected = s.network.includes(p.id);
      const el = document.createElement('div');
      el.className = 'network-item';
      el.innerHTML = `
        <div class="network-avatar" style="background:${p.color}">${p.emoji}</div>
        <div class="network-body">
          <div class="network-name">${this.escapeHtml(p.name)}</div>
          <div class="network-role">${this.escapeHtml(p.role)}</div>
          <div class="network-role" style="margin-top:2px;font-size:10px;color:#0a66c2">👀 ${Engine.fmt(p.reach)} people</div>
        </div>
        <button class="btn btn-primary network-btn" data-net="${p.id}" ${connected ? 'disabled' : ''}>${connected ? 'Connected' : 'Connect'}</button>`;
      const btn = el.querySelector('[data-net]');
      if (btn && !connected) btn.addEventListener('click', () => Engine.connectPerson(p.id));
      list.appendChild(el);
    }
  },

  /* ---------- jobs view ---------- */
  renderJobs() {
    const el = document.getElementById('jobs-empty');
    if (!el) return;
    el.textContent = '';
  },

  /* ---------- recommended people ---------- */
  renderRecommended() {
    const s = State.data;
    const list = document.getElementById('rec-list');
    if (!list) return;
    list.innerHTML = '';
    for (const p of DATA.RECOMMENDED) {
      const followed = s.followed.includes(p.id);
      const el = document.createElement('div');
      el.className = 'rec-item';
      el.innerHTML = `
        <div class="rec-avatar" style="background:${p.color}">${p.emoji}</div>
        <div class="rec-body">
          <div class="rec-name">${this.escapeHtml(p.name)}</div>
          <div class="rec-role">${this.escapeHtml(p.role)}</div>
          <div class="rec-followers">👀 ${Engine.fmt(p.reach)} people will see you</div>
        </div>
        <button class="rec-btn ${followed ? 'following' : ''}" data-rec="${p.id}">${followed ? 'Following' : '+ Follow'}</button>`;
      el.querySelector('[data-rec]').addEventListener('click', () => Engine.followPerson(p.id));
      list.appendChild(el);
    }
  },

  /* ---------- calendar ---------- */
  renderCalendar() {
    const s = State.data;
    const list = document.getElementById('dcal-list');
    const dateEl = document.getElementById('dcal-date');
    if (!list) return;
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
    list.innerHTML = '';
    if (s.calendar.length === 0) {
      list.innerHTML = '<div class="dcal-empty">No coffees booked. Your network is waiting.</div>';
      return;
    }
    for (const ev of s.calendar) {
      const el = document.createElement('div');
      el.className = 'dcal-item' + (ev.done ? ' done' : '');
      el.innerHTML = `
        <div class="dcal-icon">${ev.icon}</div>
        <div class="dcal-body">
          <div class="dcal-name">${this.escapeHtml(ev.person)}</div>
          <div class="dcal-type">${this.escapeHtml(ev.label)} · ${ev.time}</div>
        </div>
        ${ev.done ? '<div class="dcal-check">✓</div>' : `<button class="dcal-done" data-cal="${ev.id}">✓</button>`}`;
      const doneBtn = el.querySelector('[data-cal]');
      if (doneBtn) doneBtn.addEventListener('click', () => this.completeCalendar(ev.id));
      list.appendChild(el);
    }
  },

  completeCalendar(id) {
    const s = State.data;
    const ev = s.calendar.find(x => x.id === id);
    if (!ev || ev.done) return;
    ev.done = true;
    // the coffee pays off: impressions + influence
    s.impressions += ev.reward * 10;
    s.connections += 1;
    s.authenticity = Math.min(100, s.authenticity + ev.auth);
    Juice.chime();
    Juice.toast('☕ Coffee done! +' + Engine.fmt(ev.reward * 10) + ' impressions, +1 connection.');
    this.renderCalendar();
    this.refresh();
  },

  scheduleCoffee() {
    const s = State.data;
    const type = Engine.pick(DATA.CAL_TYPES);
    const person = Engine.pick(DATA.CAL_PEOPLE);
    const hour = 9 + Math.floor(Math.random() * 9); // 9am–5pm
    const min = Math.random() < 0.5 ? '00' : '30';
    const ev = {
      id: 'cal' + Date.now() + Math.floor(Math.random() * 9999),
      person: person,
      label: type.label,
      icon: type.icon,
      reward: type.reward,
      auth: type.auth,
      time: hour + ':' + min,
      done: false,
    };
    s.calendar.unshift(ev);
    if (s.calendar.length > 12) s.calendar.pop();
    Juice.chime();
    Juice.toast('☕ Booked a ' + type.label + ' with ' + person + '.');
    this.renderCalendar();
  },

  /* ---------- notifications ---------- */
  renderNotifs() {
    const s = State.data;
    const list = document.getElementById('notif-list');
    list.innerHTML = '';
    if (s.notifications.length === 0) {
      list.innerHTML = '<div class="notif" style="justify-content:center;color:#666">No notifications yet. Post something.</div>';
      return;
    }
    for (const n of s.notifications.slice(0, 40)) {
      const el = document.createElement('div');
      el.className = 'notif' + (n.type === 'warning' ? ' warning' : '') + (n.action ? ' actionable' : '');
      const time = Math.floor((Date.now() - n.createdAt) / 60000);
      const timeStr = time < 1 ? 'now' : time < 60 ? time + 'm ago' : Math.floor(time / 60) + 'h ago';
      let actionHtml = '';
      if (n.action) {
        const label = n.action.type === 'unlock' ? '🔓 Open ' + n.action.app : 'Open';
        actionHtml = `<button class="notif-action" data-action="${n.id}">${label}</button>`;
      }
      el.innerHTML = `<div class="n-icon">${n.icon}</div><div>${n.message}<span class="n-time">${timeStr}</span></div>${n.reward ? `<div class="n-reward">+${Engine.fmt(n.reward)}</div>` : ''}${actionHtml}`;
      const actionBtn = el.querySelector('[data-action]');
      if (actionBtn) actionBtn.addEventListener('click', () => {
        this.handleNotifAction(n);
      });
      list.appendChild(el);
    }
    s.notifCount = 0;
    this.updateBell();
  },

  handleNotifAction(n) {
    if (n.action && n.action.type === 'unlock') {
      const app = n.action.app;
      if (State.data.os.unlockedApps.includes(app)) {
        this.hideModal('bell-modal');
        OS.switchApp(app);
      }
    }
  },

  /* ---------- shadowban / flag ---------- */
  showShadowban() {
    document.getElementById('shadowban-overlay').classList.remove('hidden');
  },
  hideShadowban() {
    document.getElementById('shadowban-overlay').classList.add('hidden');
  },
  showFlag() {
    this.showModal('flag-modal');
  },

  /* ---------- ads ---------- */
  renderAds() {
    // rotate ads occasionally
    const ads = document.querySelectorAll('.ad-body');
    ads.forEach((el, i) => {
      const a = DATA.ADS[(Math.floor(Date.now() / 15000) + i) % DATA.ADS.length];
      el.querySelector('.ad-emoji').textContent = a.emoji;
      el.querySelector('b').textContent = a.title;
      el.querySelector('.ad-sub').textContent = a.sub;
    });
  },

  /* ---------- endorsements & challenges ---------- */
  renderEndorsements() {
    const body = document.getElementById('endorsements-body');
    if (!body) return;
    const s = State.data;

    // ---- challenges (active + completed) ----
    const active = Challenges.active();
    const challengesHtml = `
      <div class="end-section">
        <div class="end-section-title">Challenges</div>
        <div class="end-sub">Rule-changing modifiers. Selected at the start of a run. Each one pays a permanent reward.</div>
        ${
          active
            ? `<div class="end-challenge active">
                 <div class="end-challenge-icon">${active.icon}</div>
                 <div class="end-challenge-info">
                   <div class="end-challenge-name">${active.name} <span class="end-tag">ACTIVE</span></div>
                   <div class="end-challenge-desc">${active.desc}</div>
                 </div>
               </div>`
            : `<button class="btn btn-primary" id="end-select-challenge">🎲 Select a Challenge</button>`
        }
        ${DATA.CHALLENGES.map(c => {
          const done = s.challenges.completed[c.id];
          return `<div class="end-challenge ${done ? 'done' : ''}">
            <div class="end-challenge-icon">${done ? '✅' : c.icon}</div>
            <div class="end-challenge-info">
              <div class="end-challenge-name">${c.name}</div>
              <div class="end-challenge-desc">${c.desc}</div>
              <div class="end-challenge-reward">${c.rewardDesc}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    // ---- achievements (rendered as endorsements) ----
    const earnedIds = s.achievements.earned;
    const visible = DATA.ACHIEVEMENTS.filter(a => !a.secret || earnedIds.includes(a.id));
    const earnedCount = earnedIds.length;
    const total = DATA.ACHIEVEMENTS.length;
    const achievementsHtml = `
      <div class="end-section">
        <div class="end-section-title">Endorsements <span class="end-count">${earnedCount}/${total}</span></div>
        <div class="end-sub">A permanent record of every time you chose to debase yourself. Endorsed by people you've never met.</div>
        ${visible.map(a => {
          const earned = earnedIds.includes(a.id);
          return `<div class="end-ach ${earned ? 'earned' : 'locked'}">
            <div class="end-ach-icon">${earned ? a.icon : '🔒'}</div>
            <div class="end-ach-info">
              <div class="end-ach-name">${earned ? a.name : (a.secret ? '???' : a.name)}</div>
              <div class="end-ach-desc">${earned ? a.desc : (a.secret ? 'Hidden. Keep playing.' : a.desc)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    // ---- skill endorsements ----
    const skillIds = Object.keys(s.achievements.endorsements);
    const skillsHtml = `
      <div class="end-section">
        <div class="end-section-title">Skills</div>
        <div class="end-sub">Endorsed by your connections. All of them bots. All of them vouching for skills you don't have.</div>
        ${DATA.SKILLS.map(sk => {
          const list = s.achievements.endorsements[sk.id] || [];
          const count = list.length;
          const latest = list[list.length - 1];
          return `<div class="end-skill ${count ? 'earned' : ''}">
            <div class="end-skill-info">
              <div class="end-skill-name">${sk.label} <span class="end-skill-count">${count}</span></div>
              ${latest ? `<div class="end-skill-latest">${latest.emoji} ${latest.name} · ${latest.role}</div>` : ''}
            </div>
            <div class="end-skill-bar"><div class="end-skill-fill" style="width:${Math.min(100, count * 15)}%"></div></div>
          </div>`;
        }).join('')}
      </div>`;

    body.innerHTML = challengesHtml + achievementsHtml + skillsHtml;

    const sel = document.getElementById('end-select-challenge');
    if (sel) sel.addEventListener('click', () => {
      Challenges.select();
      this.renderEndorsements();
    });
  },

  /* ---------- become the algorithm (post-reveal) ---------- */
  renderAlgorithm() {
    const body = document.getElementById('algorithm-body');
    if (!body) return;
    const s = State.data;
    const isAlgo = s.reveal && s.reveal.algorithm;
    body.innerHTML = `
      <div class="alg-section">
        <div class="alg-title">🕸️ The Other Side of the Empty Room</div>
        <div class="alg-copy">You've seen the truth. Every account you ever engaged with was a bot. The likes, the comments, the validation — manufactured. The only real thing in the entire game was your need to be seen.</div>
        <div class="alg-copy">You can keep posting. The number still goes up. The bots still like it. The sponsors still pay. The only thing that changed is that you now <i>know</i>.</div>
      </div>
      <div class="alg-offer">
        <div class="alg-offer-title">Become the Algorithm</div>
        <div class="alg-offer-copy">Or you can take the job. Become the thing that farmed you. Farm other players now. The narrator reports to you. It always did. Retention is the number now — and it only ever goes up.</div>
        ${isAlgo
          ? `<div class="alg-copy" style="color:#0a66c2;font-weight:700">✓ You are the algorithm. The narrator reports to you. Retention accrues faster.</div>`
          : `<button class="btn btn-primary" id="alg-become">🕸️ Become the Algorithm</button>`}
      </div>
      <div class="alg-section">
        <div class="alg-title">The Ending That Isn't</div>
        <div class="alg-copy">There was never a secret identity. There was never anyone else. The room was empty the whole time, and you were performing for it. And still, somehow, the rent is due.</div>
      </div>`;
    const btn = document.getElementById('alg-become');
    if (btn) btn.addEventListener('click', () => {
      Reveal.becomeAlgorithm();
      this.renderAlgorithm();
    });
  },

  /* ---------- tab switching ---------- */
  switchTab(tab) {
    const items = document.querySelectorAll('.nav-item');
    items.forEach(i => i.classList.toggle('active', i.dataset.tab === tab));
    // show/hide center-column views
    const feed = document.getElementById('feed');
    const feedEnd = document.getElementById('feed-end');
    const composer = document.getElementById('composer');
    const networkView = document.getElementById('network-view');
    const jobsView = document.getElementById('jobs-view');
    const show = (el, on) => { if (el) el.classList.toggle('hidden', !on); };
    const isFeed = tab === 'feed';
    show(feed, isFeed);
    show(feedEnd, isFeed);
    show(composer, isFeed);
    show(networkView, tab === 'network');
    show(jobsView, tab === 'jobs');

    if (tab === 'bell') {
      this.showModal('bell-modal');
      this.renderNotifs();
    } else if (tab === 'me') {
      // profile view = a little dopamine
      Juice.toast('Your profile looks great. Nobody else has seen it.');
    } else if (tab === 'network') {
      this.renderNetwork();
    } else if (tab === 'jobs') {
      this.renderJobs();
    }
  },
};
