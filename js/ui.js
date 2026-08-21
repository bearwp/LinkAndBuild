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
    folEl.textContent = Engine.fmtTick(s.followers);
    impEl.textContent = Engine.fmtTick(s.impressions);
    ipsEl.textContent = Engine.fmtTick(Engine.totalIps()) + '/s';
    likesEl.textContent = Engine.fmtTick(s.likes);
    gfolEl.textContent = Engine.fmtTick(s.followers);
    popIfChanged(connEl, connEl.textContent);
    popIfChanged(folEl, folEl.textContent);
    popIfChanged(impEl, impEl.textContent);
    popIfChanged(ipsEl, ipsEl.textContent);
    popIfChanged(likesEl, likesEl.textContent);
    popIfChanged(gfolEl, gfolEl.textContent);

    // authenticity bar
    if (s.authenticity > 100) s.authenticity = 100;
    if (s.authenticity < 0) s.authenticity = 0;
    const a = Math.round(s.authenticity);
    $('auth-value').textContent = a + '%';
    const fill = $('auth-fill');
    fill.style.width = a + '%';
    if (a > 50) { fill.style.background = 'linear-gradient(90deg,#2e7d32,#8bc34a)'; $('auth-note').textContent = 'Organic. Keep it real.'; }
    else if (a > 30) { fill.style.background = 'linear-gradient(90deg,#f9a825,#ffd54f)'; $('auth-note').textContent = 'Suspicious activity detected...'; }
    else { fill.style.background = 'linear-gradient(90deg,#d32f2f,#ff7043)'; $('auth-note').textContent = 'The algorithm is watching you.'; }

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
    // All of the player's posts always appear; NPC posts fill the rest.
    const yours = s.posts.filter(p => p.authorId === 'you');
    const npcs = s.posts.filter(p => p.authorId !== 'you');
    const posts = yours.concat(npcs.slice(0, Math.max(0, 60 - yours.length)));

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
      if (post.comments.length > rendered) {
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

    const age = Math.floor((Date.now() - post.publishedAt) / 60000);
    const ageStr = age < 1 ? 'just now' : age < 60 ? age + 'm' : Math.floor(age / 60) + 'h';

    const isYou = post.authorId === 'you';
    const youTag = isYou ? '<span class="you-tag">• You</span>' : '';

    const formatTag = post.format !== 'text'
      ? `<div class="post-format-tag ${post.format === 'carousel' ? 'risky' : ''}">${post.format === 'carousel' ? '📑 Carousel' : post.format === 'poll' ? '📊 Poll' : '🎥 Video'}</div>`
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
          <div class="post-author">${post.authorName}${youTag}</div>
          <div class="post-meta">${post.authorRole} · ${ageStr}</div>
        </div>
      </div>
      <div class="post-body">${this.escapeHtml(post.content)}</div>
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

  fillInlineTemplateSelect() {
    const sel = document.getElementById('inline-opt-template');
    if (!sel) return;
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
      el.textContent = 'Template: ' + t.name + ' · potential ×' + t.potential + ' · authenticity ' + (t.auth > 0 ? '+' : '') + t.auth;
    } else {
      el.textContent = 'Free write: authentic, lower potential.';
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
          <div class="g-item-stats">+${g.prod} imp/s · ${g.auth} auth/s · ${g.flavor}</div>
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
          <div class="g-item-stats">+${w.prod} imp/s · ${w.auth} auth/s · "${w.bio}"</div>
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

    // stat grid
    const best = a.bestPost ? a.bestPost : null;
    const grid = `
      <div class="an-grid">
        <div class="an-stat"><div class="an-label">Total Impressions</div><div class="an-value">${Engine.fmt(s.totalImpressions)}</div></div>
        <div class="an-stat"><div class="an-label">Posts Published</div><div class="an-value">${a.postsPublished}</div></div>
        <div class="an-stat"><div class="an-label">Likes Earned</div><div class="an-value">${Engine.fmt(a.totalLikes)}}</div></div>
        <div class="an-stat"><div class="an-label">Followers</div><div class="an-value">${Engine.fmt(s.followers)}</div></div>
        <div class="an-stat"><div class="an-label">Impressions/s</div><div class="an-value">${Engine.fmt(Engine.totalIps())}</div></div>
        <div class="an-stat"><div class="an-label">Best Post</div><div class="an-value" style="font-size:14px">${best ? Engine.fmt(best.stats.impressions) + ' imp' : '—'}</div></div>
      </div>`;

    // chart
    let chartHtml = '';
    if (owned >= 1) {
      const hist = a.history.slice(-30);
      const maxImp = Math.max(1, ...hist.map(h => h.impressions));
      const maxLike = Math.max(1, ...hist.map(h => h.likes));
      const maxFol = Math.max(1, ...hist.map(h => h.followers));
      const bars = hist.map(h => {
        const impH = Math.max(2, (h.impressions / maxImp) * 100);
        const likeH = Math.max(2, (h.likes / maxLike) * 100);
        const folH = Math.max(2, (h.followers / maxFol) * 100);
        return `<div class="an-bar" style="height:${impH}px"></div>`;
      }).join('');
      chartHtml = `
        <div class="an-section">
        <div class="an-section-title">Impressions Over Time</div>
        <div class="an-chart">${bars}</div>
        <div style="font-size:11px;color:#999;margin-top:4px">${hist.length} samples · every 5s</div>
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
        <div class="an-bench" style="color:#d11124">You are ${you >= arch.influence ? 'ahead of' : 'losing to'} ${arch.name}. Post more.</div>
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

    body.innerHTML = grid + chartHtml + curvesHtml + insightsHtml + benchHtml + upgHtml;

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
    if (tab === 'bell') {
      this.showModal('bell-modal');
      this.renderNotifs();
    } else if (tab === 'me') {
      // profile view = a little dopamine
      Juice.toast('Your profile looks great. Nobody else has seen it.');
    } else if (tab === 'jobs') {
      Juice.toast('No jobs for you. The algorithm demands content.');
    } else if (tab === 'messaging') {
      this.showModal('messaging-modal');
      this.renderMessaging();
    }
  },
};
