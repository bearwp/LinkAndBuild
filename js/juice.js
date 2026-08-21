/* ============================================================
   LINK & BUILD — Juice
   Particles, confetti, sounds, milestones, toasts, number pops.
   ============================================================ */

const Juice = {
  audio: null,
  muted: false,

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
