/* ============================================================
   LINK & BUILD — Sponsors (the money loop)
   Clout converts to cash. Cash converts back to clout. The player
   is always converting one into the other, and the narrator frames
   it as "scaling your personal brand."

   Sponsors are dropshipped wellness brands run by "Chad", a grifter
   as broke as the player. They activate at clout thresholds, pay out
   on a schedule, and demand more engagement each cycle. The money is
   real; the brand is a shell.
   ============================================================ */

const Sponsors = {
  // how often (ms) we check for newly-crossed thresholds
  CHECK_INTERVAL: 2000,
  _lastCheck: 0,

  // a sponsor DM from Chad (the founder). Arrives in the unified inbox.
  dm(sponsor, text) {
    const s = State.data;
    s.dms.unshift({
      id: 'spon' + Date.now() + Math.floor(Math.random() * 9999),
      name: sponsor.founder,
      role: sponsor.founderRole,
      emoji: sponsor.icon,
      color: sponsor.color,
      text: text,
      time: Date.now(),
      read: false,
      sponsor: true,
    });
    if (s.dms.length > 200) s.dms.pop();
    Bus.emit('dm:received');
  },

  // activate a sponsor: add to active list, send the intro DM, narrate it
  activate(sponsor) {
    const s = State.data;
    if (s.sponsors.active.includes(sponsor.id)) return;
    s.sponsors.active.push(sponsor.id);
    this.dm(sponsor, sponsor.intro);
    Narrator.say('sponsor_first', 'notif');
    Bus.emit('sponsor:activated', { id: sponsor.id });
  },

  // pay out every active sponsor whose interval has elapsed
  payOut(sponsor) {
    const s = State.data;
    const now = Date.now();
    const last = s.sponsors.lastPayout || now;
    if (now - last < sponsor.interval) return;
    Bank.deposit(sponsor.payout, sponsor.name + ' sponsorship', sponsor.icon);
    Narrator.say('sponsor_paid', 'notif');
    Bus.emit('sponsor:paid', { id: sponsor.id });
  },

  // check thresholds and fire payouts. Called from the engine tick.
  tick() {
    const s = State.data;
    const now = Date.now();
    if (now - this._lastCheck < this.CHECK_INTERVAL) return;
    this._lastCheck = now;

    const clout = Engine.clout();
    for (const sp of DATA.SPONSORS) {
      if (clout >= sp.cloutThreshold && !s.sponsors.active.includes(sp.id)) {
        this.activate(sp);
      }
    }

    // pay out active sponsors on their own schedules
    for (const id of s.sponsors.active) {
      const sp = DATA.SPONSORS.find(x => x.id === id);
      if (sp) this.payOut(sp);
    }

    // occasionally a sponsor demands more engagement
    if (s.sponsors.active.length > 0 && Math.random() < 0.02) {
      const sp = DATA.SPONSORS.find(x => x.id === s.sponsors.active[Math.floor(Math.random() * s.sponsors.active.length)]);
      if (sp) {
        this.dm(sp, sp.demand);
        Narrator.say('sponsor_demand', 'notif');
      }
    }
  },

  // the reveal (Phase 6): Chad admits there was never a company. Fired by
  // the reveal system later; exposed here so the sponsor can confess.
  reveal(sponsorId) {
    const s = State.data;
    const sp = DATA.SPONSORS.find(x => x.id === sponsorId);
    if (!sp || s.sponsors.revealed.includes(sponsorId)) return;
    s.sponsors.revealed.push(sponsorId);
    this.dm(sp, sp.reveal);
  },

  init() {
    // nothing to subscribe to yet — the engine tick drives this system.
  },
};
