/* ============================================================
   LINK & BUILD — Word Catch Composer (?words=1)
   Simple, tactile post building.
   Hold to hoover words — they ride with your cursor in a tidy arc.
   Sweep your handful DOWN to the bottom edge of the field and let
   go: the words lock into your post. Let go anywhere else and they
   fly back. One motion, no aiming, no color confusion.
   ============================================================ */

(function () {
  'use strict';

  if (new URLSearchParams(window.location.search).get('words') !== '1') return;

  /* ---------- word pool ---------- */
  // CONTENT = solid blue, carries meaning/value. GLUE = light grey,
  // cheap connective tissue. rare gold = a spike.
  const WORD_POOL = [
    // content
    { t: 'synergy',   v: 0.9 }, { t: 'leverage', v: 0.8 }, { t: 'journey', v: 0.8 },
    { t: 'mindset',   v: 0.8 }, { t: 'growth',   v: 0.7 }, { t: 'chaos',   v: 0.8 },
    { t: 'resilience',v: 0.8 }, { t: 'framework',v: 0.7 }, { t: 'hustle',  v: 0.7 },
    { t: 'vision',    v: 0.7 }, { t: 'founder',  v: 0.8 }, { t: 'momentum',v: 0.7 },
    { t: 'sacrifice', v: 0.8 }, { t: 'grateful', v: 0.9 }, { t: 'humbled', v: 0.9 },
    { t: 'disruptive',v: 0.9 }, { t: 'visionary',v: 0.9 }, { t: 'unlocked',v: 0.7 },
    { t: 'scaled',    v: 0.7 }, { t: 'pivotal',  v: 0.7 }, { t: 'relentless',v: 0.8 },
    { t: 'late-night',v: 0.8 }, { t: 'overnight',v: 0.7 },
    // rare gold
    { t: 'algorithm', v: 1.2, rare: 1 },
    { t: 'viral',     v: 1.2, rare: 1 },
    // glue (grey)
    { t: 'is', v: 0.1 }, { t: 'just', v: 0.1 }, { t: 'not', v: 0.1 },
    { t: 'with', v: 0.1 }, { t: 'and', v: 0.1 }, { t: 'of', v: 0.1 },
    { t: 'my', v: 0.1 }, { t: 'the', v: 0.1 }, { t: 'a', v: 0.1 },
    { t: 'every', v: 0.1 }, { t: 'never', v: 0.1 }, { t: 'always', v: 0.1 },
  ];

  /* ---------- scaffold ---------- */
  const panel = document.createElement('div');
  panel.id = 'wordcomposer';
  panel.innerHTML = `
    <div class="wc-head">
      <span class="wc-title">Create a post</span>
      <span class="wc-badge" id="wc-badge">🖐 You are writing</span>
    </div>
    <div class="wc-quality" id="wc-quality"><div class="wc-quality-fill" id="wc-quality-fill"></div></div>
    <canvas id="wc-canvas"></canvas>
    <div class="wc-bar" id="wc-bar">
      <div class="wc-sentence" id="wc-sentence"><span class="wc-bar-ph" id="wc-bar-ph">sweep words down here to post them</span></div>
      <button class="btn btn-primary" id="wc-post" disabled>Post</button>
    </div>
  `;
  document.body.appendChild(panel);

  const canvas = document.getElementById('wc-canvas');
  const ctx = canvas.getContext('2d');
  const barEl = document.getElementById('wc-bar');
  const sentenceEl = document.getElementById('wc-sentence');
  const barPh = document.getElementById('wc-bar-ph');
  const qualityEl = document.getElementById('wc-quality');
  const qualityFill = document.getElementById('wc-quality-fill');
  const postBtn = document.getElementById('wc-post');

  /* ---------- state ---------- */
  let W = 0, H = 0;
  const field = [];        // free words
  const pointer = { x: -9999, y: -9999, active: false };
  const carried = [];      // words riding the cursor
  const caught = [];       // locked into the post

  const FONT = '600 15px -apple-system, Segoe UI, sans-serif';
  const PAD = 8;
  const SUCTION_R = 110;
  const STICK_R = 42;
  const SUCTION_F = 1200;
  const FOLLOW = 18;       // eased follow speed for carried words (no spring jitter)
  const DROP_BAND = 60;    // release within this many px of the bottom edge = drop

  // three looks: blue content, grey glue, gold rare
  const COL = { content: 'hsla(210, 70%, 50%, 0.92)', glue: 'hsla(0, 0%, 66%, 0.85)', gold: 'hsla(42, 95%, 52%, 0.95)' };
  function styleOf(w) { return w.rare ? 'gold' : (w.v < 0.3 ? 'glue' : 'content'); }

  function textSize(t) {
    ctx.font = FONT;
    const m = ctx.measureText(t);
    return { w: m.width + PAD * 2, h: 24 };
  }

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight || 400;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function makeWord(glue) {
    let pool = WORD_POOL;
    if (glue) pool = WORD_POOL.filter(w => w.v < 0.3);
    else pool = WORD_POOL.filter(w => w.v >= 0.3);
    const src = pool[(Math.random() * pool.length) | 0];
    const sz = textSize(src.t);
    return {
      t: src.t, v: src.v, rare: src.rare || 0,
      x: 20 + Math.random() * (W - 40), y: 20 + Math.random() * (H - 40),
      vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
      w: sz.w, h: sz.h,
    };
  }

  // carrying words are parked in an arc above the cursor
  function arcPos(i, n, cx, cy) {
    const a = (i / Math.max(1, n)) * Math.PI - Math.PI; // 0..PI -> top arc
    const r = 30 + (n - 1) * 10;
    return { x: cx + Math.cos(a) * r, y: cy - 26 - Math.sin(a) * r * 0.6 };
  }

  /* ---------- physics ---------- */
  function update(dt) {
    if (Math.random() < dt * (caught.length < 6 ? 2.4 : 1.0) && field.length < 26) {
      field.push(makeWord(Math.random() < 0.3)); // 30% glue
    }

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
        if (d < STICK_R && carried.length < 7) {
          field.splice(i, 1);
          carried.push({ t: w.t, v: w.v, rare: w.rare || 0, x: w.x, y: w.y, vx: 0, vy: 0, w: w.w, h: w.h });
          if (window.Juice && window.Juice.pop) window.Juice.pop();
          continue;
        }
        if (d < SUCTION_R) {
          const f = (1 - d / SUCTION_R) * SUCTION_F;
          w.vx += (dx / d) * f * dt; w.vy += (dy / d) * f * dt;
          const sp = Math.hypot(w.vx, w.vy), max = 520;
          if (sp > max) { w.vx *= max / sp; w.vy *= max / sp; }
        }
      }
      // carried words ease to a tidy arc above the cursor (no jitter)
      const n = carried.length;
      for (let i = 0; i < n; i++) {
        const w = carried[i];
        const t = arcPos(i, n, pointer.x, pointer.y);
        w.x += (t.x - w.x) * Math.min(1, FOLLOW * dt);
        w.y += (t.y - w.y) * Math.min(1, FOLLOW * dt);
      }
    }
  }

  /* ---------- release: drop at bottom edge, scatter otherwise ---------- */
  function release() {
    if (!carried.length) return;
    const atBottom = pointer.y > H - DROP_BAND;
    if (atBottom) {
      // remember where each word left the cursor so they can fly into the bar
      const cr = canvas.getBoundingClientRect();
      const from = carried.map(w => ({ x: cr.left + w.x, y: cr.top + w.y }));
      const added = carried.length;
      for (const w of carried) caught.push({ t: w.t, v: w.v, rare: w.rare || 0 });
      renderSentence(from);
      updateQuality();
      postBtn.disabled = caught.length < 3;
      if (window.Juice) {
        if (window.Juice.coin) window.Juice.coin();
        window.Juice.floatUp(cr.left + W / 2, cr.top + H - 10, '+' + added, '#0a66c2');
      }
    } else {
      for (const w of carried) {
        const sx = (Math.random() - 0.5) * 120, sy = (Math.random() - 0.5) * 120;
        field.push({ t: w.t, v: w.v, rare: w.rare || 0, x: w.x, y: w.y, vx: sx, vy: sy, w: w.w, h: w.h });
      }
    }
    carried.length = 0;
  }

  /* ---------- draw ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // drop hint: a soft glow along the bottom edge
    if (pointer.active && carried.length) {
      ctx.fillStyle = 'rgba(10,102,194,0.10)';
      ctx.fillRect(0, H - DROP_BAND, W, DROP_BAND);
      ctx.fillStyle = 'rgba(10,102,194,0.25)';
      ctx.fillRect(0, H - 2, W, 2);
    }

    // field words
    for (const w of field) {
      const x = w.x - w.w / 2, y = w.y - w.h / 2, r = 6;
      ctx.fillStyle = COL[styleOf(w)];
      rounded(ctx, x, y, w.w, w.h, r); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(w.t, w.x, w.y);
    }

    // carried words: big, solid, clearly in hand
    for (const w of carried) {
      const scale = 1.5;
      const bw = w.w * scale, bh = w.h * scale, r = 10;
      const x = w.x - bw / 2, y = w.y - bh / 2;
      ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 8;
      ctx.fillStyle = COL[styleOf(w)];
      rounded(ctx, x, y, bw, bh, r); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '700 ' + Math.round(15 * scale) + 'px -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(w.t, w.x, w.y);
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

  /* ---------- sentence + quality ---------- */
  function renderSentence(from) {
    if (!caught.length) { sentenceEl.innerHTML = ''; barPh.style.display = ''; return; }
    barPh.style.display = 'none';
    sentenceEl.innerHTML = '';
    caught.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wc-chip ' + styleOf(w) + (i === 0 ? ' first' : '');
      chip.textContent = w.t;
      sentenceEl.appendChild(chip);
    });
    if (from) {
      // fly newly-dropped chips in from their cursor positions, staggered
      const chips = sentenceEl.querySelectorAll('.wc-chip');
      const offset = caught.length - from.length;
      from.forEach((src, j) => {
        const chip = chips[offset + j];
        if (!chip) return;
        const here = chip.getBoundingClientRect();
        chip.classList.add('wc-fly');
        chip.style.setProperty('--fx', (src.x - here.left) + 'px');
        chip.style.setProperty('--fy', (src.y - here.top) + 'px');
        chip.style.animationDelay = (j * 0.05) + 's';
      });
    }
  }

  function quality() {
    if (!caught.length) return 0;
    const avg = caught.reduce((a, f) => a + f.v, 0) / caught.length;
    return Math.min(1.6, avg * (1 + caught.length * 0.04));
  }

  function updateQuality() {
    const q = quality();
    const show = caught.length >= 3;
    qualityEl.classList.toggle('show', show);
    qualityFill.style.width = (show ? Math.min(100, Math.round(q * 60)) : 0) + '%';
    qualityFill.style.background = q >= 1.1 ? 'linear-gradient(90deg,#ff9800,#ff5722)' : '#0a66c2';
  }

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt); draw();
    requestAnimationFrame(loop);
  }

  /* ---------- pointer events ---------- */
  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
  }
  canvas.addEventListener('pointerdown', (e) => { setPointer(e); pointer.active = true; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', setPointer);
  canvas.addEventListener('pointerup', () => { pointer.active = false; release(); });
  canvas.addEventListener('pointercancel', () => { pointer.active = false; release(); });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });

  /* ---------- assemble + polish ---------- */
  function polish() {
    let s = caught.map(w => w.t).join(' ');
    s = s.replace(/\s+([,.;:!?])/g, '$1');
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) s += '.';
    return s;
  }

  postBtn.addEventListener('click', () => {
    if (caught.length < 3) return;
    const sentence = polish();
    const mult = 1 + (quality() - 0.4) * 0.6;
    if (window.Engine && window.Engine.publish) {
      window.Engine.publish(sentence, { source: 'composer', potentialMult: Math.max(0.5, mult) });
    } else if (window.Bus) {
      window.Bus.emit('composer:post', { text: sentence, potentialMult: Math.max(0.5, mult) });
    }
    if (window.Juice) window.Juice.toast('Posted · ' + sentence);

    postBtn.disabled = true;
    caught.length = 0;
    renderSentence(); updateQuality();
  });

  /* ---------- init ---------- */
  window.addEventListener('resize', resize);
  resize();
  ctx.font = FONT;
  for (let i = 0; i < 18; i++) field.push(makeWord());
  renderSentence(); updateQuality();
  requestAnimationFrame(loop);
})();
