/* ============================================================
   LINK & BUILD — Endorsements (achievements, re-skinned)
   Achievements are rendered as LinkedIn "Endorsements": a permanent
   profile record of every time the player chose to debase themselves.

   The joke is the double meaning. An "endorsement" on LinkedIn is a
   stranger vouching for a skill you don't have. An "achievement" here
   is the same thing — a badge for a moment you chose to perform for
   an empty room. They are the same object. The game calls them both.

   Secret achievements ("The One Real Person", "Dead Internet",
   "The Rent Is Due") are the vehicle for the scare posts and the
   reveal. They are hidden until earned, and earning them is the game
   quietly recording that you went looking.
   ============================================================ */

const Endorsements = {
  /* ---------- skills (the "endorsements" half) ---------- */
  // grant a skill endorsement from a random stranger. A bot clicking a button
  // for a skill that doesn't exist, framed as validation.
  grantSkill(skillId) {
    const s = State.data;
    const skill = DATA.SKILLS.find(x => x.id === skillId);
    if (!skill) return;
    const endorser = Engine.pick(DATA.ENDORSERS);
    if (!s.achievements.endorsements[skillId]) s.achievements.endorsements[skillId] = [];
    s.achievements.endorsements[skillId].push({
      name: endorser.name,
      role: endorser.role,
      emoji: endorser.emoji,
      color: endorser.color,
      time: Date.now(),
    });
    // narrate the first endorsement of each skill
    if (s.achievements.endorsements[skillId].length === 1) {
      Narrator.say('endorsement', 'notif');
    }
    Engine.addNotif('connection', endorser.name + ' endorsed you for ' + skill.label, 0, '✅');
    Bus.emit('endorsement:granted', { skillId });
  },

  // a skill endorsement trickles in as the player grows, so the profile
  // slowly fills with meaningless validation.
  maybeSkill() {
    const s = State.data;
    const skills = DATA.SKILLS;
    const owned = Object.keys(s.achievements.endorsements).length;
    // the more followers, the more skills strangers vouch for you
    const target = Math.min(skills.length, Math.floor(s.followers / 200));
    if (owned < target && Math.random() < 0.1) {
      const pool = skills.filter(x => !s.achievements.endorsements[x.id] || s.achievements.endorsements[x.id].length === 0);
      if (pool.length) this.grantSkill(Engine.pick(pool).id);
    }
  },

  /* ---------- achievements (the "record" half) ---------- */
  // stamp a badge the first time its condition is met. Secret achievements
  // fire the narrator's hidden-register line and the scare-post machinery.
  unlock(id) {
    const s = State.data;
    const a = DATA.ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    if (s.achievements.earned.includes(id)) return;
    s.achievements.earned.push(id);

    if (a.secret) {
      Narrator.say('secret_achievement', 'dm');
      Juice.milestone('🔒 SECRET ACHIEVEMENT', a.name + ' — ' + a.desc, 'viral');
    } else {
      Narrator.say('achievement', 'notif');
      Juice.milestone(a.icon + ' ACHIEVEMENT', a.name, '');
    }
    Juice.chime();
    Bus.emit('achievement:unlocked', { id });
    State.save();
  },

  // the one real person: a one-time feed event. A commenter says something
  // genuinely human, then is gone. The player scrolls past and can't find
  // them again. This is the whole tragedy in one beat.
  maybeOneRealPerson() {
    const s = State.data;
    if (s.achievements.oneRealPersonSeen) return;
    // fires late — once the player is deep enough to have been trained to scroll
    if (s.totalImpressions < 5e6 || Math.random() > 0.02) return;
    s.achievements.oneRealPersonSeen = true;

    const post = Engine.makeNPCPost();
    post.authorName = 'No One';
    post.authorRole = 'Not a recruiter · Not a thought leader';
    post.authorEmoji = '🕯️';
    post.authorColor = '#888';
    post.oneReal = true;
    post.content = "I don't know why I'm still on this app. I guess I just wanted someone to see me.";
    s.posts.unshift(post);
    Engine.trimPosts();

    this.unlock('one-real-person');
    Bus.emit('one-real-person:seen', post);
  },

  /* ---------- event handlers ---------- */
  init() {
    Bus.on('post:published', (post) => {
      if (State.data.analytics.postsPublished === 1) this.unlock('first-post');
      if (post.rarity === 'legendary' || post.rarity === 'epic') this.unlock('viral-1');
    });

    Bus.on('generator:bought', (e) => {
      if (e && e.id === 'aifactory') this.unlock('factory');
    });

    Bus.on('sponsor:activated', () => {
      if (State.data.sponsors.active.length === 1) this.unlock('first-sponsor');
    });

    Bus.on('premium:bought', () => this.unlock('premium'));

    Bus.on('detection:shadowban', () => this.unlock('shadowban'));

    Bus.on('milestone:reached', (e) => {
      if (!e || !e.id) return;
      if (e.id === 'f1000') this.unlock('followers-1000');
      else if (e.id === 'm1') this.unlock('impressions-1m');
    });

    Bus.on('prestige:reset', () => this.unlock('reset-1'));

    // the reveal (Phase 6) fires these; wired here so the secrets are ready
    Bus.on('reveal:triggered', () => this.unlock('dead-internet'));
    Bus.on('reveal:posted-after', () => this.unlock('rent-due'));
  },
};


