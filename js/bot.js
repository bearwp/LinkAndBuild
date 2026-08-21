/* ============================================================
   LINK & BUILD — Bot Service (EngageBot™)
   Create your bot, configure it, watch the activity log.
   ============================================================ */

const Bot = {
  render() {
    const s = State.data;
    const body = document.getElementById('bot-body');
    if (!body) return;
    if (!s.os.bot.unlocked) {
      body.innerHTML = `<div class="bot-locked">
        <div style="font-size:40px">🔒</div>
        <div class="bot-locked-title">Bot Service Locked</div>
        <div class="bot-locked-sub">Get a DM from a "growth expert" on LockedIn to unlock this.</div>
      </div>`;
      return;
    }
    if (!s.os.bot.created) {
      body.innerHTML = `
        <div class="bot-setup">
          <div style="font-size:40px">🤖</div>
          <div class="bot-locked-title">Create Your Bot</div>
          <div class="bot-locked-sub">Name your bot. It will do your engagement for you.</div>
          <input id="bot-name-input" class="bot-name-input" placeholder="e.g. EngagementBot3000" maxlength="20">
          <button class="btn btn-primary" id="bot-create-btn" style="margin-top:10px">Create Bot · ${Engine.fmt(500)}</button>
        </div>`;
      const btn = document.getElementById('bot-create-btn');
      if (btn) btn.addEventListener('click', () => {
        const name = document.getElementById('bot-name-input').value.trim() || 'EngagementBot';
        this.createBot(name);
      });
      return;
    }
    // dashboard
    const b = s.os.bot;
    const configs = DATA.BOT_CONFIGS;
    const owned = b.activity.filter(a => a.type === 'acquire').length;
    body.innerHTML = `
      <div class="bot-dash">
        <div class="bot-dash-head">
          <div class="bot-dash-name">🤖 ${b.name}</div>
          <div class="bot-dash-status">● ONLINE</div>
        </div>
        <div class="bot-configs">
          ${configs.map(c => {
            const owned = b.activity.some(a => a.type === 'acquire' && a.config === c.id);
            const affordable = State.data.impressions >= c.cost;
            return `<div class="bot-config ${owned ? 'owned' : ''}">
              <div class="bot-config-icon">${c.icon}</div>
              <div class="bot-config-info">
                <div class="bot-config-name">${c.name}</div>
                <div class="bot-config-desc">${c.desc}</div>
                <div class="bot-config-stats">+${c.prod} imp/s · ${c.auth} auth/s</div>
              </div>
              <button class="btn btn-primary" data-bot-config="${c.id}" ${owned || !affordable ? 'disabled' : ''}>${owned ? 'Owned' : Engine.fmt(c.cost)}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="bot-log">
          <div class="bot-log-title">Activity Log</div>
          <div class="bot-log-entries" id="bot-log-entries">
            ${b.activity.slice(-20).reverse().map(a => `<div class="bot-log-entry">${a.icon} ${a.text} <span class="bot-log-time">${new Date(a.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>`).join('')}
          </div>
        </div>
      </div>`;
    // bind config buttons
    body.querySelectorAll('[data-bot-config]').forEach(btn => {
      btn.addEventListener('click', () => this.acquireConfig(btn.dataset.botConfig));
    });
  },

  createBot(name) {
    const s = State.data;
    const cost = 500;
    if (s.impressions < cost) {
      Juice.toast('Not enough impressions to create a bot.');
      return;
    }
    s.impressions -= cost;
    s.os.bot.created = true;
    s.os.bot.name = name;
    s.os.bot.activity.push({ type: 'create', text: 'Bot ' + name + ' created.', time: Date.now(), icon: '🤖' });
    Juice.chime();
    Juice.milestone('🤖 BOT CREATED', name + ' is online. It will do your engagement.', '');
    this.render();
  },

  acquireConfig(id) {
    const s = State.data;
    const c = DATA.BOT_CONFIGS.find(x => x.id === id);
    if (!c) return;
    if (s.os.bot.activity.some(a => a.type === 'acquire' && a.config === id)) return;
    if (s.impressions < c.cost) {
      Juice.toast('Not enough impressions.');
      return;
    }
    s.impressions -= c.cost;
    s.os.bot.activity.push({ type: 'acquire', config: id, text: c.name + ' acquired.', time: Date.now(), icon: c.icon });
    Juice.chime();
    this.render();

    // after first bot config, a mysterious DM unlocks the dark web
    if (!State.data.os.dark.unlocked) {
      setTimeout(() => {
        Engine.addNotif('dm', 'Unknown: "I saw your bot. Impressive. But if you want REAL engagement, follow this link. You won\'t regret it. Probably."', 0, '🕶️', { type: 'unlock', app: 'dark' });
        State.data.os.dark.unlocked = true;
        OS.unlockApp('dark');
        Juice.toast('🔓 The Marketplace unlocked! Follow the link.');
        Juice.warn();
      }, 3000);
    }
  },

  botIps() {
    const s = State.data;
    if (!s.os.bot.unlocked || !s.os.bot.created) return 0;
    let ips = 0;
    for (const a of s.os.bot.activity) {
      if (a.type === 'acquire') {
        const c = DATA.BOT_CONFIGS.find(x => x.id === a.config);
        if (c) ips += c.prod;
      }
    }
    return ips;
  },

  tick(dt) {
    const s = State.data;
    if (!s.os.bot.unlocked || !s.os.bot.created) return;
    const dtSec = dt / 1000;
    const ips = this.botIps();
    s.impressions += ips * dtSec;
    s.totalImpressions += ips * dtSec;
    // influence climbs with your bot army
    for (const a of s.os.bot.activity) {
      if (a.type === 'acquire') {
        const c = DATA.BOT_CONFIGS.find(x => x.id === a.config);
        if (c) s.authenticity += Math.abs(c.auth) * dtSec;
      }
    }
    if (s.authenticity < 0) s.authenticity = 0;
    if (s.authenticity > 100) s.authenticity = 100;
    // occasional activity log entries
    if (ips > 0 && Math.random() < dtSec * 0.15) {
      const entries = [
        'Liked 12 posts.',
        'Commented "Great post!" on 8 posts.',
        'Followed 25 people.',
        'Unfollowed 25 people.',
        'Replied to a comment with "Thanks for sharing! 🙌"',
        'Your bot is working hard. You are not.',
      ];
      s.os.bot.activity.push({ type: 'log', text: entries[Math.floor(Math.random() * entries.length)], time: Date.now(), icon: '🤖' });
      if (s.os.bot.activity.length > 40) s.os.bot.activity.shift();
    }
  },
};
