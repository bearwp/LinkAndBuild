/* ============================================================
   LINK & BUILD — Telegram App
   Engagement pods: join pods, watch the chat stream, pod production.
   ============================================================ */

const Telegram = {
  activePod: null,

  render() {
    const s = State.data;
    const os = s.os.telegram;
    if (!os.unlocked) {
      document.getElementById('tg-chats').innerHTML = '<div style="padding:12px;font-size:12px;color:#666">Locked. A LockedIn DM will unlock this.</div>';
      document.getElementById('tg-messages').innerHTML = '';
      return;
    }
    this.renderChats();
    this.renderMessages();
  },

  renderChats() {
    const s = State.data;
    const os = s.os.telegram;
    const list = document.getElementById('tg-chats');
    list.innerHTML = '';

    // Growth Expert direct chat (the DM that unlocked Telegram)
    const expert = {
      id: 'expert', name: 'Growth Expert', icon: '📈',
      desc: 'The person who DMed you on LockedIn',
    };
    const expertEl = document.createElement('div');
    expertEl.className = 'tg-chat' + (this.activePod === 'expert' ? ' joined' : '');
    expertEl.innerHTML = `
      <div class="tg-c-icon">${expert.icon}</div>
      <div style="flex:1">
        <div class="tg-c-name">${expert.name}</div>
        <div class="tg-c-desc">${expert.desc}</div>
      </div>
      <button class="btn tg-c-btn" style="border:1px solid #2aabee;color:#2aabee;font-size:12px;padding:4px 10px">Open</button>
    `;
    expertEl.querySelector('.tg-c-btn').addEventListener('click', () => {
      this.activePod = 'expert';
      this.renderMessages();
    });
    list.appendChild(expertEl);

    for (const pod of DATA.PODS) {
      const joined = os.joinedPods.includes(pod.id);
      const el = document.createElement('div');
      el.className = 'tg-chat' + (joined ? ' joined' : '');
      el.innerHTML = `
        <div class="tg-c-icon">${pod.icon}</div>
        <div style="flex:1">
          <div class="tg-c-name">${pod.name}</div>
          <div class="tg-c-desc">${pod.members} members · ${pod.desc}</div>
        </div>
        ${joined
          ? `<button class="btn tg-c-btn" style="border:1px solid #2aabee;color:#2aabee;font-size:12px;padding:4px 10px">Open</button>`
          : `<button class="btn btn-primary tg-c-btn" data-join="${pod.id}" style="font-size:12px;padding:4px 10px">Join · ${Engine.fmt(pod.cost)}</button>`}
      `;
      const joinBtn = el.querySelector('[data-join]');
      if (joinBtn) joinBtn.addEventListener('click', () => this.joinPod(pod.id));
      const openBtn = el.querySelector('.tg-c-btn:not([data-join])');
      if (openBtn) openBtn.addEventListener('click', () => {
        this.activePod = pod.id;
        this.renderMessages();
      });
      list.appendChild(el);
    }
  },

  joinPod(id) {
    const s = State.data;
    const pod = DATA.PODS.find(p => p.id === id);
    if (!pod) return;
    if (s.os.telegram.joinedPods.includes(id)) return;
    if (s.impressions < pod.cost) {
      Juice.toast('Not enough impressions to join ' + pod.name + '.');
      return;
    }
    s.impressions -= pod.cost;
    s.os.telegram.joinedPods.push(id);
    // welcome messages
    const msgs = [
      { from: pod.name, text: 'Welcome to ' + pod.name + '! 🙏', time: Date.now(), podId: id },
      { from: pod.name, text: pod.messages[0], time: Date.now(), podId: id },
    ];
    s.os.telegram.messages.push(...msgs);
    this.activePod = id;
    this.render();
    Juice.chime();
    Juice.toast('Joined ' + pod.name + '. The pod will boost you.');

    // after joining a pod, the expert DMs about the bot service
    if (!s.os.bot.unlocked) {
      setTimeout(() => {
        s.os.telegram.messages.push({ from: 'them', text: 'Psst. You\'re doing well. But you\'re still doing it by hand. I know a service that automates all of this. It\'s called EngageBot™.', time: Date.now(), podId: 'expert' });
        this.render();
        Engine.addNotif('dm', 'Growth Expert: "I know a service that automates all of this. EngageBot™. Want in?"', 0, '🤖', { type: 'unlock', app: 'bot' });
        s.os.bot.unlocked = true;
        OS.unlockApp('bot');
        Juice.toast('🔓 Bot Service unlocked! Check the DM.');
      }, 3000);
    }
  },

  renderMessages() {
    const s = State.data;
    const os = s.os.telegram;
    const head = document.getElementById('tg-chat-head');
    const msgs = document.getElementById('tg-messages');
    const input = document.getElementById('tg-text');
    const send = document.getElementById('tg-send');

    // Growth Expert chat
    if (this.activePod === 'expert') {
      head.textContent = '📈 Growth Expert';
      input.disabled = false;
      send.disabled = false;
      const expertMsgs = os.messages.filter(m => m.podId === 'expert');
      msgs.innerHTML = '';
      for (const m of expertMsgs.slice(-50)) {
        const el = document.createElement('div');
        el.className = 'tg-msg' + (m.from === 'me' ? ' me' : '');
        const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        el.innerHTML = m.text + `<span class="tg-time">${m.from === 'me' ? 'You' : 'Growth Expert'} · ${time}</span>`;
        msgs.appendChild(el);
      }
      msgs.scrollTop = msgs.scrollHeight;
      return;
    }

    const pod = DATA.PODS.find(p => p.id === this.activePod);
    if (!pod) {
      head.textContent = 'Select a chat';
      msgs.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;margin-top:40px">Open a chat to start.</div>';
      input.disabled = true;
      send.disabled = true;
      return;
    }
    head.textContent = pod.icon + ' ' + pod.name;
    input.disabled = false;
    send.disabled = false;
    const podMsgs = os.messages.filter(m => m.podId === pod.id);
    msgs.innerHTML = '';
    for (const m of podMsgs.slice(-50)) {
      const el = document.createElement('div');
      el.className = 'tg-msg' + (m.from === 'me' ? ' me' : '');
      const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      el.innerHTML = m.text + `<span class="tg-time">${m.from === 'me' ? 'You' : pod.name} · ${time}</span>`;
      msgs.appendChild(el);
    }
    msgs.scrollTop = msgs.scrollHeight;
  },

  sendMessage(text) {
    const s = State.data;
    // expert chat
    if (this.activePod === 'expert') {
      if (!text.trim()) return;
      s.os.telegram.messages.push({ from: 'me', text: text.trim(), time: Date.now(), podId: 'expert' });
      this.renderMessages();
      setTimeout(() => {
        const replies = [
          'Exactly. Join a pod below and I\'ll make you a thought leader.',
          'The pods are where the magic happens. Join one. Trust me.',
          'I get a cut of every pod you join. That\'s why I\'m helping you. Anyway, join a pod.',
          'You\'re going to be huge. I can feel it. Join a pod.',
        ];
        s.os.telegram.messages.push({ from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: Date.now(), podId: 'expert' });
        this.renderMessages();
        Juice.pop();
      }, 800);
      return;
    }

    const pod = DATA.PODS.find(p => p.id === this.activePod);
    if (!pod || !text.trim()) return;
    s.os.telegram.messages.push({ from: 'me', text: text.trim(), time: Date.now(), podId: pod.id });
    this.renderMessages();
    // pod replies with a boost
    setTimeout(() => {
      const replies = [
        'Boosted! 🙏 Great content.',
        'Liked and commented. We got you.',
        'The pod has spoken. You will trend.',
        'Excellent post. The algorithm will notice.',
      ];
      s.os.telegram.messages.push({ from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: Date.now(), podId: pod.id });
      // pod boost: impressions
      const boost = (10 + pod.prod * 5) * Engine.scale();
      s.impressions += boost;
      s.likes += 2 * Engine.scale();
      this.renderMessages();
      Juice.pop();
      Juice.particles(window.innerWidth / 2, 200, '+' + Engine.fmt(boost) + ' imp', '#2aabee');
    }, 800);
  },

  /* ---------- pod production (idle income) ---------- */
  podIps() {
    const s = State.data;
    let ips = 0;
    for (const id of s.os.telegram.joinedPods) {
      const pod = DATA.PODS.find(p => p.id === id);
      if (pod) ips += pod.prod;
    }
    return ips;
  },

  tick(dt) {
    const s = State.data;
    const os = s.os.telegram;
    if (!os.unlocked) return;
    const dtSec = dt / 1000;
    const ips = this.podIps() * Engine.scale();
    s.impressions += ips * dtSec;
    s.totalImpressions += ips * dtSec;
    // influence climbs with your pods
    for (const id of os.joinedPods) {
      const pod = DATA.PODS.find(p => p.id === id);
      if (pod) s.authenticity += Math.abs(pod.auth) * dtSec;
    }
    if (s.authenticity < 0) s.authenticity = 0;
    if (s.authenticity > 100) s.authenticity = 100;
    // occasional pod chat messages
    if (os.joinedPods.length && Math.random() < dtSec * 0.2 * Engine.scale()) {
      const pod = DATA.PODS.find(p => p.id === os.joinedPods[Math.floor(Math.random() * os.joinedPods.length)]);
      if (pod) {
        os.messages.push({ from: 'them', text: pod.messages[Math.floor(Math.random() * pod.messages.length)], time: Date.now(), podId: pod.id });
        if (os.messages.length > 200) os.messages.shift();
      }
    }
  },
};
