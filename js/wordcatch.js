/* ============================================================
   LINK & BUILD — Word Catch Composer
   Simple, tactile post building — docked in the layout.
   The TAG BUCKET is the "catch topics to write" window: tag words
   float there. Hold to hoover a word — it rides with your cursor.
   Drag it over the POST WRITING BOX (the composer) and let go: it
   locks onto your tag shelf and the box turns the combo into a
   sentence. Let go anywhere else and it flies back to the bucket.

   Re-using the same tag doesn't add another copy — it STRENGTHENS
   that tag. Strength shows on the chip and raises the post's reach.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- scaffold: catch field lives in the bucket card ---------- */
  const bucketCard = document.getElementById('bucket-card');
  const canvas = document.createElement('canvas');
  canvas.id = 'wc-canvas';
  canvas.className = 'wc-canvas-inline';
  bucketCard.appendChild(canvas);

  // the bucket tags label becomes a hint under the catch window
  const bucketTags = document.getElementById('bucket-tags');
  if (bucketTags) {
    bucketTags.className = 'bucket-tags wc-bucket-hint';
    bucketTags.innerHTML = '<div class="wc-bar-ph">drag topics into the post box to write</div>';
  }

  /* ---------- composer becomes the drop target + shelf ---------- */
  const composer = document.getElementById('composer');
  composer.innerHTML = `
    <div class="composer-top" id="composer-open">
      <div class="avatar" id="composer-avatar">Y</div>
      <div class="composer-input wc-sentence" id="wc-sentence">
        <span class="wc-bar-ph" id="wc-bar-ph">catch topics, drop them here — we\'ll write the story</span>
      </div>
    </div>
    <div class="wc-bar" id="wc-bar">
      <button class="btn btn-primary" id="wc-post" disabled>Post</button>
    </div>
  `;

  const ctx = canvas.getContext('2d');
  const sentenceEl = document.getElementById('wc-sentence');
  const barPh = document.getElementById('wc-bar-ph');
  const postBtn = document.getElementById('wc-post');
  const qualityEl = document.getElementById('wc-quality');
  const qualityFill = document.getElementById('wc-quality-fill');

  /* ---------- state ---------- */
  let W = 0, H = 0;
  const field = [];        // free words
  const pointer = { x: -9999, y: -9999, active: false };
  const carried = [];      // words riding the cursor
  const caught = [];       // topics locked onto the composer shelf (unique)
  let tSec = 0;            // clock for pop-in animations
  let isVisible = true;    // only draw while the bucket is on screen

  const FONT = '600 11px -apple-system, Segoe UI, sans-serif';
  const PAD = 6;
  const SUCTION_R = 110;
  const STICK_R = 42;
  const SUCTION_F = 1200;
  const FOLLOW = 18;       // eased follow speed for carried words
  const DROP_BAND = 60;    // release within this many px of the bottom edge = drop
  const MAX_CATCH = 5;     // shelf capacity (unique tags)

  const COL = { content: 'hsla(210, 70%, 50%, 0.92)' };
  function styleOf(w) { return 'content'; }

  function textSize(t) {
    ctx.font = FONT;
    const m = ctx.measureText(t);
    return { w: m.width + PAD * 2, h: 19 };
  }

  function resize() {
    // The canvas fills the bucket card's remaining space via flexbox (CSS), so
    // its actual rendered size is controlled by layout, not JS. We just sync the
    // backing buffer to whatever the element ended up as, so nothing clips.
    W = canvas.clientWidth;
    H = canvas.clientHeight || 200;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  // find a spot for a new word that doesn't sit on top of an existing one, so
  // freshly harvested tags are always clearly visible (never buried under the
  // word that was already there).
  function freeSpot(w, h) {
    const cx = W / 2, cy = H / 2;
    if (!field.length) return { x: cx, y: cy };
    for (let r = 0; r < Math.max(W, H); r += 14) {
      for (let a = 0; a < Math.PI * 2; a += 0.6) {
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (x < w / 2 || x > W - w / 2 || y < h / 2 || y > H - h / 2) continue;
        let ok = true;
        for (const o of field) {
          if (Math.hypot(o.x - x, o.y - y) < (o.w + w) / 2 + 8) { ok = false; break; }
        }
        if (ok) return { x: x, y: y };
      }
    }
    return { x: cx + (Math.random() - 0.5) * 40, y: cy + (Math.random() - 0.5) * 40 };
  }

  function makeWordFromId(id, centered) {
    const d = Tags.def(id);
    if (!d) return null;
    const c = State.data.bucket.tags[id];
    const sz = textSize(d.name);
    const spot = centered ? freeSpot(sz.w, sz.h) : null;
    return {
      id: d.id, t: d.name, emoji: d.emoji,
      setup: d.setup || [], escalate: d.escalate || [], confess: d.confess || [],
      x: centered ? spot.x : 20 + Math.random() * (W - 40),
      y: centered ? spot.y : 20 + Math.random() * (H - 40),
      vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
      w: sz.w, h: sz.h, born: tSec, isNew: centered ? 1 : 0,
    };
  }

  // The field mirrors the bucket exactly: every tag absorbed from scrolling is
  // a word here, and nothing appears that didn't come from a post. Each copy is
  // its own floating word — tags never combine while sitting in the bucket;
  // they only merge when hovered together and dropped into the post.
  function syncField() {
    const tags = State.data.bucket.tags;
    const want = new Map();
    for (const id in tags) if (tags[id] > 0) want.set(id, tags[id]);

    // copies currently held in hand (carried) or on the shelf (caught) — these
    // are copies borrowed from the bucket, so they don't float in the field.
    // A caught chip's strength is how many copies it swallowed (combining the
    // same tag), so it counts that many copies.
    const held = new Map();
    for (const w of carried) held.set(w.id, (held.get(w.id) || 0) + 1);
    for (const w of caught) held.set(w.id, (held.get(w.id) || 0) + w.strength);

    const fieldCount = new Map();
    for (const w of field) fieldCount.set(w.id, (fieldCount.get(w.id) || 0) + 1);

    // drop words whose tag is spent, or extra copies beyond what the bucket holds
    for (let i = field.length - 1; i >= 0; i--) {
      const id = field[i].id;
      const need = (want.get(id) || 0) - (held.get(id) || 0);
      const have = fieldCount.get(id);
      if (need <= 0 || have > need) { field.splice(i, 1); fieldCount.set(id, have - 1); }
    }
    // add one word per missing copy so the count matches the bucket
    for (const [id, st] of want) {
      const need = st - (held.get(id) || 0);
      const have = fieldCount.get(id) || 0;
      for (let k = have; k < need; k++) {
        const w = makeWordFromId(id, true);
        if (w) { w.strength = 1; field.push(w); }
      }
    }
  }

  // carrying words converge under the cursor and combine
  /* ---------- physics ---------- */
  function update(dt) {
    // Tags never grow on their own: the field mirrors the bucket. Words only
    // appear when a post's tags are absorbed (or the scroll bot collects them).
    syncField();

    // repulsion among field words
    for (let i = 0; i < field.length; i++) {
      for (let j = i + 1; j < field.length; j++) {
        const a = field[i], b = field[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy) || 1;
        const min = (a.w + b.w) / 2 + 6;
        if (d < min) {
          const push = (min - d) / min * 120;
          const nx = dx / d, ny = dy / d;
          a.vx -= nx * push * dt * 60; a.vy -= ny * push * dt * 60;
          b.vx += nx * push * dt * 60; b.vy += ny * push * dt * 60;
        }
      }
    }
    for (const w of field) {
      w.vx *= 0.98; w.vy *= 0.98;
      w.x += w.vx * dt; w.y += w.vy * dt;
      if (w.x < w.w / 2) { w.x = w.w / 2; w.vx *= -0.6; }
      if (w.x > W - w.w / 2) { w.x = W - w.w / 2; w.vx *= -0.6; }
      if (w.y < w.h / 2) { w.y = w.h / 2; w.vy *= -0.6; }
      if (w.y > H - w.h / 2) { w.y = H - w.h / 2; w.vy *= -0.6; }
    }

    if (pointer.active) {
      // pull + stick field words
      for (let i = field.length - 1; i >= 0; i--) {
        const w = field[i];
        const dx = pointer.x - w.x, dy = pointer.y - w.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < STICK_R && carried.length + caught.length < MAX_CATCH) {
          field.splice(i, 1);
          carried.push({ id: w.id, t: w.t, emoji: w.emoji, setup: w.setup, escalate: w.escalate, confess: w.confess, strength: w.strength, x: w.x, y: w.y, vx: 0, vy: 0, w: w.w, h: w.h });
          if (Juice && Juice.pop) Juice.pop();
          continue;
        }
        if (d < SUCTION_R) {
          const f = (1 - d / SUCTION_R) * SUCTION_F;
          w.vx += (dx / d) * f * dt; w.vy += (dy / d) * f * dt;
          const sp = Math.hypot(w.vx, w.vy), max = 520;
          if (sp > max) { w.vx *= max / sp; w.vy *= max / sp; }
        }
      }
      // carried words converge right under the cursor — they meet and pile up.
      // They stay as separate copies while hovering; they only combine into one
      // stronger tag when dropped into the post.
      for (const w of carried) {
        w.x += (pointer.x - w.x) * Math.min(1, FOLLOW * dt);
        w.y += (pointer.y - w.y) * Math.min(1, FOLLOW * dt);
      }
    }
  }

  /* ---------- release: drop on composer = carry, otherwise scatter ---------- */
  function overComposer(clientX, clientY) {
    const r = composer.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  function release() {
    if (!carried.length) return;
    const cr = canvas.getBoundingClientRect();
    const dropped = carried.map(w => ({
      id: w.id, t: w.t, emoji: w.emoji, setup: w.setup, escalate: w.escalate, confess: w.confess, strength: 1,
      x: pointer.x, y: pointer.y, w: w.w, h: w.h,
    }));

    // page coords of the pointer (canvas-space + canvas offset)
    const gx = cr.left + pointer.x, gy = cr.top + pointer.y;
    if (overComposer(gx, gy)) {
      // dropping on the post COMBINES same-id copies into one stronger chip.
      // Each unique tag is one shelf slot; repeating it deepens it.
      for (const w of dropped) {
        const existing = caught.find(c => c.id === w.id);
        if (existing) {
          existing.strength++;        // same tag again -> make it stronger
          if (Juice && Juice.floatUp) {
            const sr = sentenceEl.getBoundingClientRect();
            Juice.floatUp(sr.left + sr.width / 2, sr.top + 20, '⚡ stronger', '#b8860b');
          }
        } else if (caught.length < MAX_CATCH) {
          caught.push({ id: w.id, t: w.t, emoji: w.emoji, setup: w.setup, escalate: w.escalate, confess: w.confess, strength: 1, x: 0, y: 0 });
        }
      }
      renderShelf({ x: gx, y: gy, count: dropped.length });
      updateQuality();
      postBtn.disabled = caught.length < 1;
      if (Juice) {
        if (Juice.coin) Juice.coin();
        const cr = composer.getBoundingClientRect();
        Juice.floatUp(cr.left + cr.width / 2, cr.top, '+' + dropped.length, '#0a66c2');
      }
    } else {
      // dropped back in the bucket: every copy SPLITS back into its own word,
      // scattered around the drop point.
      for (const w of dropped) {
        const sx = (Math.random() - 0.5) * 160, sy = (Math.random() - 0.5) * 160;
        field.push({ id: w.id, t: w.t, emoji: w.emoji, setup: w.setup, escalate: w.escalate, confess: w.confess, strength: 1, x: pointer.x, y: pointer.y, vx: sx, vy: sy, w: w.w, h: w.h });
      }
    }
    carried.length = 0;
  }

  /* ---------- draw ---------- */
  function draw() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // drop hint: soft glow along the whole window (drop target = composer)
    if (pointer.active && carried.length) {
      ctx.fillStyle = 'rgba(10,102,194,0.06)';
      ctx.fillRect(0, 0, W, H);
    }

    // field words
    for (const w of field) {
      const x = w.x - w.w / 2, y = w.y - w.h / 2, r = 6;
      // new tags pop in with a ring + growing size so you notice them arrive
      if (w.isNew) {
        const age = tSec - w.born;
        if (age < 0.7) {
          const k = age / 0.7;
          const s = 0.4 + 0.6 * Math.min(1, k); // grow from small to full
          const bw = w.w * s, bh = w.h * s;
          // bright expanding ring so the harvest is impossible to miss
          ctx.strokeStyle = 'hsla(210, 70%, 55%, ' + (0.5 * (1 - k)) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(w.x, w.y, 16 + k * 26, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(10,102,194,0.2)';
          ctx.beginPath(); ctx.arc(w.x, w.y, 14 + k * 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = COL[styleOf(w)];
          rounded(ctx, w.x - bw / 2, w.y - bh / 2, bw, bh, r); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '700 ' + Math.round(11 * s) + 'px -apple-system, Segoe UI, sans-serif';
          const label = (w.emoji ? w.emoji + ' ' : '') + w.t;
          ctx.fillText(label, w.x, w.y);
          ctx.font = FONT;
          continue;
        }
      }
      ctx.fillStyle = COL[styleOf(w)];
      rounded(ctx, x, y, w.w, w.h, r); ctx.fill();
      ctx.fillStyle = '#fff';
      const label = (w.emoji ? w.emoji + ' ' : '') + w.t;
      ctx.fillText(label, w.x, w.y);
      // strength badge: tiny ×count under the word
      if (w.strength > 1) {
        ctx.font = '600 9px -apple-system, Segoe UI, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('×' + w.strength, w.x + w.w / 2 + 4, w.y + w.h / 2 - 2);
        ctx.font = FONT;
      }
    }

    // carried words: individual copies riding the cursor, big and solid. They
    // stay separate here; combining into a stronger chip happens on the shelf.
    for (const w of carried) {
      const scale = 1.3;
      const bw = w.w * scale, bh = w.h * scale, r = 10;
      const x = w.x - bw / 2, y = w.y - bh / 2;
      ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 8;
      ctx.fillStyle = COL[styleOf(w)];
      rounded(ctx, x, y, bw, bh, r); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '700 ' + Math.round(11 * scale) + 'px -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText((w.emoji ? w.emoji + ' ' : '') + w.t, w.x, w.y);
      ctx.font = FONT;
    }
  }

  function rounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- tag shelf + quality ---------- */
  // The composer holds a SHELF of topic chips, not a sentence, so order
  // doesn't matter. Duplicate tags show a ×strength badge instead of a copy.
  function renderShelf(fromPage) {
    if (!caught.length) { sentenceEl.innerHTML = ''; barPh.style.display = ''; return; }
    barPh.style.display = 'none';
    sentenceEl.innerHTML = '';
    caught.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wc-chip ' + styleOf(w);
      chip.textContent = (w.emoji ? w.emoji + ' ' : '') + w.t + (w.strength > 1 ? ' ×' + w.strength : '');
      sentenceEl.appendChild(chip);
    });
    // fly newly-arrived tags in from the drop point (over the post box), so you
    // visibly see them travel from the bucket into the sentence.
    if (fromPage) {
      const chips = sentenceEl.querySelectorAll('.wc-chip');
      const n = Math.min(chips.length, fromPage.count);
      for (let j = 0; j < n; j++) {
        const chip = chips[chips.length - 1 - j];
        const here = chip.getBoundingClientRect();
        chip.classList.add('wc-fly');
        chip.style.setProperty('--fx', (fromPage.x - here.left) + 'px');
        chip.style.setProperty('--fy', (fromPage.y - here.top) + 'px');
        chip.style.animationDelay = (j * 0.04) + 's';
      }
    }
  }

  function quality() {
    if (!caught.length) return 0;
    const focus = caught.reduce((a, f) => a + Math.min(3, f.strength), 0) / caught.length;
    // no pre-ranked tiers: quality is authored. Distinct tags = richer post;
    // repeating the same tag = a focused, stronger bit.
    return Math.min(2.0, 0.45 + (caught.length - 1) * 0.16 + focus * 0.35);
  }

  function updateQuality() {
    const q = quality();
    const show = caught.length >= 1;
    if (qualityEl) qualityEl.classList.toggle('show', show);
    if (qualityFill) {
      qualityFill.style.width = (show ? Math.min(100, Math.round(q * 55)) : 0) + '%';
      qualityFill.style.background = q >= 1.1 ? 'linear-gradient(90deg,#ff9800,#ff5722)' : '#0a66c2';
    }
  }

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tSec += dt;
    update(dt); draw();
    requestAnimationFrame(loop);
  }

  /* ---------- pointer events ---------- */
  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.clientX = e.clientX; pointer.clientY = e.clientY;
  }
  canvas.addEventListener('pointerdown', (e) => { setPointer(e); pointer.active = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { setPointer(e); pointer.clientX = e.clientX; pointer.clientY = e.clientY; });
  canvas.addEventListener('pointerup', (e) => { pointer.active = false; release(); });
  canvas.addEventListener('pointercancel', () => { pointer.active = false; release(); });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });

  /* ---------- generator: weave caught topics into one related sentence ---------- */
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  // Build a post from the tags on the shelf. Each tag is a committed persona
  // with three moves (setup / escalate / confess). The generator assembles an
  // arc: introduce, over-claim, then undercut. Repeated tags make a move land
  // harder; mixed personas collide for comedic effect.
  function generatePost() {
    const items = caught.filter(w => w.id);
    if (!items.length) return '';
    const uniq = Array.from(new Map(items.map(w => [w.id, w])).values());

    // if one persona dominates, give it the mic (a focused bit)
    if (uniq.length === 1) {
      const w = uniq[0];
      const setup = pick(w.setup.length ? w.setup : [w.t]);
      const escal = pick(w.escalate.length ? w.escalate : [w.t]);
      const conf = pick(w.confess.length ? w.confess : [w.t]);
      return setup + ' ' + escal + ' ' + conf;
    }

    // otherwise spread the arc across the mixed personas so each voice lands
    const order = uniq.slice().sort(() => Math.random() - 0.5);
    const a = order[0], b = order[1], c = order[2] || order[0];
    const sa = pick(a.setup.length ? a.setup : [a.t]);
    const eb = pick(b.escalate.length ? b.escalate : [b.t]);
    const cc = pick(c.confess.length ? c.confess : [c.t]);
    return sa + ' ' + eb + ' ' + cc;
  }

  // resonance: richness from more distinct tags and a boost from repeating a
  // topic (strength). No tiered tag values — quality is what you compose.
  function tagMult() {
    if (!caught.length) return 0.5;
    let m = 0.9;
    m *= 1 + (caught.length - 1) * 0.14;
    // strength: repeating the same topic deepens it instead of spreading thin
    const focus = caught.reduce((a, w) => a + Math.min(3, w.strength), 0);
    m *= 1 + (focus - caught.length) * 0.12;
    return Math.max(0.5, Math.min(2, m));
  }

  /* ---------- after posting: pin your latest post to the top of the feed ---------- */
  function flashFeed(post) {
    clearShelf();
    if (!post) return;
    const feed = document.getElementById('feed');
    if (!feed) return;
    // your newest post is glued to the top of the feed — bring it into view so
    // it reads as "posted", unless the player has already scrolled past it.
    const card = feed.querySelector('.post-card[data-post-id="' + post.id + '"]') || feed.querySelector('.post-card');
    if (!card) return;
    const el = card || feed.querySelector('.post-card');
    if (!el) return;
    if (window.scrollY < el.getBoundingClientRect().top) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    el.classList.add('wc-flash');
    setTimeout(() => el.classList.remove('wc-flash'), 2600);
  }

  function clearShelf() {
    caught.length = 0;
    postBtn.disabled = true;
    renderShelf(); updateQuality();
  }

  postBtn.addEventListener('click', () => {
    if (caught.length < 1) return;
    const ids = caught.map(w => w.id).filter(Boolean);
    const text = generatePost();
    const mult = tagMult();
    let published = null;
    if (Engine && Engine.publish) {
      // publish spends each caught tag once from the bucket (Engine.publish does it)
      published = Engine.publish(text, { source: 'composer', potentialMult: mult, tags: ids });
    } else if (Bus) {
      Bus.emit('composer:post', { text: text, potentialMult: mult, tags: ids });
    }
    if (Juice) Juice.toast('Posted · your story is live');
    flashFeed(published);
  });

  /* ---------- focus / open (kept for main.js compatibility) ---------- */
  function open() {
    resize(); // canvas size depends on visible layout
    // the field always mirrors the bucket — never generates words on its own
    syncField();
    // highlight the post box as the drop target
    composer.classList.add('composer-highlight');
    setTimeout(() => composer.classList.remove('composer-highlight'), 1600);
    // empty bucket hint
    if (barPh) {
      barPh.textContent = Tags.count() > 0
        ? 'drag to words into the post box — we\'ll write the story'
        : 'your bucket is empty — scroll the feed to absorb tags first';
    }
  }
  // bucket is always visible; keep the API so main.js's listener still works
  window.Wordcatch = { open: open, close: function () {}, clearShelf: clearShelf };

  // clicking the composer also just focuses it (no modal)
  const composerOpen = document.getElementById('composer-open');
  if (composerOpen) composerOpen.addEventListener('click', open);

  /* ---------- init ---------- */
  window.addEventListener('resize', resize);
  // keep W/H in sync even if the card starts collapsed or the layout shifts
  // without a window resize (e.g. the right rail gains content), so words are
  // never clipped by a stale canvas size.
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w !== W || h !== H) resize();
    });
    ro.observe(canvas);
  }
  resize();
  ctx.font = FONT;
  syncField();
  renderShelf(); updateQuality();
  requestAnimationFrame(loop);
})();
