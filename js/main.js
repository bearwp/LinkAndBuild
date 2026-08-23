/* ============================================================
   LINK & BUILD — Bootstrap
   Wire up events, seed the feed, start the engine.
   ============================================================ */

(function boot() {
  // init state
  State.load();

  // dev shortcuts (opt-in via URL query, never on a normal boot)
  if (DevState.isReset()) DevState.resetProgress();
  if (DevState.isFull()) DevState.applyFull();
  else if (DevState.isAll()) DevState.applyAll();

  // scale slider
  const scaleSlider = document.getElementById('scale-slider');
  const scaleLabel = document.getElementById('scale-label');
  scaleSlider.value = State.data.scale;
  scaleLabel.textContent = State.data.scale.toFixed(1) + '×';
  scaleSlider.addEventListener('input', () => {
    State.data.scale = parseFloat(scaleSlider.value);
    scaleLabel.textContent = State.data.scale.toFixed(1) + '×';
  });

  // notation toggle
  const notationSelect = document.getElementById('notation-select');
  notationSelect.value = State.data.notation || 'standard';
  notationSelect.addEventListener('change', () => {
    State.data.notation = notationSelect.value;
    UI.refresh();
    UI.renderFeed();
  });

  // debug: toggle the debug panel open/closed (the wrench button stays)
  document.getElementById('debug-toggle').addEventListener('click', () => {
    document.getElementById('debug-bar').classList.toggle('collapsed');
  });

  // debug: wipe the save and start from scratch
  document.getElementById('debug-reset').addEventListener('click', () => {
    if (confirm('Reset your save? This wipes everything and starts a fresh game.')) {
      DevState.resetProgress();
    }
  });

  // seed initial feed
  if (State.data.posts.length === 0) {
    // cold start: nothing. The feed is a ghost town until you manually follow
    // someone from "People you may know" — that's the whole point. You trickle
    // into the loop by hand, one follow at a time.
    for (let i = 0; i < 6; i++) {
      State.data.posts.push(Engine.makeNPCPost());
    }
  }
  // starter tags so you can write and post a first story immediately.
  // Granted once on any existing save that doesn't have them yet, or any
  // save whose bucket has been emptied — you always start (or restart) with beg.
  if (!State.data.bucket.starterGranted || Tags.count() === 0) {
    State.data.bucket.starterGranted = true;
    if (!State.data.bucket.tags['beg']) State.data.bucket.tags['beg'] = 1;
  }

  // bound any pre-existing oversized save so the tick loops stay cheap
  Engine.trimPosts();

  // juice + ui init
  Juice.init();
  UI.fillTemplateSelect();
  UI.updatePreview();
  UI.renderFeed();
  UI.renderGrowth();
  UI.renderFactoryStrip();
  UI.renderAds();
  UI.renderRecommended();
  UI.renderBucket();
  UI.renderOpportunities();
  UI.renderBots();
  UI.renderDms();
  UI.refresh();
  UI.updateBell();

  // OS shell
  OS.init();

  // signup: pre-fill the profile for now, then hand off to the OS
  document.getElementById('signup-name').value = State.data.name === 'You' ? '' : State.data.name;
  document.getElementById('signup-headline').value = State.data.headline === 'Just here for the game.' ? '' : State.data.headline;
  document.getElementById('signup-submit').addEventListener('click', () => OS.submitSignup());

  // narrator (the algorithm's voice) — subscribes to the bus
  Narrator.init();

  // sponsors (the money loop) — driven by the engine tick
  Sponsors.init();

  // prestige (the reset / brand equity) — player-triggered via the UI
  Prestige.init();

  // endorsements (achievements) + challenges (roguelite modifiers)
  Endorsements.init();
  Challenges.init();

  // the reveal (dead internet) + post-reveal endgame
  Reveal.init();

  // the guide (guided objective — one always-visible next step)
  Guide.init();

  // offline progress
  Engine.applyOffline();

  // ---- event wiring ----
  const $ = id => document.getElementById(id);

  // Event bus: systems emit domain events, presentation subscribes.
  // This is the seam that lets the narrator, scare posts, and achievements
  // be added later as pure listeners.
  Bus.on('notif:added', () => UI.updateBell());
  Bus.on('post:streamed', (e) => UI.queueNewPost(e && e.post));
  Bus.on('fourthwall:posted', () => UI.renderFeedDebounced());
  Bus.on('one-real-person:seen', (post) => UI.queueNewPost(post));
  Bus.on('scare:posted', (post) => UI.queueNewPost(post));
  Bus.on('detection:restored', () => UI.hideShadowban());
  Bus.on('detection:flag', () => UI.showFlag());
  Bus.on('detection:shadowban', () => UI.showShadowban());
  Bus.on('post:liked', (post) => UI.updatePostCard(post));
  Bus.on('post:commented', (post) => UI.updatePostCard(post));
  Bus.on('post:viral', (post) => UI.viralBurst(post));
  Bus.on('person:connected', () => { UI.renderNetwork(); UI.refresh(); });
  Bus.on('generator:bought', () => { UI.renderGrowth(); UI.renderFactoryStrip(); UI.refresh(); });
  Bus.on('upgrade:bought', () => { UI.renderGrowth(); UI.renderFactoryStrip(); UI.refresh(); });
  Bus.on('premium:bought', () => { UI.hideModal('premium-modal'); UI.refresh(); });
  Bus.on('tag:absorbed', () => { UI.renderBucket(); UI.refresh(); });
  Bus.on('post:published', (post) => { UI.renderFeed(); UI.updatePostCard(post); UI.renderBucket(); UI.renderRecommended(); });
  Bus.on('post:autoposted', (post) => { UI.queueNewPost(post); UI.updatePostCard(post); UI.renderBucket(); });
  Bus.on('post:boosted', (post) => { UI.renderFeed(); UI.updatePostCard(post); });
  Bus.on('person:followed', () => { UI.renderRecommended(); UI.renderBucket(); UI.refresh(); });
  Bus.on('person:connected', () => { UI.renderNetwork(); UI.refresh(); });
  Bus.on('bot:bought', () => { UI.renderBots(); UI.refresh(); });
  Bus.on('opportunity:taken', () => { UI.renderOpportunities(); UI.refresh(); });
  Bus.on('clout:bought', () => { UI.refresh(); });
  Bus.on('streak:changed', () => { UI.refresh(); });
  Bus.on('pillars:changed', () => { UI.refresh(); });
  Bus.on('trending:spawned', () => { UI.updateTrendingChip(); });
  Bus.on('race:spawned', (post) => { UI.queueNewPost(post); });
  Bus.on('race:won', (post) => { UI.updatePostCard(post); });
  Bus.on('collab:offer', () => { UI.renderDms(); });
  Bus.on('post:replied', (post) => { UI.updatePostCard(post); });
  Bus.on('post:ratioed', () => { UI.renderFeedDebounced(); });
  Bus.on('ab:started', (post) => { UI.updatePostCard(post); });
  Bus.on('ab:decided', (e) => { if (e && e.post) { UI.updatePostCard(e.post); UI.renderAb(e.post); } });

  // new-posts bar: clicking loads the queued posts into the feed
  document.getElementById('new-posts-btn').addEventListener('click', () => UI.loadNewPosts());

  // desktop icons
  document.querySelectorAll('.d-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const app = icon.dataset.app;
      if (app === 'files' || app === 'recycle') {
        Juice.toast(app === 'files' ? 'No files. Only vibes.' : 'The recycle bin is empty. Like your engagement.');
        return;
      }
      if (!State.data.os.unlockedApps.includes(app)) {
        Juice.toast('Locked. A LockedIn DM will unlock this.');
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
        Juice.toast('Locked. A LockedIn DM will unlock this.');
        return;
      }
      OS.switchApp(t.dataset.app);
    });
  });

  // browser tabs
  document.querySelectorAll('.b-tab').forEach(t => {
    t.addEventListener('click', () => {
      if (!State.data.os.unlockedApps.includes(t.dataset.app)) {
        Juice.toast('Locked. A LockedIn DM will unlock this.');
        return;
      }
      OS.switchApp(t.dataset.app);
    });
  });

  // start button -> desktop
  $('task-start').addEventListener('click', () => OS.showDesktop());

  // composer open
  $('open-growth').addEventListener('click', () => {
    UI.renderGrowth();
    UI.renderBots();
    UI.showModal('growth-modal');
  });

  // composer — catch topics, machine writes the post (physics-based)
  $('composer-open').addEventListener('click', () => {
    if (window.Wordcatch) window.Wordcatch.open();
  });

  // composer options
  $('opt-template').addEventListener('change', () => UI.updatePreview());
  $('opt-format').addEventListener('change', () => UI.updatePreview());
  $('opt-emojis').addEventListener('change', () => UI.updatePreview());
  $('opt-tags').addEventListener('change', () => UI.updatePreview());
  $('opt-question').addEventListener('change', () => UI.updatePreview());
  $('opt-tone').addEventListener('change', () => UI.updatePreview());

  // publish
  $('publish-btn').addEventListener('click', () => {
    const text = $('post-text').value;
    const opts = {
      template: $('opt-template').value,
      format: $('opt-format').value,
      emojis: parseInt($('opt-emojis').value, 10),
      tags: parseInt($('opt-tags').value, 10),
      question: parseInt($('opt-question').value, 10),
      tone: $('opt-tone') ? $('opt-tone').value : 'safe',
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
  $('menu-pillars').addEventListener('click', () => {
    UI.renderPillars();
    UI.showModal('pillars-modal');
  });
  $('menu-prestige').addEventListener('click', () => {
    Prestige.render();
    UI.showModal('prestige-modal');
  });
  $('menu-endorsements').addEventListener('click', () => {
    UI.renderEndorsements();
    UI.showModal('endorsements-modal');
  });
  $('menu-algorithm').addEventListener('click', () => {
    UI.renderAlgorithm();
    UI.showModal('algorithm-modal');
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

  // autosave: every 5s + on tab close
  setInterval(() => State.save(), 5000);
  window.addEventListener('beforeunload', () => State.save());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) State.save();
  });

  // first-time welcome (only once past the signup gate)
  setTimeout(() => {
    if (!State.data.signedUp) return;
    Juice.milestone('WELCOME TO LOCKEDIN', 'The game. Post something.', '');
    Juice.chime();
    // highlight the composer
    const composer = document.getElementById('composer');
    composer.classList.add('composer-highlight');
    setTimeout(() => composer.classList.remove('composer-highlight'), 4000);
  }, 1200);
})();
