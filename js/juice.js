/* ============================================================
   LINK & BUILD — Juice
   Particles, confetti, sounds, milestones, toasts, number pops.
   ============================================================ */

const Juice = {
  audio: null,
  muted: true,

  init() {
    // Tiny WebAudio synth for satisfying dings/pops. No assets needed.
    try {
      this.audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audio = null;
    }
    document.addEventListener('click', () => {
      if (this.audio && this.audio.state === 'suspended') this.audio.resume();
    });
  },

  tone(freq, dur, type, vol, delay) {
    if (!this.audio || this.muted) return;
    const t = this.audio.currentTime + (delay || 0);
    const osc = this.audio.createOscillator();
    const gain = this.audio.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (dur || 0.2));
    osc.connect(gain);
    gain.connect(this.audio.destination);
    osc.start(t);
    osc.stop(t + (dur || 0.2) + 0.05);
  },

  pop() { this.tone(520, 0.08, 'triangle', 0.1); },
  like() { this.tone(660, 0.09, 'triangle', 0.12); this.tone(880, 0.12, 'sine', 0.08, 0.04); },
  ding() { this.tone(880, 0.15, 'sine', 0.12); this.tone(1320, 0.2, 'sine', 0.06, 0.06); },
  chime() { this.tone(523, 0.15, 'sine', 0.12); this.tone(659, 0.15, 'sine', 0.12, 0.08); this.tone(784, 0.2, 'sine', 0.12, 0.16); this.tone(1046, 0.3, 'sine', 0.1, 0.24); },
  warn() { this.tone(220, 0.3, 'sawtooth', 0.08); this.tone(180, 0.4, 'sawtooth', 0.08, 0.1); },
  // metallic ka-ching — the coin payout sound
  coin() { this.tone(988, 0.06, 'square', 0.08); this.tone(1319, 0.08, 'square', 0.08, 0.04); this.tone(1760, 0.12, 'square', 0.07, 0.08); },
  // combo ka-ching — pitch rises with each step so the cascade climbs audibly
  kaChing(step) {
    const f = 660 + (step || 0) * 180;
    this.tone(f, 0.07, 'square', 0.09);
    this.tone(f * 1.5, 0.11, 'square', 0.07, 0.045);
  },

  // tactile "flick" punch — a thumpy low blip then a bright tick, so the
  // number landing has weight and a tiny sparkle on top.
  thock() {
    this.tone(180, 0.06, 'triangle', 0.1);
    this.tone(2400, 0.04, 'sine', 0.05);
  },

  /* --- shake --- */
  shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  },

  /* --- particles --- */
  particles(x, y, text, color) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color || '#0a66c2';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  confetti(x, y, n) {
    const colors = ['#0a66c2', '#ff9800', '#4caf50', '#e91e63', '#ffc107', '#9c27b0'];
    for (let i = 0; i < (n || 40); i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = (x + (Math.random() - 0.5) * 200) + 'px';
      el.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
  },

  // slot-machine coin payout: gold coins arc up, spin, and rain down
  coins(x, y, n) {
    for (let i = 0; i < (n || 6); i++) {
      const el = document.createElement('div');
      el.className = 'coin';
      el.textContent = '🪙';
      el.style.left = (x + (Math.random() - 0.5) * 50) + 'px';
      el.style.top = y + 'px';
      el.style.animationDelay = (Math.random() * 0.08) + 's';
      el.style.setProperty('--dx', ((Math.random() - 0.5) * 160) + 'px');
      el.style.setProperty('--dy', (-(50 + Math.random() * 90)) + 'px');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }
  },

  // a single "joker chip" that fires during a combo cascade: it slides in,
  // flashes its multiplier contribution, then fades — the Balatro-style
  // left-to-right trigger reveal.
  comboChip(x, y, label, text) {
    const el = document.createElement('div');
    el.className = 'combo-chip';
    el.innerHTML = `<span class="combo-chip-icon">${label || ''}</span><span class="combo-chip-text">${text || ''}</span>`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  },

  // the "+N" that floats off the number — the legible "you gained this much"
  // cue. Pops in, arcs up, fades. Size scales with aura so a god's gains feel
  // weightier than a pauper's crumbs.
  floatUp(x, y, text, size) {
    const el = document.createElement('div');
    el.className = 'imp-float';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = (size || 14) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  },

  /* --- toast --- */
  toast(msg, ms) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.add('hidden'), ms || 2600);
  },

  /* --- milestone banner --- */
  milestone(big, sub, cls) {
    const el = document.createElement('div');
    el.className = 'milestone' + (cls ? ' ' + cls : '');
    el.innerHTML = `<div class="ms-big">${big}</div>${sub ? `<div class="ms-sub">${sub}</div>` : ''}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  },

  /* --- number pop on an element --- */
  numPop(el) {
    if (!el) return;
    el.classList.remove('num-pop');
    void el.offsetWidth;
    el.classList.add('num-pop');
  },

  /* --- bell pop --- */
  bellPop() {
    const el = document.getElementById('bell-badge');
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  },
};
