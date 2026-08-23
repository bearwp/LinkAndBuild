/* ============================================================
   LINK & BUILD — UI
   Feed rendering, composer, growth console, bell, modals.
   ============================================================ */

const UI = {
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
    // engagement rate (the algorithm's favorite number) + dead followers
    const engEl = $('stat-engagement');
    if (engEl) {
      const rate = Maxxing.engagementRate();
      // cap the display at a sane ceiling so a synthetic/god state never
      // reads as a broken percentage
      const shown = Math.min(99.9, rate * 100);
      const pct = shown.toFixed(1);
      engEl.textContent = pct + '%';
      engEl.classList.toggle('rate-bad', rate < 0.01);
      engEl.classList.toggle('rate-mid', rate >= 0.01 && rate < 0.02);
    }
    const deadRow = $('dead-row');
    if (deadRow) {
      const dead = Maxxing.deadCount();
      deadRow.classList.toggle('hidden', dead <= 0);
      if (dead > 0) $('stat-dead').textContent = Engine.fmt(dead);
    }
    // daily posting streak (nav badge)
    const streakBadge = $('streak-badge');
    if (streakBadge) {
      streakBadge.textContent = s.streak && s.streak.count ? s.streak.count : '';
      streakBadge.style.display = (s.streak && s.streak.count > 0) ? 'inline-block' : 'none';
    }
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
      'nav-streak': unlocked,            // the streak (the addiction)
      'nav-dms': unlocked,               // messages (collabs)
      // right rail
      'growth-card': unlocked,           // after the arc: growth console
      'next-card': unlocked,             // next unlock nudge
      'rec-card': true,                   // people you may know — follow to grow the feed
      'ads-card': followers >= 100,      // sponsored content
      'footer-card': followers >= 100,   // footer links
      // menu items
      'menu-analytics': unlocked,        // analytics menu
      'menu-pillars': unlocked,          // niche pillars
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
      'nav-streak': 'Your Posting Streak',
      'nav-dms': 'Messages',
      'growth-card': 'The Growth Console',
      'next-card': 'Next Unlock',
      'rec-card': 'People you may know',
      'ads-card': 'Sponsored content',
      'footer-card': 'The fine print',
      'menu-analytics': 'Analytics',
      'menu-pillars': 'Niche Pillars',
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
  _harvesting: false, // true while the player is holding a post to harvest it
  _rerenderQueued: false, // a feed rebuild was deferred because a harvest was in progress
  _pendingNew: [], // posts queued behind the "show new posts" bar (not yet in the feed)
  _newBarShown: false, // whether the new-posts bar is currently visible
  _newBarDirty: false, // the bar's count is stale and needs a repaint

  // Track which post cards are on screen so the 60fps loop only updates
  // visible cards instead of every post in the feed.
  _initVisibility() {
    if (this._visObserver) return;
    this._visObserver = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = e.target.dataset.postId;
        if (!id) continue;
        if (e.isIntersecting) {
          this._visiblePosts.add(id);
        } else {
          this._visiblePosts.delete(id);
        }
      }
    }, { rootMargin: '200px 0px' });
  },
  isPostVisible(id) { return this._visiblePosts.has(id); },
  _observeCard(card) {
    this._initVisibility();
    this._visObserver.observe(card);
  },

  // When a post scrolls into view and its tags are absorbed, spawn little tag
  // chips that sweep up from the post and gather into the bucket in the right
  // rail. The bucket "harvests" the scroll — tags arc up and funnel in together.
  flyTagsToBucket(post, added) {
    const card = this._cards.get(post.id);
    const bucket = document.getElementById('bucket-card');
    if (!card || !bucket || !added) return;
    const from = card.getBoundingClientRect();
    const to = bucket.getBoundingClientRect();
    const tags = Tags.postTags(post);
    if (!tags.length) return;
    // pick `added` tags (may repeat) to fly
    const fly = [];
    for (let i = 0; i < added; i++) fly.push(tags[i % tags.length]);
    const n = fly.length;
    for (let i = 0; i < n; i++) {
      const d = Tags.def(fly[i]);
      const chip = document.createElement('div');
      chip.className = 'tag-fly';
      chip.textContent = (d ? d.emoji + ' ' + d.name : 'tag');
      // start scattered across the post's tag row (sweep the field)
      const sx = from.left + from.width * (0.15 + 0.7 * (n === 1 ? 0.5 : i / (n - 1)));
      const sy = from.top + from.height * 0.75;
      // funnel into a tight cluster near the bucket's center (a shared harvest)
      const spread = n <= 1 ? 0 : 8;
      const tx = to.left + to.width / 2 + (Math.random() - 0.5) * spread;
      const ty = to.top + to.height * 0.4 + (Math.random() - 0.5) * spread;
      chip.style.left = sx + 'px';
      chip.style.top = sy + 'px';
      chip.style.setProperty('--tx', (tx - sx) + 'px');
      chip.style.setProperty('--ty', (ty - sy) + 'px');
      // sweep upward (harvest) and funnel in, staggered so it reads as a wave
      chip.style.animationDelay = (i * 0.045) + 's';
      document.body.appendChild(chip);
      // remove after the animation completes
      setTimeout(() => chip.remove(), 720 + i * 45);
    }
  },

  // Coalesce rapid feed changes (stream posts, auto posts) into one render.
  renderFeedDebounced() {
    if (this._feedDebounceT) return;
    this._feedDebounceT = setTimeout(() => {
      this._feedDebounceT = null;
      this.renderFeed();
    }, 250);
  },

  // Queue a newly-arrived post behind the "show new posts" bar instead of
  // inserting it into the feed. The bar counts what's waiting; clicking it
  // loads them all at once.
  queueNewPost(post) {
    if (!post) return;
    if (this._cards.has(post.id) || this._feedIds.has(post.id)) return;
    if (this._pendingNew.some(p => p.id === post.id)) return;
    // Before the first post the feed is hidden (first-run mode) and there is
    // nothing on screen to yank — render straight into it so the posts are
    // already there the moment the player's first post lifts first-run.
    if (State.data.analytics.postsPublished === 0) {
      this.renderFeedDebounced();
      return;
    }
    this._pendingNew.push(post);
    this._newBarDirty = true;
    // paint immediately (don't wait for the next tick)
    this._paintNewBar();
  },

  // Show the bar with its current count (called on a throttle from the tick).
  _paintNewBar() {
    const bar = document.getElementById('new-posts-bar');
    if (!bar) return;
    const n = this._pendingNew.length;
    if (n > 0) {
      bar.classList.remove('hidden');
      const count = document.getElementById('new-posts-count');
      const label = document.getElementById('new-posts-label');
      if (count) count.textContent = n;
      if (label) label.textContent = n === 1 ? 'new post' : 'new posts';
      this._newBarShown = true;
    } else if (this._newBarShown) {
      bar.classList.add('hidden');
      this._newBarShown = false;
    }
    this._newBarDirty = false;
  },

  // Load the queued posts into the feed (the bar's click handler).
  loadNewPosts() {
    if (!this._pendingNew.length) {
      this._paintNewBar();
      return;
    }
    this._pendingNew = [];
    this._newBarDirty = false;
    this.renderFeed();
  },

  // Called from the engine's 60fps loop: keep the bar's count fresh without
  // forcing a full feed rebuild.
  updateNewBar() {
    if (this._newBarDirty) this._paintNewBar();
  },

  // Run a feed rebuild that was deferred because a harvest was in progress.
  _flushQueuedRender() {
    if (this._rerenderQueued) {
      this._rerenderQueued = false;
      this.renderFeed();
    }
  },

  renderFeed() {
    // While the player is holding a post to harvest, don't rebuild the feed —
    // a new post inserting would yank the card out from under their hold.
    // Defer the rebuild and run it once the hold releases.
    if (this._harvesting) { this._rerenderQueued = true; return; }
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
    // A post that is queued behind the new-posts bar is not shown yet.
    const queued = new Set(this._pendingNew.map(p => p.id));
    const shown = posts.filter(p => !queued.has(p.id));
    // Drop queued posts that no longer belong in the feed at all (e.g. they
    // fell off the cap or the author got unfollowed), but keep the rest.
    const stillInFeed = new Set(posts.map(p => p.id));
    this._pendingNew = this._pendingNew.filter(p => stillInFeed.has(p.id));

    // In-place update: only add/remove cards, never rebuild all.
    const existing = new Map();
    feed.querySelectorAll('.post-card').forEach(c => {
      const id = c.dataset.postId;
      if (id) existing.set(id, c);
    });

    // Scroll anchor: remember the topmost visible card and where it sits
    // relative to the feed, so streaming a new post above it can be
    // compensated and the reader isn't yanked away from what they're reading.
    const feedRect = feed.getBoundingClientRect();
    let anchor = null, anchorTop = null;
    for (const c of feed.querySelectorAll('.post-card')) {
      const r = c.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        anchor = c.dataset.postId;
        anchorTop = r.top - feedRect.top;
        break;
      }
    }

    const seen = new Set();
    // posts array is newest-first; iterate oldest-first so prepending
    // leaves the newest post at the top of the feed.
    for (let i = shown.length - 1; i >= 0; i--) {
      const post = shown[i];
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

    // Restore scroll position: if the anchored card survived and its position
    // relative to the feed shifted (a new post was inserted above it), nudge
    // the page scroll by exactly that delta so the post stays put.
    if (anchor) {
      const card = existing.get(anchor) || feed.querySelector('.post-card[data-post-id="' + anchor + '"]');
      if (card) {
        const r = card.getBoundingClientRect();
        const newTop = r.top - feed.getBoundingClientRect().top;
        const delta = newTop - anchorTop;
        if (Math.abs(delta) > 1) {
          const scroller = document.scrollingElement || document.documentElement;
          scroller.scrollTop += delta;
        }
      }
    }

    // empty-feed nudge: a fresh account has nothing to scroll until it follows
    // someone. Point at the rail instead of leaving a dead feed.
    const feedEnd = document.getElementById('feed-end');
    if (feedEnd) {
      const empty = posts.length === 0;
      feedEnd.textContent = empty
        ? 'Your feed is empty. Follow people from "People you may know" to fill it.'
        : "You're all caught up. Keep scrolling anyway.";
    }
    // keep the new-posts bar's count in sync after any rebuild
    this._paintNewBar();
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
    // dopamine juice is reserved for your own posts — an NPC post ticking up
    // is background noise, not a win, so it updates its number quietly while
    // your own gains get the float, pop, and fanfare.
    const mine = post.authorId === 'you';
    const impNew = Engine.fmtTick(stats.impressions);
    const likeNew = Engine.fmtTick(stats.likes);
    const comNew = Engine.fmtTick(stats.comments);
    if (impEl && impEl.textContent !== impNew) {
      const delta = stats.impressions - (post._lastShownImp || 0);
      post._lastShownImp = stats.impressions;
      impEl.textContent = impNew;
      if (mine) {
        // how many impressions landed since the last paint — the amount we
        // cascade into the "+N" float so every gain is legible, not just a blur
        this._impressionWin(post, delta);
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
    // reply-guy race: live countdown on the ring, and resolve when it hits 0
    if (post.race && !post.raceWon) {
      const ring = card.querySelector('.race-ring');
      const left = Math.max(0, post.raceEndsAt - Date.now());
      if (ring && ring.textContent !== String(Math.ceil(left / 1000))) {
        ring.textContent = Math.ceil(left / 1000);
      }
    }
    // golden hour: live countdown on the timer bar
    if (post.authorId === 'you') {
      const ghFill = card.querySelector('[data-gh]');
      const ghLabel = card.querySelector('[data-gh-label]');
      if (ghFill || ghLabel) {
        const left = Maxxing.goldenLeft(post);
        if (left !== null && left > 0) {
          const pct = (left / (Maxxing.GOLDEN_WINDOW * 1000)) * 100;
          if (ghFill) ghFill.style.width = pct + '%';
          if (ghLabel) ghLabel.textContent = '⏱ First-hour window ' + Math.ceil(left / 1000) + 's · engagement doubles reach';
        } else if (ghFill) {
          ghFill.style.width = '0%';
          if (ghLabel && ghLabel.textContent !== '') ghLabel.textContent = '';
        }
      }
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
    card.className = 'post-card' + (post.fourthWall ? ' fourthwall' : '') + (post.scare ? ' scare' : '') + (post.ratioed ? ' ratioed' : '');
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

    // rage-bait badge on hot-take posts
    const rageBadge = (post.tone === 'hot' || post.tone === 'unpopular')
      ? `<span class="rage-badge">${post.tone === 'hot' ? '🔥' : '💣'} ${post.tone === 'hot' ? 'HOT TAKE' : 'UNPOPULAR'}</span>`
      : '';
    // A/B test chip + button on your posts
    const abChip = (isYou && Maxxing.abState(post.id))
      ? `<span class="ab-chip">${Maxxing.abState(post.id).decided ? (Maxxing.abState(post.id).winner ? '✓ won' : '✗ lost') : '🧪 testing'}</span>`
      : '';

    const stats = post.stats;
    const likeBtn = isYou
      ? `<div class="pa-btn"><span class="thumb">👍</span> Like</div>`
      : `<button class="pa-btn ${post.likedByYou ? 'liked' : ''}" data-like="${post.id}"><span class="thumb">👍</span> Like</button>`;
    const commentBtn = isYou
      ? `<div class="pa-btn"><span>💬</span> Comment</div>`
      : `<button class="pa-btn" data-comment="${post.id}"><span>💬</span> Comment</button>`;
    // A/B test button on your own posts
    const abBtn = (isYou && !Maxxing.abState(post.id))
      ? `<button class="pa-btn ab-btn" data-ab="${post.id}"><span>🧪</span> A/B Test</button>`
      : '';
    // reply-guy race bar (a big account posted, be first)
    let raceHtml = '';
    if (post.race) {
      const left = Math.max(0, post.raceEndsAt - Date.now());
      const won = post.raceWon;
      const ringCls = won ? (post.raceWinner === 'you' ? 'won' : 'lost') : '';
      raceHtml = `<div class="race-bar">
        <div class="race-ring ${ringCls}">${won ? (post.raceWinner === 'you' ? '🏆' : '🤖') : Math.ceil(left / 1000)}</div>
        <div class="race-box">
          <div class="race-title">${won ? (post.raceWinner === 'you' ? 'You were first. Top comment.' : 'A bot beat you.') : 'Be first to comment'}</div>
          <div class="race-sub">${won ? '' : 'First comment gets 3× reach. The algorithm rewards speed.'}</div>
        </div>
        ${!won ? `<button class="race-comment-btn" data-race="${post.id}">Be first</button>` : ''}
      </div>`;
    }

    let commentsHtml = '';
    if (post.comments && post.comments.length) {
      const SHOW_LIMIT = 3;
      const total = post.comments.length;
      const shown = post._showAllComments ? post.comments : post.comments.slice(-SHOW_LIMIT);
      const hidden = post._showAllComments ? 0 : total - shown.length;
      const rows = shown.map((c, ci) => {
        const idx = post.comments.indexOf(c);
        const replyBtn = isYou && !c.replied && c.author !== 'You'
          ? `<button class="pc-reply" data-reply="${post.id}" data-reply-idx="${idx}">Reply</button>`
          : '';
        const replied = c.replied
          ? `<div class="pc-replied">✓ Replied</div><div class="pc-replied-text">${this.escapeHtml(c.replyText || 'Thanks! Really appreciate the support. 🙏')}</div>`
          : '';
        return `
        <div class="pc${c.troll ? ' pc-troll' : ''}">
          <div class="pc-avatar" style="background:${c.color || '#b3c6d8'}">${c.emoji || '🙂'}</div>
          <div class="pc-body">
            <div class="pc-author">${this.escapeHtml(c.author)} <span class="pc-role">${c.role || ''}</span></div>
            <div class="pc-text">${this.escapeHtml(c.text)}</div>
            ${replyBtn}
            ${replied}
          </div>
        </div>`;
      }).join('');
      const moreLink = hidden > 0
        ? `<button class="pc-more" data-more="${post.id}">Show all ${total} comments</button>`
        : '';
      commentsHtml = `<div class="post-comments">${rows}${moreLink}</div>`;
    } else {
      // always render the container so live comments can append into it
      commentsHtml = `<div class="post-comments"></div>`;
    }

    // golden hour: a pulsing timer bar on your fresh posts
    let goldenHtml = '';
    if (isYou) {
      const gh = State.data.goldenHour[post.id];
      if (gh) {
        if (gh.autoManaged) {
          goldenHtml = `<div class="gh-bar"><div class="gh-fill" style="width:100%;background:linear-gradient(90deg,#0a66c2,#7fb8e8)"></div></div><div class="gh-label auto">📅 Auto-managed by Scheduler</div>`;
        } else {
          const left = Math.max(0, gh.windowEnd - Date.now());
          const pct = (left / (Maxxing.GOLDEN_WINDOW * 1000)) * 100;
          goldenHtml = `<div class="gh-bar"><div class="gh-fill" data-gh="${post.id}" style="width:${pct}%"></div></div><div class="gh-label" data-gh-label="${post.id}">⏱ First-hour window ${Math.ceil(left / 1000)}s · engagement doubles reach</div>`;
        }
      }
    }

    card.innerHTML = `
      <div class="post-head">
        <div class="avatar" style="background:${post.authorColor}">${post.authorEmoji}</div>
        <div>
          <div class="post-author">${post.authorName}${youTag}${tierBadge}${rageBadge}${abChip}</div>
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
      ${goldenHtml}
      ${raceHtml}
      <div class="post-actions">${likeBtn}${commentBtn}${abBtn}<div class="pa-btn"><span>↗</span> Repost</div><div class="pa-btn"><span>✈️</span> Send</div>${post.authorId === 'you' ? `<div class="pa-btn boost" data-boost="${post.id}"><span>🚀</span> Boost</div>` : ''}</div>
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

    // click an NPC author's NAME to open their profile / rapport popup
    if (post.isNPC) {
      const nameEl = card.querySelector('.post-author');
      if (nameEl) nameEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const person = post.authorPersonId
          ? (DATA.RECOMMENDED.find(p => p.id === post.authorPersonId) || DATA.NETWORK_PEOPLE.find(p => p.id === post.authorPersonId))
          : null;
        this.openRapport(post.authorId, person);
      });
    }

    const commentBtnEl = card.querySelector('[data-comment]');
    if (commentBtnEl) commentBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openCommentPop(commentBtnEl, post);
    });

    const boostBtnEl = card.querySelector('[data-boost]');
    if (boostBtnEl) boostBtnEl.addEventListener('click', () => {
      Engine.boostPost(post.id);
      this.updatePostCard(post);
    });

    // reply to a comment (manual boost — the engage bot does it silently)
    card.querySelectorAll('[data-reply]').forEach(btn => {
      btn.addEventListener('click', () => {
        Maxxing.replyToComment(post.id, parseInt(btn.dataset.replyIdx, 10));
      });
    });

    // reply-guy race: be first to comment
    const raceBtn = card.querySelector('[data-race]');
    if (raceBtn) raceBtn.addEventListener('click', () => {
      Maxxing.winRace(post.id);
      this.updatePostCard(post);
    });

    // A/B test
    const abBtnEl = card.querySelector('[data-ab]');
    if (abBtnEl) abBtnEl.addEventListener('click', () => {
      Maxxing.startAbTest(post.id);
      this.updatePostCard(post);
    });

    // "Show all X comments" expand
    const moreEl = card.querySelector('[data-more]');
    if (moreEl) moreEl.addEventListener('click', () => {
      post._showAllComments = true;
      this.renderFeed();
    });

    // restore the on-fire state so flames persist across feed rebuilds
    if (post.onFire) this._ignite(post, card);

    // HOLD-TO-HARVEST: press and hold an NPC post to pull its tags into the
    // bucket. It shakes while you hold; when the bar fills it pops and the
    // tags fly out. Releasing early cancels with no gain.
    if (post.isNPC && !post._absorbed) {
      this._bindHarvest(card, post);
    }

    return card;
  },

  _bindHarvest(card, post) {
    const HOLD_MS = 700;                 // how long to hold for a full harvest
    let timer = null, startedAt = 0;
    let harvested = false;
    const overlay = document.createElement('div');
    overlay.className = 'harvest-bar';
    card.appendChild(overlay);

    const begin = (e) => {
      e.preventDefault();
      if (harvested) return;
      startedAt = performance.now();
      card.classList.add('harvesting');
      this._harvesting = true;
      const tick = (now) => {
        if (harvested) return;
        const p = Math.min(1, (now - startedAt) / HOLD_MS);
        overlay.style.width = (p * 100) + '%';
        // shake faster as it nears completion
        card.style.animationDuration = (0.5 - p * 0.32) + 's';
        if (p >= 1) { harvest(); return; }
        timer = requestAnimationFrame(tick);
      };
      timer = requestAnimationFrame(tick);
    };
    const cancel = () => {
      if (harvested) return;
      if (timer) cancelAnimationFrame(timer);
      overlay.style.width = '0%';
      card.classList.remove('harvesting');
      this._harvesting = false;
      this._flushQueuedRender();
    };
    const harvest = () => {
      if (harvested) return;
      harvested = true;
      if (timer) cancelAnimationFrame(timer);
      this._harvesting = false;
      post._absorbed = true;
      card.classList.remove('harvesting');
      card.classList.add('harvested');
      const added = Tags.absorb(post);
      this._bucketDirty = true;
      if (added > 0) {
        this.flyTagsToBucket(post, added);
        Bus.emit('tag:absorbed', { post, added });
      }
      // pop, then fade the card so it reads as "spent"
      setTimeout(() => card.classList.add('harvested-gone'), 450);
      // any feed rebuilds deferred during the hold can run now
      this._flushQueuedRender();
    };

    card.addEventListener('pointerdown', begin);
    card.addEventListener('pointerup', cancel);
    card.addEventListener('pointerleave', cancel);
    card.addEventListener('pointercancel', cancel);
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
    // tone warning: rage-bait costs authenticity and risks a ratio
    const toneSel = document.getElementById('opt-tone');
    const toneWarn = document.getElementById('tone-warn');
    if (toneSel && toneWarn) {
      const tone = toneSel.value;
      if (tone === 'hot') {
        toneWarn.textContent = '🔥 Hot take: 2.5× reach, −12 authenticity, ratio risk.';
        toneWarn.classList.remove('hidden');
      } else if (tone === 'unpopular') {
        toneWarn.textContent = '💣 Unpopular opinion: 3.5× reach, −20 authenticity, ratio risk.';
        toneWarn.classList.remove('hidden');
      } else {
        toneWarn.classList.add('hidden');
      }
    }
    // trending chip: the countdown ring for newsjacking
    this.updateTrendingChip();
  },

  // the trending tag chip in the composer (newsjacking)
  // Throttled: the uiLoop calls it every frame, but it only needs to repaint
  // when the countdown crosses a second boundary (or the tag appears/expires).
  _trendingChipAt: 0,
  updateTrendingChip() {
    const row = document.getElementById('trending-row');
    const chip = document.getElementById('trending-chip');
    if (!row || !chip) return;
    const info = Maxxing.trendingInfo();
    if (!info) {
      if (!row.classList.contains('hidden')) row.classList.add('hidden');
      return;
    }
    const secs = Math.ceil(info.left / 1000);
    const used = info.used;
    // repaint only when the visible second or used-state changes, or when
    // the chip is currently hidden
    if (row.classList.contains('hidden') || chip.dataset.secs !== String(secs) || chip.dataset.used !== String(used)) {
      row.classList.remove('hidden');
      const d = Tags.def(info.tagId);
      chip.className = 'trending-chip' + (used ? ' expired' : '');
      chip.innerHTML = (d ? d.emoji + ' ' + d.name : info.tagId) +
        (used
          ? ' <span class="tc-timer">used</span>'
          : ' <span class="tc-timer">' + secs + 's</span>');
      chip.dataset.secs = String(secs);
      chip.dataset.used = String(used);
    }
  },

  openComposer() {
    this.showModal('composer-modal');
    document.getElementById('post-text').focus();
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
      const out = g.out || {};
      const parts = [];
      if (out.imp) parts.push('+' + Engine.fmt(out.imp * owned) + ' imp/s');
      if (out.like) parts.push('+' + Engine.fmt(out.like * owned) + ' likes/s');
      if (out.follow) parts.push('+' + Engine.fmt(out.follow * owned) + ' followers/s');
      const each = [];
      if (out.imp) each.push('+' + Engine.fmt(out.imp) + ' imp/s');
      if (out.like) each.push('+' + Engine.fmt(out.like) + ' likes/s');
      if (out.follow) each.push('+' + Engine.fmt(out.follow) + ' followers/s');
      const item = document.createElement('div');
      item.className = 'g-item' + (owned > 0 ? ' owned running' : ' idle');
      item.innerHTML = `
        <div class="g-item-icon">${g.icon}</div>
        <div class="g-item-info">
          <div class="g-item-name">${g.name} <span class="g-item-count">${owned > 0 ? '×' + owned : ''}</span></div>
          <div class="g-item-desc">${g.desc}</div>
          <div class="g-item-stats">
            ${owned > 0
              ? `<span class="g-output">${parts.join(' ')}</span> <span class="g-per">(each: ${each.join(', ')})</span>`
              : `<span class="g-would">⚙️ ${each.join(', ')}</span>`}
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
      { key: 'content',  icon: '✍️', label: 'CONTENT' },
      { key: 'audience', icon: '👥', label: 'AUDIENCE' },
      { key: 'engage',   icon: '👍', label: 'ENGAGE' },
      { key: 'schedule', icon: '📅', label: 'DISTRIBUTE' },
    ];

    // a conveyor: each gate is a machine station; a flowing workpiece carries
    // the count from one station to the next; the output falls into the hopper.
    const stations = order.map((o, i) => {
      const g = gates[o.key] || { hand: true, name: o.key };
      const isMachine = !g.hand;
      const val = Engine.fmtTick(flow[o.key]);
      const gear = isMachine ? '⚙️' : o.icon;
      return `
        <div class="fl-station ${isMachine ? 'machine' : 'hand'}">
          <div class="fl-machine ${isMachine ? 'machine' : 'hand'}">
            <span class="fl-gear">${gear}</span>
            <div class="fl-flow-val" data-gate="${o.key}" style="font-size:10px;font-weight:800;color:${isMachine ? '#0a66c2' : '#999'};font-variant-numeric:tabular-nums;">${val}</div>
          </div>
          <div class="fl-slot-label">${o.label}</div>
        </div>
        ${i < order.length - 1 ? '<div class="fl-flow"><span class="workpiece"></span></div>' : ''}
        ${i === order.length - 1 ? '<div class="fl-hopper"><span class="fl-hopper-num" data-gate="out">' + val + '</span><span class="fl-hopper-label">IMP/S</span></div>' : ''}
      `;
    }).join('');

    return `
      <div class="factory-line ${gens > 0 ? 'online' : 'offline'}">
        <div class="fl-head">
          <div class="fl-title">🏭 THE FACTORY</div>
          <div class="fl-rpm"><span class="rpm-dot ${gens > 0 ? 'blink' : ''}"></span><span data-rpm>${gens > 0 ? Engine.fmt(p.ips) : 0}/s</span></div>
        </div>
        <div class="fl-conveyor">
          <div class="fl-belt"></div>
          <div class="fl-track">${stations}</div>
        </div>
        <div class="fl-sub">${gens > 0 ? 'The machine is running. It never sleeps, never stops, never asks why.' : 'Every step is yours by hand. Buy a machine and it runs without you.'}</div>
        <div class="fl-machines-note" data-note>Built by hand first. Delegate each step to a machine.</div>
      </div>`;
  },

  // render (or create) the always-visible factory strip in the right rail
  renderFactoryStrip() {
    const strip = document.getElementById('factory-strip');
    if (!strip) return;
    strip.innerHTML = this.factoryLineHtml();
  },

  // Live-tick the factory strip in place while visible. Each station's flow
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
      out: p.impressions,
    };
    line.querySelectorAll('[data-gate]').forEach(el => {
      const key = el.dataset.gate;
      if (key && flow[key] !== undefined) {
        const v = Engine.fmtTick(flow[key]);
        if (el.textContent !== v) el.textContent = v;
      }
    });
    const rpm = line.querySelector('[data-rpm]');
    if (rpm) {
      const v = Engine.fmt(p.impressions) + '/s';
      if (rpm.textContent !== v) rpm.textContent = v;
    }
    const note = line.querySelector('[data-note]');
    if (note) note.style.display = gens > 0 ? 'block' : 'none';
    // refresh handler badges when a gate's ownership changes
    const title = line.querySelector('.fl-title');
    if (title) title.textContent = '🏭 THE FACTORY';
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
    const s = State.data;
    // jobs unlock at 200 followers; before that show the locked nudge
    if (s.followers < 200) {
      el.innerHTML = `<div class="jobs-locked">
        <div style="font-size:32px">🔒</div>
        <div style="font-weight:700;margin:8px 0">Jobs are locked</div>
        <div style="color:#666">Reach 200 followers and the algorithm will start dangling "opportunities" at you.</div>
        <div style="color:#999;margin-top:6px;font-size:11px">${Engine.fmt(200 - s.followers)} followers to go</div>
      </div>`;
      return;
    }
    const jobs = DATA.JOBS.map(j => `
      <div class="job-item">
        <div class="job-icon">${j.icon}</div>
        <div class="job-body">
          <div class="job-title">${j.title}</div>
          <div class="job-company">${j.company} · <span class="job-tag">${j.tag}</span></div>
          <div class="job-desc">${j.desc}</div>
          <div class="job-pay">${j.salary}</div>
        </div>
        <button class="btn btn-primary job-apply" data-job="${j.id}">${j.apply}</button>
      </div>`).join('');
    el.innerHTML = `<div class="jobs-head">
        <span class="jobs-title">💼 Opportunities</span>
        <span class="jobs-sub">The algorithm dangles a ladder. The ladder is a treadmill.</span>
      </div><div class="jobs-list">${jobs}</div>`;
    el.querySelectorAll('[data-job]').forEach(b => {
      b.addEventListener('click', () => {
        const j = DATA.JOBS.find(x => x.id === b.dataset.job);
        if (!j) return;
        if (j.id === 'j6') {
          // the algorithm's own listing: the loop closes
          Juice.toast('You applied. The algorithm noted your application. The room is still empty.');
          Narrator.say('jobs_applied', 'notif');
        } else {
          Juice.toast('Applied to ' + j.title + ' at ' + j.company + '. They will ghost you. The algorithm watched.');
        }
        b.textContent = 'Applied';
        b.disabled = true;
      });
    });
  },

  /* ---------- recommended people ---------- */
  renderRecommended() {
    const s = State.data;
    const list = document.getElementById('rec-list');
    const card = document.getElementById('rec-card');
    // Hidden until the player makes their first post, so a fresh account's
    // rail isn't shouting "people you may know" at someone who hasn't posted.
    if (card) card.style.display = (s.analytics.postsPublished > 0) ? '' : 'none';
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

  /* ---------- tag bucket (right rail) ---------- */
  renderBucket() {
    const s = State.data;
    const countEl = document.getElementById('bucket-count');
    const qfill = document.getElementById('bucket-qfill');
    if (!countEl) return;
    const n = Tags.count();
    countEl.textContent = n;
    const q = Tags.bucketQuality();
    if (qfill) {
      qfill.style.width = Math.round(q * 100) + '%';
      qfill.style.background = q >= 0.8 ? 'linear-gradient(90deg,#b8860b,#ffd700)' : q >= 0.5 ? 'linear-gradient(90deg,#0a66c2,#7fb8e8)' : 'linear-gradient(90deg,#9e9e9e,#c0c0c0)';
    }
    // The catch window (canvas) shows each tag as a floating word, so we no
    // longer render chip duplicates here. The bucket-sub hint tells the player
    // to drag words into the post box.
    const sub = document.querySelector('.bucket-card .bucket-sub');
    if (sub) sub.textContent = n > 0 ? 'Catch topics to write. Drag them into the post box.' : 'Scroll the feed to absorb tags.';
    const tagsEl = document.getElementById('bucket-tags');
    if (tagsEl && !tagsEl.dataset.painted) {
      tagsEl.dataset.painted = '1';
      tagsEl.className = 'bucket-tags wc-bucket-hint';
      tagsEl.innerHTML = '<div class="wc-bar-ph">hold a word, drag it into the post box</div>';
    }
  },

  /* ---------- opportunities (right rail) ---------- */
  renderOpportunities() {
    const s = State.data;
    const list = document.getElementById('opp-list');
    if (!list) return;
    const avail = Engine.availableOpportunities();
    list.innerHTML = '';
    if (!avail.length) {
      const next = DATA.OPPORTUNITIES.find(o => !s.opportunities.taken.includes(o.id));
      if (next) {
        list.innerHTML = `<div class="opp-item locked">
          <div class="opp-icon">${next.icon}</div>
          <div class="opp-info">
            <div class="opp-name">${next.name}</div>
            <div class="opp-pitch">${next.pitch}</div>
            <div class="opp-req">🔒 ${Engine.fmt(next.influence)} influence</div>
          </div>
        </div>`;
      } else {
        list.innerHTML = '<div class="opp-empty">All deals taken. The loop is yours.</div>';
      }
      return;
    }
    for (const o of avail) {
      const item = document.createElement('div');
      item.className = 'opp-item';
      item.innerHTML = `
        <div class="opp-icon">${o.icon}</div>
        <div class="opp-info">
          <div class="opp-name">${o.name}</div>
          <div class="opp-pitch">${o.pitch}</div>
          <div class="opp-pay">💰 +$${o.payout.toLocaleString()}</div>
        </div>
        <button class="btn btn-primary opp-take" data-opp="${o.id}">Take</button>`;
      item.querySelector('[data-opp]').addEventListener('click', () => {
        Engine.takeOpportunity(o.id);
        this.renderOpportunities();
        this.refresh();
      });
      list.appendChild(item);
    }
  },

  /* ---------- rapport popup (click an author) ---------- */
  openRapport(authorId, person) {
    const s = State.data;
    const arch = DATA.ARCHETYPES.find(a => a.id === authorId);
    if (!arch) return;
    const r = s.rapport[authorId] || { rapport: 0, liked: 0, commented: 0, connected: false, followed: false };
    const body = document.getElementById('rapport-body');
    if (!body) return;
    const level = r.rapport >= 5 ? 'Following you back' : r.rapport >= 3 ? 'Warm' : r.rapport >= 1 ? 'Noticing you' : 'Stranger';
    // show the actual person when we know them, not the shared archetype
    const p = person || null;
    const name = p ? p.name : arch.name;
    const role = p ? p.role : arch.role;
    const emoji = p ? p.emoji : arch.emoji;
    const color = p ? p.color : arch.color;
    body.innerHTML = `
      <div class="rapport-avatar" style="background:${color}">${emoji}</div>
      <div class="rapport-name">${this.escapeHtml(name)}</div>
      <div class="rapport-role">${this.escapeHtml(role)}</div>
      <div class="rapport-stats">
        <div class="r-stat"><span>Influence</span><b>${Engine.fmt(arch.influence)}</b></div>
        <div class="r-stat"><span>Rapport</span><b>${r.rapport}</b></div>
        <div class="r-stat"><span>Status</span><b>${level}</b></div>
      </div>
      <div class="rapport-bar"><div class="rapport-fill" style="width:${Math.min(100, r.rapport / 5 * 100)}%"></div></div>
      <div class="rapport-hint">${r.followed ? 'They follow you back. Their posts reach you now.' : 'Like and comment on their posts to build rapport. At 5 rapport they follow you back.'}</div>
      <div class="rapport-actions">
        <button class="btn btn-primary" data-rp-follow>${r.followed ? 'Following' : 'Follow'}</button>
        <button class="btn" data-rp-connect>${r.connected ? 'Connected' : 'Connect'}</button>
      </div>`;
    const followBtn = body.querySelector('[data-rp-follow]');
    if (followBtn && !r.followed) followBtn.addEventListener('click', () => {
      Engine.followPerson(arch.id);
      this.openRapport(authorId);
    });
    const connectBtn = body.querySelector('[data-rp-connect]');
    if (connectBtn && !r.connected) connectBtn.addEventListener('click', () => {
      Engine.connectPerson(arch.id);
      this.openRapport(authorId);
    });
    this.showModal('rapport-modal');
  },

  /* ---------- idle bots (growth modal pane) ---------- */
  renderBots() {
    const s = State.data;
    const pane = document.getElementById('g-pane-bots');
    if (!pane) return;
    const defs = {
      scroll: { name: 'Scroll Bot', icon: '🖱️', cost: 100, desc: 'Automatically scrolls the feed and absorbs tags.' },
      post: { name: 'Post Bot', icon: '✍️', cost: 500, desc: 'Automatically writes posts from your bucket tags.' },
      engage: { name: 'Engage Bot', icon: '🤖', cost: 250, desc: 'Automatically likes and comments, building rapport.' },
      influence: { name: 'Influence Bot', icon: '📈', cost: 1000, desc: 'Automatically converts your reach into influence.' },
    };
    pane.innerHTML = '<div class="bots-note">Bots automate the manual loops. They can never take money — opportunities are yours by hand.</div>';
    for (const kind in defs) {
      const d = defs[kind];
      const owned = s.bots[kind] || 0;
      const affordable = s.impressions >= d.cost;
      const item = document.createElement('div');
      item.className = 'g-item' + (owned > 0 ? ' owned running' : ' idle');
      item.innerHTML = `
        <div class="g-item-icon">${d.icon}</div>
        <div class="g-item-info">
          <div class="g-item-name">${d.name} <span class="g-item-count">${owned > 0 ? '×' + owned : ''}</span></div>
          <div class="g-item-desc">${d.desc}</div>
          <div class="g-item-stats">${owned > 0 ? 'Running · ' + owned + ' active' : 'Idle'}</div>
        </div>
        <button class="btn btn-primary g-item-btn" data-bot="${kind}" ${affordable ? '' : 'disabled'}>
          ${owned > 0 ? 'Buy another' : 'Buy'} · ${Engine.fmt(d.cost)}
        </button>`;
      item.querySelector('[data-bot]').addEventListener('click', () => {
        Engine.buyBot(kind);
        this.renderBots();
        this.refresh();
      });
      pane.appendChild(item);
    }
  },

  /* ---------- niche pillars ---------- */
  renderPillars() {
    const body = document.getElementById('pillars-body');
    if (!body) return;
    const s = State.data;
    const chosen = s.pillars.chosen || [];
    const mult = Maxxing.pillarMult();
    const opts = DATA.TAGS.filter(t => t.id !== 'beg').map(t => {
      const sel = chosen.includes(t.id);
      return `<div class="pillar-opt ${sel ? 'selected' : ''}" data-pillar="${t.id}">
        <span class="p-emoji">${t.emoji}</span>
        <span class="p-name">${t.name}</span>
        <span class="p-check">${sel ? '✓' : ''}</span>
      </div>`;
    }).join('');
    body.innerHTML = `
      <div class="pillar-intro">Pick up to 3 topics to be <b>known for</b>. Posts that use a pillar tag build consistency; posts that wander reset it. The algorithm rewards a focused niche — up to <b>+45% reach</b>.</div>
      ${chosen.length ? `<div class="pillar-current">🎯 Current pillars: ${chosen.map(id => { const d = Tags.def(id); return d ? d.emoji + ' ' + d.name : id; }).join(', ')}</div>` : ''}
      <div class="pillar-grid">${opts}</div>
      <div class="pillar-consistency">Consistency streak: ${s.pillars.consistency} on-pillar posts · best ${s.pillars.bestConsistency || 0} · current multiplier ×${mult.toFixed(2)}</div>
      <button class="btn btn-primary pillar-save" id="pillar-save">Save Pillars</button>`;
    body.querySelectorAll('[data-pillar]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.pillar;
        const i = chosen.indexOf(id);
        if (i >= 0) chosen.splice(i, 1);
        else if (chosen.length < 3) chosen.push(id);
        this.renderPillars();
      });
    });
    const save = document.getElementById('pillar-save');
    if (save) save.addEventListener('click', () => {
      Maxxing.choosePillars(chosen);
      this.hideModal('pillars-modal');
      this.refresh();
    });
  },

  /* ---------- A/B test ---------- */
  renderAb(post) {
    const body = document.getElementById('ab-body');
    if (!body) return;
    const ab = Maxxing.abState(post.id);
    body.innerHTML = `
      <div class="ab-copy">The algorithm sampled two versions of your post against a small audience.</div>
      ${ab && ab.decided
        ? `<div class="ab-copy" style="font-weight:700;color:${ab.winner ? '#2e7d32' : '#d11124'}">${ab.winner ? '✓ Your post won. Reach doubled.' : '✗ The other version won. You never saw it.'}</div>`
        : `<div class="ab-copy">Sampling in progress… check back in a moment.</div>`}`;
    this.showModal('ab-modal');
  },

  /* ---------- DMs (collabs + the algorithm) ---------- */
  renderDms() {
    const list = document.getElementById('dms-list');
    if (!list) return;
    const s = State.data;
    const collabs = s.collabs || [];
    const narratorDms = (s.dms || []).filter(d => d.narrator).slice(0, 5);
    let html = '';
    if (!collabs.length && !narratorDms.length) {
      html = '<div class="dm-item"><div class="dm-body"><div class="dm-name">No messages yet</div><div class="dm-text">Collabs and the algorithm will reach out as you grow.</div></div></div>';
    }
    // collab offers
    for (const c of collabs) {
      const person = Maxxing.COLLAB_POOL.find(p => p.id === c.personId);
      if (!person) continue;
      const state = c.state;
      html += `<div class="dm-item">
        <div class="dm-avatar" style="background:${person.color}">${person.emoji}</div>
        <div class="dm-body">
          <div class="dm-name">${person.name}</div>
          <div class="dm-role">${person.role}</div>
          <div class="dm-text">"Hey! I love your content. Want to do a collab? We post each other's stuff to our audiences — ${Engine.fmt(person.reach)} people on my side."</div>
          ${state === 'offer' ? `
            <div class="dm-split">My audience split: <input type="number" id="split-${c.id}" value="${c.split}" min="10" max="90" step="5">%</div>
            <div class="dm-actions">
              <button class="btn btn-primary" data-collab-accept="${c.id}">Accept</button>
              <button class="btn" data-collab-decline="${c.id}">Decline</button>
            </div>` : ''}
          ${state === 'accepted' ? `<div class="dm-state accepted">✓ Accepted. Your post is reaching their network.</div>` : ''}
          ${state === 'declined' ? `<div class="dm-state declined">Declined. The algorithm noted your hesitation.</div>` : ''}
        </div>
      </div>`;
    }
    // narrator DMs (the algorithm's voice)
    for (const d of narratorDms) {
      html += `<div class="dm-item">
        <div class="dm-avatar" style="background:${d.color || '#111'}">${d.emoji || '👁️'}</div>
        <div class="dm-body">
          <div class="dm-name">${d.name}</div>
          <div class="dm-role">${d.role}</div>
          <div class="dm-text">${this.escapeHtml(d.text)}</div>
        </div>
      </div>`;
    }
    list.innerHTML = html;
    list.querySelectorAll('[data-collab-accept]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.collabAccept;
        const inp = document.getElementById('split-' + id);
        const split = parseInt(inp && inp.value, 10) || 50;
        Maxxing.acceptCollab(id, split);
        this.renderDms();
        this.refresh();
      });
    });
    list.querySelectorAll('[data-collab-decline]').forEach(b => {
      b.addEventListener('click', () => {
        Maxxing.declineCollab(b.dataset.collabDecline);
        this.renderDms();
      });
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
    const dmsView = document.getElementById('dms-view');
    const show = (el, on) => { if (el) el.classList.toggle('hidden', !on); };
    const isFeed = tab === 'feed';
    show(feed, isFeed);
    show(feedEnd, isFeed);
    show(composer, isFeed);
    show(networkView, tab === 'network');
    show(jobsView, tab === 'jobs');
    show(dmsView, tab === 'dms');

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
    } else if (tab === 'dms') {
      this.renderDms();
    }
  },
};
