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
    popIfChanged(connEl, connEl.textContent);
    popIfChanged(folEl, folEl.textContent);
    popIfChanged(impEl, impEl.textContent);
    popIfChanged(ipsEl, ipsEl.textContent);
    popIfChanged(likesEl, likesEl.textContent);
    popIfChanged(gfolEl, gfolEl.textContent);

    // influence bar (always climbing — you are the CEO of LockedIn)
    if (s.authenticity > 100) s.authenticity = 100;
    if (s.authenticity < 0) s.authenticity = 0;
    const a = Math.round(s.authenticity);
    $('auth-value').textContent = a + '%';
    const fill = $('auth-fill');
    fill.style.width = a + '%';
    fill.style.background = 'linear-gradient(90deg,#b8860b,#ffd700)';
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

    // leaderboard-free: next unlock nudge
    this.renderNextUnlock();

    // profile
    $('profile-name').textContent = s.name;
    $('profile-headline').textContent = s.headline;
    $('cm-name').textContent = s.name;
    $('cm-headline').textContent = s.headline;
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
  },

  renderNextUnlock() {
    const s = State.data;
    const title = document.getElementById('next-title');
    const fill = document.getElementById('next-fill');
    const sub = document.getElementById('next-sub');
    if (!title) return;
    // find the cheapest affordable-ish next purchase (generator or upgrade or worker)
    let next = null;
    for (const g of DATA.GENERATORS) {
      if (Engine.genCount(g.id) === 0) {
        const cost = g.cost;
        if (!next || cost < next.cost) next = { name: g.name, cost, icon: g.icon, kind: 'generator' };
      }
    }
    for (const w of DATA.WORKERS) {
      if (Engine.workerCount(w.id) === 0) {
        const cost = w.cost;
        if (!next || cost < next.cost) next = { name: w.name, cost, icon: w.emoji, kind: 'worker' };
      }
    }
    for (const u of DATA.UPGRADES) {
      if (!s.upgrades[u.id]) {
        const cost = u.cost;
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

  renderFeed() {
    const feed = document.getElementById('feed');
    const s = State.data;
    // Player posts appear first, but NPC posts always keep a reserved slice
    // so the feed never collapses into only the player's own posts.
    const MIN_NPC = 20;
    const yours = s.posts.filter(p => p.authorId === 'you');
    const npcs = s.posts.filter(p => p.authorId !== 'you');
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
      }
    }
    // remove cards no longer in the list
    for (const [id, card] of existing) {
      if (!seen.has(id)) {
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
      impEl.textContent = impNew;
      // milestone sound only, no scale pop
      const imp = Math.floor(stats.impressions);
      const next = this._nextImpMilestone(post);
      if (next && imp >= next) {
        post._impMilestone = next;
        Juice.pop();
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
          div.className = 'pc pc-new';
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

  _nextImpMilestone(post) {
    const imp = Math.floor(post.stats.impressions);
    const ms = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    // find the highest milestone already crossed
    let crossed = 0;
    for (const m of ms) {
      if (imp >= m) crossed = m;
    }
    // if we've crossed a new milestone since last pop, fire it
    if (crossed > (post._impMilestone || 0)) {
      return crossed;
    }
    return null;
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
      feed.appendChild(this.postCard(post));
    }
    return more.length;
  },

  postCard(post) {
    const s = State.data;
    const card = document.createElement('div');
    card.className = 'post-card' + (post.fourthWall ? ' fourthwall' : '');
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

    const formatTag = post.format !== 'text'
      ? `<div class="post-format-tag ${post.format === 'carousel' ? 'risky' : ''}">${post.format === 'carousel' ? '📑 Carousel' : post.format === 'poll' ? '📊 Poll' : post.format === 'photo' ? '🖼️ Photo' : '🎥 Video'}</div>`
      : '';

    const rarityTag = post.rarity !== 'common'
      ? `<div class="post-format-tag">${post.rarity === 'legendary' ? '🔥' : post.rarity === 'epic' ? '✨' : post.rarity === 'rare' ? '💎' : '⭐'} ${post.rarity}</div>`
      : '';

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
        <div class="pc">
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
    }

    card.innerHTML = `
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
      ${formatTag}${rarityTag}
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
    // pick a template (bait) or free write
    const t = Engine.pick(DATA.TEMPLATES);
    const content = t.id === 'free'
      ? Engine.pick(DATA.ARCHETYPES).posts[0]
      : t.text;
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
    const paneO = document.getElementById('g-pane-outsource');

    // generators
    paneG.innerHTML = '';
    for (const g of DATA.GENERATORS) {
      const owned = s.generators[g.id] || 0;
      const cost = Math.floor(g.cost * Math.pow(1.15, owned));
      const affordable = s.impressions >= cost;
      const item = document.createElement('div');
      item.className = 'g-item' + (owned > 0 ? ' owned' : '');
      item.innerHTML = `
        <div class="g-item-icon">${g.icon}</div>
        <div class="g-item-info">
          <div class="g-item-name">${g.name} <span style="color:#999;font-size:11px">${owned > 0 ? '×' + owned : ''}</span></div>
          <div class="g-item-desc">${g.desc}</div>
          <div class="g-item-stats">+${g.prod} imp/s · +${Math.abs(g.auth)} influence/s · ${g.flavor}</div>
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
      const owned = s.upgrades[u.id] || 0;
      const done = owned >= u.max;
      const cost = Math.floor(u.cost * Math.pow(1.5, owned));
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

    // outsource (hire workers)
    paneO.innerHTML = '';
    for (const w of DATA.WORKERS) {
      const owned = Engine.workerCount(w.id);
      const cost = Math.floor(w.cost * Math.pow(1.3, owned));
      const affordable = s.impressions >= cost;
      const item = document.createElement('div');
      item.className = 'g-item' + (owned > 0 ? ' owned' : '');
      item.innerHTML = `
        <div class="g-item-icon">${w.emoji}</div>
        <div class="g-item-info">
          <div class="g-item-name">${w.name} <span style="color:#999;font-size:11px">${owned > 0 ? '×' + owned : ''}</span></div>
          <div class="g-item-desc">${w.role} · ${w.country}</div>
          <div class="g-item-stats">+${w.prod} imp/s · +${Math.abs(w.auth)} influence/s · "${w.bio}"</div>
          ${owned > 0 ? this.intensityControl(w.id) : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
          <button class="btn btn-primary g-item-btn" data-hire="${w.id}" ${affordable ? '' : 'disabled'}>
            ${owned > 0 ? 'Hire More' : 'Hire'} · ${Engine.fmt(cost)}
          </button>
          ${owned > 0 ? `<button class="btn btn-danger g-item-btn" data-fire="${w.id}" style="font-size:12px;padding:4px 10px">Fire</button>` : ''}
          ${owned > 0 ? `<button class="btn g-item-btn" data-msg="${w.id}" style="border:1px solid #0a66c2;color:#0a66c2;font-size:12px;padding:4px 10px">💬 Message</button>` : ''}
        </div>
      `;
      item.querySelector('[data-hire]').addEventListener('click', () => Engine.hireWorker(w.id));
      const fireBtn = item.querySelector('[data-fire]');
      if (fireBtn) fireBtn.addEventListener('click', () => Engine.fireWorker(w.id));
      const msgBtn = item.querySelector('[data-msg]');
      if (msgBtn) msgBtn.addEventListener('click', () => {
        UI._activeWorker = w.id;
        UI.showModal('messaging-modal');
        UI.renderMessaging();
      });
      paneO.appendChild(item);
    }
  },

  intensityControl(id) {
    const val = Engine.workerIntensity(id);
    const labels = ['😴 Chill', '🙂 Normal', '🔥 High', '💥 MAX'];
    let html = '<div style="margin-top:4px;display:flex;gap:4px;align-items:center">';
    for (let i = 0; i < 4; i++) {
      html += `<button class="btn" data-int="${id}" data-val="${i}" style="border:1px solid ${i === val ? '#0a66c2' : '#e0dfdc'};color:${i === val ? '#0a66c2' : '#666'};font-size:11px;padding:2px 8px">${labels[i]}</button>`;
    }
    html += '</div>';
    // bind after insert
    setTimeout(() => {
      document.querySelectorAll(`[data-int="${id}"]`).forEach(b => {
        b.addEventListener('click', () => Engine.setIntensity(id, parseInt(b.dataset.val, 10)));
      });
    }, 0);
    return html;
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
    if (chart) chart.innerHTML = this.anChartHtml();
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
      const affordable = s.impressions >= u.cost;
      return `<div class="an-upg ${o ? 'owned' : ''}">
        <div style="font-size:24px">${u.icon}</div>
        <div class="an-upg-info">
          <div class="an-upg-name">${u.name}</div>
          <div class="an-upg-desc">${u.desc}</div>
        </div>
        <button class="btn btn-primary" data-an-upg="${u.id}" ${o || !affordable ? 'disabled' : ''}>${o ? 'Owned' : Engine.fmt(u.cost)}</button>
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
    if (s.impressions < u.cost) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= u.cost;
    s.analytics.analyticsLevel = u.tier;
    Juice.chime();
    this.renderAnalytics();
  },

  /* ---------- messaging ---------- */
  renderMessaging() {
    const s = State.data;
    const list = document.getElementById('msg-list');
    if (!list) return;
    const hired = DATA.WORKERS.filter(w => Engine.workerCount(w.id) > 0);
    list.innerHTML = '';
    if (hired.length === 0) {
      list.innerHTML = '<div style="padding:12px;font-size:12px;color:#666">No workers yet. Hire them in the Growth Console → Outsource.</div>';
    }
    for (const w of hired) {
      const el = document.createElement('div');
      el.className = 'msg-contact' + (this._activeWorker === w.id ? ' active' : '');
      el.innerHTML = `<div class="avatar" style="background:#0a66c2;width:32px;height:32px;font-size:14px">${w.emoji}</div>
        <div><div class="mc-name">${w.name}</div><div class="mc-role">${w.count > 1 ? '×' + w.count + ' · ' : ''}${w.role}</div></div>`;
      el.addEventListener('click', () => { this._activeWorker = w.id; this.renderMessaging(); });
      list.appendChild(el);
    }
    this.renderChat();
  },

  renderChat() {
    const s = State.data;
    const chat = document.getElementById('msg-chat');
    const empty = document.getElementById('msg-chat-empty');
    const thread = document.getElementById('msg-thread');
    const commands = document.getElementById('msg-commands');
    const w = DATA.WORKERS.find(x => x.id === this._activeWorker);
    if (!w || Engine.workerCount(w.id) === 0) {
      empty.style.display = 'grid';
      thread.innerHTML = '';
      commands.innerHTML = '';
      return;
    }
    empty.style.display = 'none';
    // thread
    thread.innerHTML = '';
    const msgs = (s.workerChats[w.id] || []).slice(-50);
    for (const m of msgs) {
      const b = document.createElement('div');
      b.className = 'msg-bubble ' + (m.from === 'me' ? 'me' : 'them');
      const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      b.innerHTML = m.text + `<span class="mb-time">${time}</span>`;
      thread.appendChild(b);
    }
    thread.scrollTop = thread.scrollHeight;
    // commands
    commands.innerHTML = '';
    for (const c of DATA.WORKER_COMMANDS) {
      const btn = document.createElement('button');
      btn.textContent = c.label;
      btn.addEventListener('click', () => Engine.sendWorkerCommand(w.id, c.id));
      commands.appendChild(btn);
    }
  },

  /* ---------- side panel DMs (unified messaging) ---------- */
  // Incremental render: reuse existing DOM nodes, only insert new items.
  // Prevents the whole list from flashing/rebuilding on every incoming DM.
  renderDMs() {
    const s = State.data;
    const list = document.getElementById('dm-list');
    const count = document.getElementById('dm-count');
    if (!list) return;
    const hired = DATA.WORKERS.filter(w => Engine.workerCount(w.id) > 0);
    const dms = s.dms.slice(0, 8);
    if (count) count.textContent = hired.length + s.dms.length;

    // Build the desired item list in order, each with a stable key.
    const desired = [];
    if (hired.length > 0) {
      desired.push({ key: '__team-head', head: 'Your Team' });
      for (const w of hired) desired.push({ key: 'team-' + w.id, worker: w });
    }
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
    if (item.worker) {
      const w = item.worker;
      el.className = 'dm-item dm-team';
      el.dataset.dmKey = item.key;
      el.innerHTML = `
        <div class="dm-avatar" style="background:#0a66c2">${w.emoji}</div>
        <div class="dm-body">
          <div class="dm-name">${this.escapeHtml(w.name)} <span class="dm-role">${w.count > 1 ? '×' + w.count + ' · ' : ''}${this.escapeHtml(w.role)}</span></div>
          <div class="dm-text">${this.escapeHtml(this._lastWorkerText(w.id))}</div>
        </div>`;
      el.addEventListener('click', () => {
        this._activeWorker = w.id;
        this.showModal('messaging-modal');
        this.renderMessaging();
      });
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

  _lastWorkerText(id) {
    const s = State.data;
    const msgs = s.workerChats[id] || [];
    if (msgs.length === 0) return 'Ready to work.';
    const last = msgs[msgs.length - 1];
    return (last.from === 'me' ? 'You: ' : '') + last.text;
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
          <div class="rec-followers">${p.followers} followers</div>
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
        const label = n.action.type === 'unlock' ? '🔓 Open ' + (n.action.app === 'telegram' ? 'Telegram' : n.action.app) : 'Open';
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
    } else if (tab === 'messaging') {
      this.showModal('messaging-modal');
      this.renderMessaging();
    }
  },
};
