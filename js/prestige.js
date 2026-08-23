/* ============================================================
   LINK & BUILD — Prestige (the reset / brand equity)
   Deleting your account is the prestige. You come back as a new
   persona with permanent Brand Equity, which buys permanent
   upgrades that make every future climb faster.

   The dead-internet reveal deepens each reset: you are reincarnating
   into the same empty room, because the room is the only place that
   ever counted you. The game never says this. It just lets you do it,
   again and again, forever.
   ============================================================ */

const Prestige = {
  /* ---------- brand equity math ---------- */
  // How much brand equity a reset is worth, from total impressions earned
  // this run. Square-root so early resets are cheap and late resets hit
  // diminishing returns — timing is the skill.
  equityFor(totalImpressions) {
    if (!totalImpressions || totalImpressions <= 0) return 0;
    return Math.max(1, Math.floor(Math.sqrt(totalImpressions / 1e6)));
  },

  // the permanent multiplier for a given effect, from owned upgrade levels
  multiplier(effect) {
    const s = State.data;
    let mult = 1;
    for (const u of DATA.BRAND_EQUITY_UPGRADES) {
      if (u.effect !== effect) continue;
      const lvl = s.prestige.upgrades[u.id] || 0;
      if (lvl > 0) mult += u.perLevel * lvl;
    }
    return mult;
  },

  // flat head-start bonuses (followers, seed money) from owned upgrades
  headStart(effect) {
    const s = State.data;
    let total = 0;
    for (const u of DATA.BRAND_EQUITY_UPGRADES) {
      if (u.effect !== effect) continue;
      const lvl = s.prestige.upgrades[u.id] || 0;
      total += u.perLevel * lvl;
    }
    return total;
  },

  // does the player own the auto-poster unlock?
  hasAutoPost() {
    return (State.data.prestige.upgrades['be_autopost'] || 0) > 0;
  },

  /* ---------- upgrade purchase ---------- */
  buyUpgrade(id) {
    const s = State.data;
    const u = DATA.BRAND_EQUITY_UPGRADES.find(x => x.id === id);
    if (!u) return;
    const lvl = s.prestige.upgrades[id] || 0;
    if (lvl >= u.max) return;
    if (s.prestige.brandEquity < u.cost) {
      Juice.toast('Not enough Brand Equity. Delete your account to earn more.');
      return;
    }
    s.prestige.brandEquity -= u.cost;
    s.prestige.upgrades[id] = lvl + 1;
    Juice.chime();
    Narrator.say('prestige_upgrade', 'notif');
    Bus.emit('prestige:upgrade', { id });
    this.render();
  },

  /* ---------- the reset ---------- */
  // Delete the account: award brand equity, wipe the run, reincarnate as a
  // new persona. The bank balance is the only number that survives untouched —
  // it is the only real number, and it is the quiet counterpoint to the reset.
  reset() {
    const s = State.data;

    // award brand equity from this run's total impressions
    const earned = this.equityFor(s.totalImpressions);
    const bankBalance = s.os.bank.balance;
    const bankTransactions = s.os.bank.transactions;

    // build a fresh run, then re-apply the permanent layer
    const fresh = defaultState();
    fresh.prestige = {
      brandEquity: s.prestige.brandEquity + earned,
      resets: s.prestige.resets + 1,
      layer: s.prestige.layer,
      upgrades: s.prestige.upgrades,
      totalEarned: s.prestige.totalEarned + earned,
    };
    // endorsements and completed challenges are permanent records — they survive
    // the reset the way a LinkedIn profile survives you deleting the app.
    fresh.achievements = s.achievements;
    fresh.challenges = {
      active: null,
      completed: s.challenges.completed,
      stats: defaultState().challenges.stats,
    };
    // the bank is the only real number — it survives the reset
    fresh.os.bank.balance = bankBalance;
    fresh.os.bank.transactions = bankTransactions;
    // the reveal is permanent — you can't un-know that the room was empty
    fresh.reveal = s.reveal;
    fresh.retention = s.retention;
    fresh.narrator.revealed = s.narrator.revealed;
    // a new persona
    const persona = this.rollPersona();
    fresh.name = persona.name;
    fresh.headline = persona.headline;
    fresh.avatar = persona.avatar;
    // head-start bonuses from permanent upgrades
    fresh.followers = this.headStart('headstart');
    fresh.os.bank.balance += this.headStart('seed');
    if (this.hasAutoPost()) {
      fresh.generators['aifactory'] = 1;
    }

    State.data = fresh;
    State.save();

    // re-seed the feed so the new run isn't an empty room
    for (let i = 0; i < 6; i++) {
      State.data.posts.push(Engine.makeNPCPost());
    }

    // narrate the reincarnation
    if (fresh.prestige.resets === 1) Narrator.say('prestige_first', 'dm');
    else Narrator.say('prestige_reset', 'dm');

    Bus.emit('prestige:reset', { earned, resets: fresh.prestige.resets });

    // full UI refresh
    UI.refresh();
    UI.renderFeed();
    UI.renderGrowth();
    UI.renderRecommended();
    UI.renderNetwork();
    UI.updateBell();
    this.render();

    Juice.milestone(
      '🗑️ ACCOUNT DELETED',
      '+' + earned + ' Brand Equity · You are ' + fresh.name + ' now',
      'viral'
    );
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 80);
  },

  // pick a persona that isn't the one you just were
  rollPersona() {
    const s = State.data;
    const pool = DATA.PERSONAS.filter(p => p.name !== s.name);
    const p = pool[Math.floor(Math.random() * pool.length)] || DATA.PERSONAS[0];
    return {
      name: p.name,
      headline: p.headline,
      avatar: DATA.avatar(p.c1, p.c2),
    };
  },

  /* ---------- UI ---------- */
  // render the brand equity tree + delete-account panel into the modal body
  render() {
    const body = document.getElementById('prestige-body');
    if (!body) return;
    const s = State.data;
    const p = s.prestige;
    const layer = DATA.PRESTIGE_LAYERS.find(l => l.layer === p.layer) || DATA.PRESTIGE_LAYERS[0];
    const nextEarn = this.equityFor(s.totalImpressions);

    body.innerHTML = `
      <div class="prestige-app">
        <div class="prestige-head">
          <div class="prestige-title">${layer.icon || '♻️'} ${layer.name} Layer</div>
          <div class="prestige-sub">${layer.reset} · permanent currency: ${layer.currency}</div>
        </div>
        <div class="prestige-stats">
          <div class="prestige-stat">
            <div class="prestige-stat-num">${p.brandEquity}</div>
            <div class="prestige-stat-label">Brand Equity</div>
          </div>
          <div class="prestige-stat">
            <div class="prestige-stat-num">${p.resets}</div>
            <div class="prestige-stat-label">Accounts Deleted</div>
          </div>
          <div class="prestige-stat">
            <div class="prestige-stat-num">+${nextEarn}</div>
            <div class="prestige-stat-label">Next Reset Worth</div>
          </div>
        </div>
        <div class="prestige-tree">
          <div class="prestige-tree-title">Permanent Upgrades</div>
          ${DATA.BRAND_EQUITY_UPGRADES.map(u => {
            const lvl = p.upgrades[u.id] || 0;
            const maxed = lvl >= u.max;
            const affordable = p.brandEquity >= u.cost && !maxed;
            return `<div class="prestige-node">
              <div class="prestige-node-icon">${u.icon}</div>
              <div class="prestige-node-info">
                <div class="prestige-node-name">${u.name} <span class="prestige-node-lvl">${lvl}/${u.max}</span></div>
                <div class="prestige-node-desc">${u.desc}</div>
              </div>
              <button class="btn btn-primary prestige-buy" data-be="${u.id}" ${affordable ? '' : 'disabled'}>${maxed ? 'MAX' : '◆ ' + u.cost}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="prestige-layers">
          <div class="prestige-tree-title">The Layers</div>
          ${DATA.PRESTIGE_LAYERS.map(l => `
            <div class="prestige-layer ${l.layer === p.layer ? 'active' : ''}">
              <span class="prestige-layer-num">${l.layer}</span>
              <span class="prestige-layer-name">${l.name}</span>
              <span class="prestige-layer-reset">${l.reset}</span>
              <span class="prestige-layer-unlock">→ ${l.unlock}</span>
            </div>`).join('')}
        </div>
        <div class="prestige-delete">
          <div class="prestige-delete-title">Delete Your Account</div>
          <div class="prestige-delete-copy">Wipe this run and reincarnate as a new persona. You keep your Brand Equity and your bank balance. The room stays empty. You come back anyway.</div>
          <button class="btn btn-danger" id="prestige-delete">🗑️ Delete Account (+${nextEarn} Brand Equity)</button>
        </div>
      </div>`;

    body.querySelectorAll('[data-be]').forEach(btn => {
      btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.be));
    });
    const del = body.querySelector('#prestige-delete');
    if (del) del.addEventListener('click', () => this.confirmReset());
  },

  // two-step confirm so a misclick doesn't wipe a run
  confirmReset() {
    const del = document.getElementById('prestige-delete');
    if (!del) return;
    if (del.dataset.confirm === '1') {
      this.reset();
      return;
    }
    del.dataset.confirm = '1';
    del.textContent = '⚠️ Are you sure? Click again to delete.';
    setTimeout(() => {
      if (del.dataset.confirm === '1') {
        del.dataset.confirm = '0';
        del.textContent = '🗑️ Delete Account (+' + this.equityFor(State.data.totalImpressions) + ' Brand Equity)';
      }
    }, 3000);
  },

  init() {
    // nothing to subscribe to — the reset is player-triggered via the UI.
  },
};
