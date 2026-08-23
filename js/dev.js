/* ============================================================
   LINK & BUILD — Dev Tool
   Load a full late-game state to preview how the game looks
   when it's "finished". Not a playable save — a showcase.
   Trigger: open index.html?dev=full
   ============================================================ */

const DevState = {
  isFull() {
    const p = new URLSearchParams(window.location.search).get('dev');
    // explicit 'full' = full showcase; default is a fresh game
    return p === 'full';
  },
  isAll() {
    return new URLSearchParams(window.location.search).get('dev') === 'all';
  },
  isReset() {
    return new URLSearchParams(window.location.search).get('dev') === 'reset';
  },

  // Wipe the save entirely and start a fresh game. Debug-only: wipes
  // prestige, achievements, endorsements, challenges — everything.
  resetProgress() {
    State.reset();
    State.save();
    window.location.reload();
  },

  // Unlock everything from the start, but keep it a fresh playable game.
  applyAll() {
    const s = State.data;
    s.dev = true; // showcase state: never persisted to the real save
    s.os.booted = true;
    s.os.unlockedApps = ['linkedin', 'bank'];
    s.os.activeApp = 'linkedin';
    return s;
  },

  applyFull() {
    const s = State.data;
    s.dev = true; // showcase state: never persisted to the real save

    // --- player profile ---
    s.name = 'Thought Leader';
    s.headline = 'Global Synergy Evangelist · 40 hours saved a week';
    s.connections = 12400;
    s.followers = 485000;
    s.impressions = 482000000;
    s.totalImpressions = 1240000000;
    s.likes = 8920000;
    s.influence = 2100000;
    s.authenticity = 38;
    s.hoursSaved = 1240;
    s.effort = 0.2;
    s.premium = true;
    s.verified = true;
    s.viralPosts = 14;
    s.notifCount = 3;

    // --- generators (the full ladder, over-built) ---
    s.generators = {
      pod: 12,
      scheduler: 8,
      outsource: 6,
      agency: 4,
      aifactory: 3,
    };

    // --- upgrades (all owned) ---
    s.upgrades = {
      emoji: 1, question: 1, tag: 1, synergy: 1, humble: 1, viralboost: 1,
    };

    // --- analytics ---
    s.analytics.analyticsLevel = 4;
    s.analytics.postsPublished = 320;
    s.analytics.totalLikes = 8920000;
    s.analytics.totalComments = 124000;
    // history: rising curve over 200 samples
    s.analytics.history = [];
    for (let i = 0; i < 200; i++) {
      const t = Date.now() - (200 - i) * 5000;
      const growth = Math.pow(i / 200, 2.5);
      s.analytics.history.push({
        t,
        impressions: 482000000 * growth,
        likes: 8920000 * growth,
        followers: 485000 * growth,
        ips: 1500 * growth + 10,
      });
    }

    // --- OS: everything unlocked ---
    s.os.booted = true;
    s.os.unlockedApps = ['linkedin', 'bank'];
    s.os.activeApp = 'linkedin';

    // --- notifications (a busy bell) ---
    s.notifications = [
      { id: 'n1', type: 'recruiter', message: '🚨 Recruiter: "Your profile stood out. 10x engineer needed!"', reward: 120, icon: '🚨', createdAt: Date.now() - 60000 },
      { id: 'n2', type: 'view', message: 'A recruiter viewed your profile', reward: 15, icon: '👀', createdAt: Date.now() - 120000 },
      { id: 'n3', type: 'like', message: 'reacted 💡 to your post', reward: 0, icon: '👍', createdAt: Date.now() - 180000 },
      { id: 'n4', type: 'comment', message: 'commented: "Sir, very informative"', reward: 0, icon: '💬', createdAt: Date.now() - 240000 },
      { id: 'n5', type: 'follower', message: 'followed you', reward: 0, icon: '🔔', createdAt: Date.now() - 300000 },
      { id: 'n6', type: 'connection', message: 'accepted your connection request', reward: 0, icon: '🤝', createdAt: Date.now() - 360000 },
    ];

    // --- milestones all seen ---
    s.milestonesSeen = {
      f100: true, f1000: true, c500: true, v1: true, v5: true, m1: true, factory: true, premium: true,
    };

    // --- posts: a full feed of player + NPC content ---
    s.posts = [];
    const now = Date.now();
    const playerPosts = [
      { t: 'I\'m humbled to announce that after years of relentless effort, I\'ve achieved something I never thought possible. To everyone who doubted me: thank you for the fuel. To my mentors: this is for you.', tm: 'humbled', f: 'text', imp: 482000, like: 12400, com: 890, age: 2 },
      { t: 'In the symphony of business, resilience is the crescendo. Embrace the chaos, for within it lies the harmony of growth. 🎶', tm: 'aiquote', f: 'text', imp: 1200000, like: 31000, com: 2400, age: 5 },
      { t: 'Unpopular opinion: most \'thought leadership\' on this app is just recycled LockedIn posts with extra steps. Change my mind.', tm: 'hot', f: 'text', imp: 890000, like: 22000, com: 5100, age: 9 },
      { t: 'I\'m taking a mental health day today. Instead of emails, I\'ll be doing breathwork on a beach. Remember: you can\'t pour from an empty cup. 🌴', tm: 'yacht', f: 'text', imp: 650000, like: 15000, com: 1200, age: 14 },
      { t: '5am: gym. 6am: cold shower. 7am: 3 coffees. 8am: \'synergy call\'. 9am: post about how productive I am. 10am: nap. #dayinthelife', tm: 'daylife', f: 'text', imp: 230000, like: 6800, com: 900, age: 20 },
      { t: 'I asked ChatGPT to write this post about how AI is transforming thought leadership. The results were... paradigm-shifting. 🚀', tm: 'chatgpt', f: 'carousel', imp: 1500000, like: 42000, com: 3100, age: 26 },
    ];
    playerPosts.forEach((p, i) => {
      s.posts.push({
        id: 'devp' + i,
        authorId: 'you',
        content: p.t,
        template: p.tm,
        format: p.f,
        emojis: 3,
        tagged: 2,
        question: 1,
        potential: 1.8,
        rarity: i < 2 ? 'legendary' : i < 4 ? 'epic' : 'rare',
        base: 5000,
        viral: 4,
        decay: 0.9,
        stats: { impressions: p.imp, likes: p.like, comments: p.com, shares: Math.floor(p.imp / 100) },
        publishedAt: now - p.age * 3600000,
        status: 'live',
        isNPC: false,
        authorName: 'Thought Leader',
        authorRole: 'Global Synergy Evangelist',
        authorEmoji: '🧑‍💻',
        authorColor: '#0a66c2',
        comments: [
          { author: 'Sarah Chen', role: 'Marketing Director', emoji: '👩‍💼', color: '#e91e63', text: 'Great post! Really resonates with me.', time: now - 3600000 },
          { author: 'James O\'Brien', role: 'Sales Lead', emoji: '👨‍💼', color: '#3f51b5', text: 'Spot on. Couldn\'t agree more.', time: now - 3500000 },
          { author: 'Priya Sharma', role: 'Product Manager', emoji: '👩‍💻', color: '#9c27b0', text: 'Love the way you think about this.', time: now - 3400000 },
          { author: 'Mike Johnson', role: 'Founder', emoji: '🧔', color: '#00acc1', text: 'Facts. Every word.', time: now - 3300000 },
          { author: 'Emily Rodriguez', role: 'HR Director', emoji: '👩‍🎤', color: '#d32f2f', text: 'This is so well written.', time: now - 3200000 },
          { author: 'David Kim', role: 'Engineer', emoji: '👨‍💻', color: '#00897b', text: 'Solid take, thanks for sharing.', time: now - 3100000 },
          { author: 'Rajesh Kumar', role: 'Engagement Specialist', emoji: '🧑‍💼', color: '#5c6bc0', text: 'Sir, very informative post. Please follow me back.', time: now - 3000000 },
        ],
        _renderedComments: 3,
      });
    });
    // NPC posts
    const npcTemplates = [
      { arch: 'gym', t: 'Discipline is a muscle. Train it daily. I wake up at 4am, I close 3 deals before breakfast, and I don\'t need motivation. 🏋️', imp: 45000, like: 1200, age: 1 },
      { arch: 'humbled', t: 'I\'m humbled to announce that after 3 years of relentless effort, I\'ve been promoted to VP of Synergy. 🙏', imp: 32000, like: 900, age: 3 },
      { arch: 'ai', t: 'The future belongs to those who innovate at the intersection of disruption and synergy. 🚀✨', imp: 28000, like: 700, age: 4 },
      { arch: 'recruiter', t: 'URGENT!! We are hiring 5 Senior Engineers!! 🚨 Fully remote, unlimited PTO, free snacks.', imp: 51000, like: 1500, age: 6 },
      { arch: 'mlm', t: 'Ready to build your own empire?? 💅 I quit my 9-5 and now I make $10k/month working from my phone.', imp: 19000, like: 600, age: 8 },
      { arch: 'burnout', t: 'Unpopular opinion: hustle culture is toxic. I burned out twice before I learned to prioritize my wellbeing. 🌴', imp: 38000, like: 1100, age: 10 },
      { arch: 'thought', t: 'Leaders don\'t create followers. They create more leaders. I wrote a book about it. Buy it. 🧠', imp: 62000, like: 1800, age: 12 },
      { arch: 'greatpost', t: 'Great post! 🙌', imp: 800, like: 40, age: 0.5 },
    ];
    const archMap = {};
    DATA.ARCHETYPES.forEach(a => { archMap[a.id] = a; });
    npcTemplates.forEach((p, i) => {
      const a = archMap[p.arch];
      s.posts.push({
        id: 'devn' + i,
        authorId: p.arch,
        content: p.t,
        template: null,
        format: 'text',
        rarity: 'common',
        base: 500,
        viral: 1.2,
        decay: 0.9,
        stats: { impressions: p.imp, likes: p.like, comments: Math.floor(p.like / 30), shares: Math.floor(p.imp / 500) },
        publishedAt: now - p.age * 3600000,
        status: 'live',
        isNPC: true,
        authorName: a.name,
        authorRole: a.role,
        authorEmoji: a.emoji,
        authorColor: a.color,
        comments: [],
        influence: a.influence,
      });
    });

    // --- tag loop: seed the bucket, rapport, bots, opportunities ---
    // A full bucket of mixed-quality tags so the post maker has plenty to
    // catch and spend. High-quality craft tags + some slop to show the range.
    s.bucket.tags = {
      resilience: 5, vision: 3, craft: 4, honesty: 2, systems: 3, 'deep-work': 2,
      mentorship: 2, story: 3, discipline: 4, growth: 3, mindset: 3, journey: 2,
      momentum: 3, grateful: 2, humbled: 2, wellness: 2,
      synergy: 4, hustle: 3, grindset: 2, 'ai-slop': 3, viral: 2, overnight: 2,
      bossbabe: 2, hiring: 2, 'great-post': 2,
    };
    s.bucket.total = 0;
    for (const k in s.bucket.tags) s.bucket.total += s.bucket.tags[k];
    s.bucket.spent = 120;

    // rapport with a few archetypes — some already followed you back
    s.rapport = {
      gym: { rapport: 7, liked: 4, commented: 2, connected: true, followed: true },
      humbled: { rapport: 4, liked: 3, commented: 1, connected: false, followed: false },
      ai: { rapport: 2, liked: 2, commented: 0, connected: false, followed: false },
      burnout: { rapport: 6, liked: 3, commented: 2, connected: true, followed: true },
    };

    // a couple of opportunities already taken (money already banked)
    s.opportunities.taken = ['op1', 'op2'];

    // idle bots: automate everything except money
    s.bots = { scroll: 2, post: 1, engage: 1, influence: 1 };

    // follow a spread of archetypes so the feed is full of NPC posts
    s.followedAuthors = ['gym', 'humbled', 'ai', 'recruiter', 'mlm', 'burnout', 'thought', 'greatpost'];

    // --- growth-maxxing showcase ---
    s.pillars = { chosen: ['ai', 'corporate', 'marketing'], consistency: 4, bestConsistency: 7 };
    s.deadFollowers = 12000;
    s.streak = { count: 12, lastPostDay: Maxxing ? Maxxing.dayIndex() : Math.floor(Date.now() / 86400000) };
    s.trending = { tagId: 'ai', expiresAt: Date.now() + 90000, used: false };
    // a live race post so the reply-guy bar is visible in the showcase
    const racePost = Engine.makeNPCPost('gym');
    racePost.race = true;
    racePost.raceEndsAt = Date.now() + 8000;
    s.posts.unshift(racePost);
    // a collab offer in the DMs panel
    s.collabs.push({
      id: 'colshow',
      personId: 'c2',
      state: 'offer',
      split: 50,
      time: Date.now(),
    });

    return s;
  },
};