/* ============================================================
   LINK & BUILD — Challenges (roguelite modifiers)
   Selected at the start of a run, each challenge changes a rule and
   pays a permanent reward. Each challenge is a new way to debase
   yourself — and the reward is always more of the same number.
   ============================================================ */

const Challenges = {
  /* ---------- selection ---------- */
  // pick a random challenge not yet completed (or any, if all done).
  select() {
    const s = State.data;
    const pool = DATA.CHALLENGES.filter(c => !s.challenges.completed[c.id]);
    const list = pool.length ? pool : DATA.CHALLENGES;
    const c = Engine.pick(list);
    s.challenges.active = { id: c.id, startedAt: Date.now() };
    s.challenges.stats = defaultState().challenges.stats;
    Narrator.say('challenge_started', 'dm');
    Bus.emit('challenge:started', { id: c.id });
    return c;
  },

  active() {
    const s = State.data;
    if (!s.challenges.active) return null;
    return DATA.CHALLENGES.find(c => c.id === s.challenges.active.id) || null;
  },

  /* ---------- rewards (permanent, summed across completed challenges) ---------- */
  // sum a given reward effect over all completed challenges.
  reward(type) {
    const s = State.data;
    let total = 0;
    for (const id of Object.keys(s.challenges.completed)) {
      const c = DATA.CHALLENGES.find(x => x.id === id);
      if (c && c.reward.type === type) total += c.reward.value;
    }
    return total;
  },

  // permanent authenticity floor (never below this %)
  authFloor() {
    return this.reward('authFloor');
  },

  /* ---------- completion ---------- */
  complete(c) {
    const s = State.data;
    if (s.challenges.completed[c.id]) return;
    s.challenges.completed[c.id] = true;
    s.challenges.active = null;
    Narrator.say('challenge_complete', 'dm');
    Juice.milestone('🏆 CHALLENGE COMPLETE', c.name + ' — ' + c.rewardDesc, 'viral');
    Juice.confetti(window.innerWidth / 2, window.innerHeight / 3, 80);
    Bus.emit('challenge:completed', { id: c.id });
    State.save();
  },

  /* ---------- tracking (called from the engine tick) ---------- */
  tick() {
    const s = State.data;
    const c = this.active();
    if (!c) return;
    const st = s.challenges.stats;

    switch (c.check) {
      case 'auth':
        // reach 500 followers with authenticity never below 90 (track the floor)
        if (s.authenticity < 90) st.authLow = true;
        if (s.followers >= 500 && !st.authLow) this.complete(c);
        break;
      case 'silent':
        if (st.silentPosts >= 10) this.complete(c);
        break;
      case 'purist':
        if (s.generators['aifactory'] && !s.premium) this.complete(c);
        break;
      case 'ghost':
        if (s.impressions >= 100000 && s.followers < 50) this.complete(c);
        break;
      case 'survivor':
        if (st.survivedShadowban) this.complete(c);
        break;
    }
  },

  init() {
    // mark surviving a shadowban cycle for "The Survivor"
    Bus.on('detection:restored', () => {
      if (State.data.challenges.stats) State.data.challenges.stats.survivedShadowban = true;
    });
  },
};
