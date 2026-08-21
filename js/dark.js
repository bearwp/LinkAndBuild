/* ============================================================
   LINK & BUILD — Dark Web Marketplace
   Buy engagement from the shadows. High risk, high reward.
   ============================================================ */

const Dark = {
  render() {
    const s = State.data;
    const body = document.getElementById('dark-body');
    if (!body) return;
    if (!s.os.dark.unlocked) {
      body.innerHTML = `<div class="dark-locked">
        <div style="font-size:40px">🔒</div>
        <div class="dark-locked-title">Access Restricted</div>
        <div class="dark-locked-sub">A mysterious DM with a strange link will unlock this. Probably.</div>
      </div>`;
      return;
    }
    body.innerHTML = `
      <div class="dark-market">
        <div class="dark-market-title">~ listings ~</div>
        ${DATA.DARK_LISTINGS.map(l => {
          const affordable = s.impressions >= l.cost;
          return `<div class="dark-listing">
            <div class="dark-listing-icon">${l.icon}</div>
            <div class="dark-listing-info">
              <div class="dark-listing-name">${l.name}</div>
              <div class="dark-listing-desc">${l.desc}</div>
              <div class="dark-listing-stats">+${Engine.fmt(l.reward)} engagement · ${l.auth} authenticity</div>
            </div>
            <button class="btn dark-buy" data-dark="${l.id}" ${affordable ? '' : 'disabled'}>${Engine.fmt(l.cost)}</button>
          </div>`;
        }).join('')}
        <div class="dark-warning">~ all sales final. the algorithm is always watching. ~</div>
      </div>`;
    body.querySelectorAll('[data-dark]').forEach(btn => {
      btn.addEventListener('click', () => this.buyListing(btn.dataset.dark));
    });
  },

  buyListing(id) {
    const s = State.data;
    const l = DATA.DARK_LISTINGS.find(x => x.id === id);
    if (!l) return;
    if (s.impressions < l.cost) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= l.cost;
    s.impressions += l.reward;
    s.likes += l.reward * 0.3;
    s.authenticity = Math.max(0, s.authenticity + l.auth);
    Juice.chime();
    Juice.toast('Transaction complete. The algorithm is suspicious.');
    if (s.authenticity < 30) {
      Juice.warn();
      Engine.addNotif('warning', 'The algorithm has detected unusual engagement patterns.', 0, '⚠️');
    }
    this.render();
  },
};
