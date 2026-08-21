/* ============================================================
   LINK & BUILD — OS Shell
   Boot sequence, desktop, browser tabs, taskbar, app switching,
   and the DM-driven unlock flow.
   ============================================================ */

const OS = {
  booted: false,

  init() {
    const s = State.data;
    // if the player has already posted (existing save), unlock telegram
    if (s.analytics.postsPublished > 0 && !s.os.telegram.unlocked) {
      s.os.telegram.unlocked = true;
      this.unlockApp('telegram');
    }
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // existing players (saves from before the signup gate) skip it
    if (!s.signedUp && s.analytics.postsPublished > 0) {
      s.signedUp = true;
    }

    // signup gate: only a brand-new game asks you to create a profile
    if (!s.signedUp) {
      this.showSignup();
    } else {
      this.showDesktop();
    }
  },

  /* ---------- signup ---------- */
  showSignup() {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('browser').classList.add('hidden');
    document.getElementById('signup').classList.remove('hidden');
  },

  submitSignup() {
    const s = State.data;
    const name = document.getElementById('signup-name').value.trim();
    const headline = document.getElementById('signup-headline').value.trim();
    s.name = name || 'You';
    s.headline = headline || 'Just here for the game.';
    s.signedUp = true;
    State.save();
    document.getElementById('signup').classList.add('hidden');
    this.showBrowser();
    Juice.milestone('WELCOME TO LOCKEDIN', 'The game. Post something.', '');
    Juice.chime();
    const composer = document.getElementById('composer');
    composer.classList.add('composer-highlight');
    setTimeout(() => composer.classList.remove('composer-highlight'), 4000);
  },

  runBoot() {
    const boot = document.getElementById('boot');
    const fill = document.getElementById('boot-fill');
    const text = document.getElementById('boot-text');
    boot.classList.remove('hidden');
    const steps = [
      'Starting WorkOS 1.0...',
      'Loading professional modules...',
      'Optimizing synergy...',
      'Booting LockedIn...',
      'Welcome back. The algorithm missed you.',
    ];
    let i = 0;
    const tick = setInterval(() => {
      if (i < steps.length) {
        text.textContent = steps[i];
        fill.style.width = ((i + 1) / steps.length) * 100 + '%';
        i++;
      } else {
        clearInterval(tick);
        boot.classList.add('hidden');
        State.data.os.booted = true;
        this.showBrowser();
        Juice.milestone('WORKOS', 'Professional productivity, at your fingertips.', '');
      }
    }, 500);
  },

  showBrowser() {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('browser').classList.remove('hidden');
    document.getElementById('alphamail').classList.remove('hidden');
    document.body.classList.add('has-alphamail');
    this.syncAppIcons();
    this.switchApp(State.data.os.activeApp || 'linkedin');
  },

  showDesktop() {
    document.getElementById('browser').classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('alphamail').classList.add('hidden');
    document.body.classList.remove('has-alphamail');
    this.syncAppIcons();
  },

  /* ---------- app switching ---------- */
  switchApp(appId) {
    const s = State.data;
    if (!s.os.unlockedApps.includes(appId)) return;
    s.os.activeApp = appId;
    // tabs
    document.querySelectorAll('.b-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.app === appId);
    });
    // views
    document.querySelectorAll('.app-view').forEach(v => {
      v.classList.toggle('active', v.dataset.app === appId);
    });
    // url bar
    const urls = { linkedin: 'https://www.lockedin.com/feed/', telegram: 'https://web.telegram.org/', bot: 'https://engagebot.example.com/dashboard', dark: 'http://marketplace.onion/', bank: 'https://bank.firstnationalgrind.com/' };
    const url = document.getElementById('b-url');
    if (url) url.value = urls[appId] || '';
    // taskbar
    document.querySelectorAll('.task-app').forEach(t => {
      t.classList.toggle('active', t.dataset.app === appId);
    });
    // app-specific render
    if (appId === 'telegram') Telegram.render();
    if (appId === 'bot') Bot.render();
    if (appId === 'dark') Dark.render();
    if (appId === 'bank') Bank.render();
  },

  /* ---------- app icons (desktop + taskbar + tabs) ---------- */
  syncAppIcons() {
    const s = State.data;
    const unlocked = s.os.unlockedApps;
    document.querySelectorAll('.d-icon, .task-app, .b-tab').forEach(el => {
      const app = el.dataset.app;
      if (!app) return;
      const isUnlocked = unlocked.includes(app);
      el.classList.toggle('locked', !isUnlocked);
    });
  },

  /* ---------- unlock flow ---------- */
  unlockApp(appId) {
    const s = State.data;
    if (s.os.unlockedApps.includes(appId)) return;
    s.os.unlockedApps.push(appId);
    this.syncAppIcons();
    const names = { telegram: 'Telegram', bot: 'Bot Service', dark: 'The Marketplace' };
    Juice.milestone('🔓 UNLOCKED: ' + names[appId] || appId, 'A new tool for your empire', '');
    Juice.chime();
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 40);
    Bus.emit('app:unlocked', { app: appId });
  },

  /* ---------- clock ---------- */
  updateClock() {
    const el = document.getElementById('task-clock');
    if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },
};
