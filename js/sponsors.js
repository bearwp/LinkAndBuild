/* ============================================================
   LINK & BUILD — Sponsors (the one-shot brand deal)
   Clout converts to one real deposit. The bank is the game's
   quietest, saddest number — it starts at $12.47 and is the only
   number that is actually real. A single brand deal lands once the
   player is big enough, pays a one-time check, and then Chad
   confesses (during the reveal) that there was never a company.

   The whole point of the money is that there is very little of it,
   and it only ever points back at the account that made it.
   ============================================================ */

const Sponsors = {
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
  },

  // the one-shot deal: activate the first sponsor once clout crosses its
  // threshold, pay a single real check, then stop. No recurring payouts —
  // the money is a moment, not a machine.
  activate(sponsor) {
    const s = State.data;
    if (s.sponsors.active.includes(sponsor.id)) return;
    s.sponsors.active.push(sponsor.id);
    this.dm(sponsor, sponsor.intro);
    Bank.deposit(sponsor.payout, sponsor.name + ' brand deal', sponsor.icon);
    Narrator.say('sponsor_first', 'notif');
    Bus.emit('sponsor:activated', { id: sponsor.id });
  },

  // one-shot check: fire the first (cheapest) sponsor when the player is big
  // enough, exactly once. Kept as a tick so the engine wiring is unchanged.
  tick() {
    const s = State.data;
    if (s.sponsors.active.length > 0) return;
    const clout = Engine.clout();
    const first = DATA.SPONSORS.find(sp => clout >= sp.cloutThreshold);
    if (first) this.activate(first);
  },

  // the reveal: Chad admits there was never a company.
  reveal(sponsorId) {
    const s = State.data;
    const sp = DATA.SPONSORS.find(x => x.id === sponsorId);
    if (!sp || s.sponsors.revealed.includes(sponsorId)) return;
    s.sponsors.revealed.push(sponsorId);
    this.dm(sp, sp.reveal);
  },

  init() {
    // nothing to subscribe to — the engine tick drives this system.
  },
};
