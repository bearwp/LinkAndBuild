/* ============================================================
   LINK & BUILD — Bank Account
   A measly balance and a ledger of pathetic transactions.
   The only number in the game that is actually real.
   ============================================================ */

const Bank = {
  // the one number the scale slider can't inflate
  balance() {
    return State.data.os.bank.balance;
  },

  // append a transaction and update the balance. This is the single seam
  // through which real money enters and leaves the game.
  deposit(amount, label, icon) {
    const s = State.data;
    const b = s.os.bank;
    b.balance += amount;
    b.transactions.push({
      id: 'tx' + Date.now() + Math.floor(Math.random() * 9999),
      label: label,
      amount: amount,
      icon: icon || '💵',
      time: Date.now(),
    });
    if (b.transactions.length > 100) b.transactions.shift();
    Bus.emit('bank:changed');
    if (s.os.activeApp === 'bank') this.render();
  },

  // cash buys clout: the other half of the loop. Real money, fake reach.
  buyClout(id) {
    const s = State.data;
    const pkg = DATA.CLOUT_PACKAGES.find(p => p.id === id);
    if (!pkg) return;
    if (s.os.bank.balance < pkg.cost) {
      Juice.toast('Insufficient funds. The bank is "concerned".');
      return;
    }
    this.deposit(-pkg.cost, pkg.label, pkg.icon);
    s.impressions += pkg.impressions * Engine.scale();
    s.followers += pkg.followers * Engine.scale();
    s.authenticity = Math.max(0, s.authenticity - pkg.auth);
    Juice.chime();
    Juice.toast('Purchased ' + pkg.name + '. Your clout just grew.');
    Bus.emit('clout:bought', { id });
  },

  render() {
    const s = State.data;
    const body = document.getElementById('bank-body');
    if (!body) return;
    const b = s.os.bank;
    // seed transactions on first view
    if (!b.transactions || b.transactions.length === 0) {
      b.transactions = DATA.BANK_SEED.map((t, i) => ({
        id: 'tx' + i,
        label: t.label,
        amount: t.amount,
        icon: t.icon,
        time: Date.now() - (i + 1) * 86400000,
      }));
    }
    const balance = b.balance.toFixed(2);
    const balanceClass = b.balance < 0 ? 'neg' : 'pos';
    const activeSponsors = DATA.SPONSORS.filter(sp => s.sponsors.active.includes(sp.id));
    body.innerHTML = `
      <div class="bank-app">
        <div class="bank-header">
          <div class="bank-logo">🏦</div>
          <div>
            <div class="bank-name">First National Bank of Grind</div>
            <div class="bank-tag">Checking ·••• 0420</div>
          </div>
        </div>
        <div class="bank-balance-card">
          <div class="bank-balance-label">Available Balance</div>
          <div class="bank-balance ${balanceClass}">$${balance}</div>
          <div class="bank-balance-sub">${b.balance < 0 ? 'Overdrawn. The bank is "concerned".' : 'Enough for one (1) coffee.'}</div>
        </div>
        ${activeSponsors.length > 0 ? `
        <div class="bank-sponsors">
          <div class="bank-tx-title">Active Sponsors</div>
          ${activeSponsors.map(sp => `
            <div class="bank-sponsor">
              <div class="bank-tx-icon">${sp.icon}</div>
              <div class="bank-tx-info">
                <div class="bank-tx-label">${sp.name}</div>
                <div class="bank-tx-time">$${sp.payout.toFixed(2)} / cycle · ${sp.demand}</div>
              </div>
            </div>`).join('')}
        </div>` : ''}
        <div class="bank-spend">
          <div class="bank-tx-title">Spend It On Clout</div>
          <div class="bank-tx-sub">Real money, fake reach. The loop closes.</div>
          ${DATA.CLOUT_PACKAGES.map(p => {
            const affordable = b.balance >= p.cost;
            return `<div class="bank-spend-item">
              <div class="bank-tx-icon">${p.icon}</div>
              <div class="bank-tx-info">
                <div class="bank-tx-label">${p.name}</div>
                <div class="bank-tx-time">+${Engine.fmt(p.impressions)} impressions · +${Engine.fmt(p.followers)} followers</div>
              </div>
              <button class="btn btn-primary bank-buy" data-clout="${p.id}" ${affordable ? '' : 'disabled'}>$${p.cost.toFixed(2)}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="bank-tx">
          <div class="bank-tx-title">Recent Transactions</div>
          <div class="bank-tx-list">
            ${b.transactions.slice().reverse().map(t => {
              const amt = t.amount.toFixed(2);
              const sign = t.amount >= 0 ? '+' : '';
              return `<div class="bank-tx-item">
                <div class="bank-tx-icon">${t.icon}</div>
                <div class="bank-tx-info">
                  <div class="bank-tx-label">${t.label}</div>
                  <div class="bank-tx-time">${new Date(t.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                </div>
                <div class="bank-tx-amt ${t.amount >= 0 ? 'pos' : 'neg'}">${sign}$${amt}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="bank-footer">This account is not FDIC insured. Neither is your career.</div>
      </div>`;
    body.querySelectorAll('[data-clout]').forEach(btn => {
      btn.addEventListener('click', () => this.buyClout(btn.dataset.clout));
    });
  },
};
