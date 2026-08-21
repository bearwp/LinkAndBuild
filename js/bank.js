/* ============================================================
   LINK & BUILD — Bank Account
   A measly balance and a ledger of pathetic transactions.
   ============================================================ */

const Bank = {
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
  },
};
