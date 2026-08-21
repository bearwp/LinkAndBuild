/* ============================================================
   LINK & BUILD — Bootstrap
   Wire up events, seed the feed, start the engine.
   ============================================================ */

(function boot() {
  // load state
  const hadSave = State.load();

  // DEV MODE: load a full late-game showcase state
  if (DevState.isFull()) {
    DevState.applyFull();
    document.body.classList.add('dev-mode');
  } else if (DevState.isAll()) {
    DevState.applyAll();
    document.body.classList.add('dev-mode');
  }

  // seed initial feed
  if (State.data.posts.length === 0) {
    for (let i = 0; i < 6; i++) {
      State.data.posts.push(Engine.makeNPCPost());
    }
  }

  // bound any pre-existing oversized save so the tick loops stay cheap
  Engine.trimPosts();

  // juice + ui init
  Juice.init();
  UI.fillTemplateSelect();
  UI.updatePreview();
  UI.renderFeed();
  UI.renderGrowth();
  UI.renderAds();
  UI.refresh();
  UI.updateBell();

  // OS shell
  OS.init();

  // offline progress
  Engine.applyOffline();

  // ---- event wiring ----
  const $ = id => document.getElementById(id);

  // desktop icons
  document.querySelectorAll('.d-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const app = icon.dataset.app;
      if (app === 'files' || app === 'recycle') {
        Juice.toast(app === 'files' ? 'No files. Only vibes.' : 'The recycle bin is empty. Like your engagement.');
        return;
      }
      if (!State.data.os.unlockedApps.includes(app)) {
        Juice.toast('Locked. A LinkedIn DM will unlock this.');
        return;
      }
      OS.showBrowser();
      OS.switchApp(app);
    });
  });

  // taskbar apps
  document.querySelectorAll('.task-app').forEach(t => {
    t.addEventListener('click', () => {
      if (!State.data.os.unlockedApps.includes(t.dataset.app)) {
        Juice.toast('Locked. A LinkedIn DM will unlock this.');
        return;
      }
      OS.switchApp(t.dataset.app);
    });
  });

  // browser tabs
  document.querySelectorAll('.b-tab').forEach(t => {
    t.addEventListener('click', () => {
      if (!State.data.os.unlockedApps.includes(t.dataset.app)) {
        Juice.toast('Locked. A LinkedIn DM will unlock this.');
        return;
      }
      OS.switchApp(t.dataset.app);
    });
  });

  // start button -> desktop
  $('task-start').addEventListener('click', () => OS.showDesktop());

  // telegram send
  $('tg-send').addEventListener('click', () => {
    const input = $('tg-text');
    Telegram.sendMessage(input.value);
    input.value = '';
  });
  $('tg-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      Telegram.sendMessage(e.target.value);
      e.target.value = '';
    }
  });

  // composer open
  $('open-growth').addEventListener('click', () => {
    UI.renderGrowth();
    UI.showModal('growth-modal');
  });
  document.querySelectorAll('.ca-btn:not(.ca-options)').forEach(b => {
    b.addEventListener('click', () => {
      const fmt = b.dataset.format;
      if (fmt) {
        const sel = document.getElementById('opt-format');
        if (sel) sel.value = fmt;
        UI.updatePreview();
      }
      UI.openComposer();
    });
  });

  // inline composer — minimal "Start a post" block opens the full composer modal
  $('composer-open').addEventListener('click', () => UI.openComposer());

  // composer options
  $('opt-template').addEventListener('change', () => UI.updatePreview());
  $('opt-format').addEventListener('change', () => UI.updatePreview());
  $('opt-emojis').addEventListener('change', () => UI.updatePreview());
  $('opt-tags').addEventListener('change', () => UI.updatePreview());
  $('opt-question').addEventListener('change', () => UI.updatePreview());

  // publish
  $('publish-btn').addEventListener('click', () => {
    const text = $('post-text').value;
    const opts = {
      template: $('opt-template').value,
      format: $('opt-format').value,
      emojis: parseInt($('opt-emojis').value, 10),
      tags: parseInt($('opt-tags').value, 10),
      question: parseInt($('opt-question').value, 10),
    };
    const post = Engine.publish(text, opts);
    if (post) {
      $('post-text').value = '';
      UI.hideModal('composer-modal');
      // rarity reveal moment
      setTimeout(() => {
        if (post.rarity === 'legendary') {
          Juice.milestone('🔥 LEGENDARY POST', 'It\'s going viral', 'viral');
          Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 80);
        } else if (post.rarity === 'epic') {
          Juice.milestone('✨ EPIC POST', 'The algorithm likes you', '');
        } else if (post.rarity === 'rare') {
          Juice.milestone('💎 RARE POST', 'Decent reach', '');
        }
      }, 1200);
    }
  });

  // growth tabs
  document.querySelectorAll('.gtab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.gtab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.growth-pane').forEach(p => p.classList.add('hidden'));
      $('g-pane-' + t.dataset.gtab).classList.remove('hidden');
    });
  });

  // nav
  document.querySelectorAll('.nav-item').forEach(i => {
    i.addEventListener('click', () => UI.switchTab(i.dataset.tab));
  });

  // modal close buttons
  document.querySelectorAll('.modal-close').forEach(b => {
    b.addEventListener('click', () => UI.hideModal(b.dataset.close));
  });
  // click outside to close
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', (e) => {
      if (e.target === o) o.classList.add('hidden');
    });
  });

  // premium
  $('buy-premium').addEventListener('click', () => Engine.buyPremium());
  // premium upsell triggers
  $('menu-premium').addEventListener('click', () => UI.showModal('premium-modal'));
  $('menu-analytics').addEventListener('click', () => {
    UI.renderAnalytics();
    UI.showModal('analytics-modal');
  });

  // flag ack
  $('flag-ack').addEventListener('click', () => UI.hideModal('flag-modal'));

  // shadowban dismiss (still throttled, but lets them see feed)
  document.getElementById('shadowban-overlay').addEventListener('click', () => {
    if (State.data.authenticity >= 60) UI.hideShadowban();
  });

  // periodic ad rotation
  setInterval(() => UI.renderAds(), 15000);

  // infinite scroll: append NPC posts near the bottom
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
      const added = UI.appendFeed();
      if (added > 0) Engine.lastScrollAppend = Date.now();
    }
  }, { passive: true });

  // start engine
  Engine.start();

  // first-time welcome
  if (!hadSave) {
    setTimeout(() => {
      Juice.milestone('WELCOME TO LINKEDIN', 'The game. Post something.', '');
      Juice.chime();
      // highlight the composer
      const composer = document.getElementById('composer');
      composer.classList.add('composer-highlight');
      setTimeout(() => composer.classList.remove('composer-highlight'), 4000);
    }, 1200);
  }
})();
