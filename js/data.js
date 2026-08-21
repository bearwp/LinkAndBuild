/* ============================================================
   LINK & BUILD — Game Data
   Archetypes, post templates, generators, upgrades, content.
   ============================================================ */

const DATA = {};

/* ---------- NPC Archetypes ---------- */
DATA.ARCHETYPES = [
  {
    id: 'gym', name: 'Marcus "Discipline" Reed', role: 'CEO · Gym Bro Holdings', emoji: '🏋️',
    color: '#5c6bc0',
    posts: [
      "Discipline is a muscle. Train it daily. I wake up at 4am, I close 3 deals before breakfast, and I don't need motivation. Motivation is for amateurs. Consistency is for CEOs. 🏋️",
      "Your network is your net worth. I've said it before and I'll say it again. If you're not in the gym at 5am, you're not in the boardroom at 9. 💪",
      "Nobody cares about your excuses. They care about your results. I don't do 'busy'. I do 'done'. #grindset",
      "I just closed my 47th deal this quarter. Sleep is for the weak. The market doesn't rest, and neither do I. 🚀",
    ],
    comments: ["Great post! 💪", "This is the way.", "Real talk. 🔥"],
    weight: 3, influence: 1200,
  },
  {
    id: 'humbled', name: 'Brad Thompson', role: 'VP of Synergy · BigCorp', emoji: '🙏',
    color: '#26a69a',
    posts: [
      "I'm humbled to announce that after 3 years of relentless effort, I've been promoted to VP of Synergy. To everyone who doubted me: thank you for the fuel. To my mentor: this is for you. 🙏",
      "I'm humbled to share that my team just shipped the most impactful quarter in company history. None of this would be possible without the amazing people I work with. #humbled #blessed",
      "I'm humbled to announce I've been named to the 'Top 40 Under 40' list. I never set out for recognition, only to add value. But wow. Just wow. 🙏",
      "After much reflection, I'm humbled to announce I'm leaving BigCorp to pursue my true passion: teaching other people how to get promoted. DM me for my course.",
    ],
    comments: ["Congratulations! 🎉", "Well deserved!", "So proud of you!"],
    weight: 3, influence: 800,
  },
  {
    id: 'ai', name: 'Synergy Bot 9000', role: 'AI Thought Leader', emoji: '🤖',
    color: '#9e9e9e',
    posts: [
      "In the symphony of business, resilience is the crescendo. 🎶 Embrace the chaos, for within it lies the harmony of growth. #ThoughtLeadership",
      "The future belongs to those who innovate at the intersection of disruption and synergy. Let's redefine the paradigm of possibility. 🚀✨",
      "Success is not a destination, it's a journey of continuous optimization. Optimize your mindset, optimize your network, optimize your soul. 🧠",
      "Just asked ChatGPT to write this post about how AI is transforming thought leadership. The results? Paradigm-shifting. #AI #FutureOfWork",
    ],
    comments: ["Great post! 🙌", "Very insightful.", "This! 🙌"],
    weight: 3, influence: 600,
  },
  {
    id: 'recruiter', name: 'Priya Patel', role: 'Talent Acquisition · Hiring!!', emoji: '🚨',
    color: '#ef5350',
    posts: [
      "URGENT!! We are hiring 5 Senior Engineers!! 🚨 Fully remote, unlimited PTO, free snacks. If you know someone, tag them! We need to fill these roles YESTERDAY. #hiring #remote",
      "HIRING ALERT 🚨 My client is looking for a 'Growth Hacker' with 10+ years experience. Pay: competitive. Culture: like a family. DM me for details!!",
      "Why is no one applying to our 'Chief Synergy Officer' role?? We offer a ping pong table and kombucha on tap. Gen Z, I am disappointed. #hiring",
      "Recruiters are the backbone of the economy. We connect dreams to desks. Tag a recruiter who changed your life! 🚨",
    ],
    comments: ["Interested!", "DM sent!", "Great opportunity!"],
    weight: 3, influence: 400,
  },
  {
    id: 'mlm', name: 'Karen "BossBabe" Mitchell', role: 'CEO of My Own Life · MLM Queen', emoji: '💅',
    color: '#ec4070',
    posts: [
      "Ready to build your own empire?? 💅 I quit my 9-5 and now I make $10k/month working from my phone. The system does the work, YOU just share it. DM me 'YES' to learn how!",
      "My downline income just hit $15,000 this month!! 💅 All from from my 'lifestyle business'. If you're tired of trading time for money, this is your sign. Comment 'MORE' below!",
      "They said I couldn't. I said watch me. 💅 Now I'm a CEO, a mother, and a motivational speaker. You can have it all, but you have to WANT it. #bossbabe",
      "Not a pyramid. A triangle. 💅 Stability at the top. DM me for my free webinar on financial freedom!!",
    ],
    comments: ["Yes!! 🙌", "I'm interested!", "Tell me more!"],
    weight: 2, influence: 500,
  },
  {
    id: 'burnout', name: 'Sofia Reyes', role: 'Founder · Zen Startup', emoji: '🌴',
    color: '#66a4a4',
    posts: [
      "Unpopular opinion: hustle culture is toxic. I burned out twice before I learned to prioritize my wellbeing. Now I meditate 2 hours a day... from my yacht in the Maldives. 🌴",
      "I'm taking a mental health day today. Instead of emails, I'll be doing breathwork on a beach in Bali. Remember: you can't pour from an empty cup. 🌴",
      "Burnout is real, and I'm not afraid to say it. That's why I built a startup that lets you work 4 hours a week. Want early access? DM me. 🌴",
      "Just left a $1M exit to 'find myself'. Best decision I ever made. Now I mentor founders on mindfulness. My calendar is full until 2030. 🌴",
    ],
    comments: ["Needed this. 🙏", "So real.", "Thank you for sharing."],
    weight: 2, influence: 700,
  },
  {
    id: 'greatpost', name: 'Comment King', role: 'Engagement Enthusiast', emoji: '👑',
    color: '#ffb300',
    posts: [
      "Great post! 🙌",
      "This! 🙌",
      "Very informative!",
      "Thanks for sharing!",
      "",
      "Absolutely! 👏",
    ],
    comments: ["Great post! 🙌", "This! 🙌", "Very informative!"],
    weight: 2, influence: 100,
  },
  {
    id: 'thought', name: 'Dr. Visionary', role: 'Global Thought Leader · Keynote Speaker', emoji: '🧠',
    color: '#7e57c2',
    posts: [
      "I've spoken at 300 conferences on the future of work. The future of work is... you. Yes, you reading this. Let that sink in. 🧠",
      "Leaders don't create followers. They create more leaders. I wrote a book about it. It's on my profile. Buy it. 🧠",
      "The most underrated skill in 2026? Deep work. I have a 47-step framework for it. Comment 'FRAMEWORK' and I'll DM it to you. 🧠",
      "I asked my AI to summarize my entire career. It said: 'visionary'. I cried. Then I posted it. 🧠",
    ],
    comments: ["Profound. 🙏", "This changed my life.", "Framework please!"],
    weight: 2, influence: 1500,
  },
];

/* ---------- Post Templates ---------- */
DATA.TEMPLATES = [
  {
    id: 'humbled', name: 'Humbled to Announce', text: "I'm humbled to announce that after years of relentless effort, I've achieved something I never thought possible. To everyone who doubted me: thank you for the fuel. To my mentors: this is for you.",
    potential: 1.6, auth: -6, weight: 1,
  },
  {
    id: 'hot', name: 'Hot Take', text: "Unpopular opinion: most 'thought leadership' on this app is just recycled LinkedIn posts with extra steps. Change my mind.",
    potential: 1.5, auth: -4, weight: 1,
  },
  {
    id: 'yacht', name: 'Mental Health From a Yacht', text: "I'm taking a mental health day today. Instead of emails, I'll be doing breathwork on a beach. Remember: you can't pour from an empty cup. 🌴",
    potential: 1.7, auth: -8, weight: 1,
  },
  {
    id: 'aiquote', name: 'AI Motivational Quote', text: "In the symphony of business, resilience is the crescendo. Embrace the chaos, for within it lies the harmony of growth. 🎶",
    potential: 1.8, auth: -10, weight: 1,
  },
  {
    id: 'daylife', name: 'Day in the Life', text: "5am: gym. 6am: cold shower. 7am: 3 coffees. 8am: 'synergy call'. 9am: post about how productive I am. 10am: nap. #dayinthelife",
    potential: 1.4, auth: -3, weight: 1,
  },
  {
    id: 'chatgpt', name: 'I Asked ChatGPT…', text: "I asked ChatGPT to write this post about how AI is transforming thought leadership. The results were... paradigm-shifting. 🚀",
    potential: 1.6, auth: -7, weight: 1,
  },
  {
    id: 'free', name: 'Free Write (Authentic)', text: "",
    potential: 1.0, auth: +8, weight: 1,
  },
];

/* ---------- Comment phrases (click power / minigame) ---------- */
DATA.COMMENTS = [
  { text: 'Great post! 🙌', likes: 2, auth: 0, safe: true },
  { text: 'This! 🙌', likes: 3, auth: -1, safe: true },
  { text: 'Sir, very informative', likes: 4, auth: -3, safe: false },
  { text: 'DM me for more info 💼', likes: 8, auth: -5, safe: false },
  { text: 'Very insightful!', likes: 2, auth: 0, safe: true },
  { text: 'Absolutely! 👏', likes: 3, auth: 0, safe: true },
];

/* ---------- Generators (the automation ladder) ---------- */
DATA.GENERATORS = [
  {
    id: 'pod', name: 'Engagement Pod', tier: 1, icon: '👥',
    desc: 'Join a community of like-minded professionals who agree to boost each other in the critical first hour.',
    cost: 50, auth: -0.1, prod: 0.8,
    flavor: '"We scratch each other\'s backs. Professionally."',
  },
  {
    id: 'scheduler', name: 'Scheduling & Analytics', tier: 2, icon: '📅',
    desc: 'Maximize your reach with data-driven posting. Auto-posts at the optimal time. Shows you the curves.',
    cost: 250, auth: -0.15, prod: 2.5,
    flavor: '"Post at 9am EST. The data demands it."',
  },
  {
    id: 'outsource', name: 'Outsourced Engagement', tier: 3, icon: '🌏',
    desc: 'Scale your engagement affordably. Cheap likes and comments from a global workforce with broken English.',
    cost: 1200, auth: -0.5, prod: 7,
    flavor: '"Sir, very informative. Please follow me back."',
  },
  {
    id: 'agency', name: 'Growth Agency', tier: 4, icon: '🏢',
    desc: 'Enterprise-grade personal branding. Networks of fake accounts, proxy rotation, follow/unfollow bots, multiple clients.',
    cost: 6000, auth: -1.2, prod: 18,
    flavor: '"We run 40,000 accounts. Yours is one of them."',
  },
  {
    id: 'aifactory', name: 'AI Factory', tier: 5, icon: '🏭',
    desc: 'Fully automated thought leadership. AI writes, AI comments, AI replies, AI lives your life. You just watch.',
    cost: 30000, auth: -3, prod: 45,
    flavor: '"In the symphony of business... (written by you, an AI)"',
  },
];

/* ---------- Upgrades ---------- */
DATA.UPGRADES = [
  {
    id: 'emoji', name: 'Use 3 Emojis Per Post', tier: 1, icon: '😀',
    desc: 'Studies show emojis boost engagement by 47%. The studies were made up. It works anyway.',
    cost: 80, effect: 'Posts gain +15% impressions', max: 1,
  },
  {
    id: 'question', name: 'End With a Question', tier: 1, icon: '❓',
    desc: 'Questions force people to comment. Commenting forces the algorithm to notice you.',
    cost: 120, effect: 'Posts gain +20% impressions', max: 1,
  },
  {
    id: 'tag', name: 'Tag 5 People', tier: 2, icon: '🏷️',
    desc: 'Tagging people notifies them, which makes them look, which makes the algorithm happy.',
    cost: 400, effect: 'Posts gain +25% impressions', max: 1,
  },
  {
    id: 'synergy', name: 'Use the Word "Synergy"', tier: 2, icon: '🤝',
    desc: 'Nothing says "I understand business" like a word nobody can define.',
    cost: 500, effect: 'All generators +10% output', max: 1,
  },
  {
    id: 'humble', name: 'Humble Brag About Your Kids', tier: 3, icon: '👶',
    desc: 'Nothing humanizes a thought leader like weaponizing their children.',
    cost: 1500, effect: 'All generators +15% output', max: 1,
  },
  {
    id: 'viralboost', name: 'Viral Boost Algorithm', tier: 4, icon: '🚀',
    desc: 'A proprietary algorithm that definitely exists and definitely works.',
    cost: 8000, effect: 'Viral posts ×2 more impressions', max: 1,
  },
];

/* ---------- Analytics upgrades ---------- */
DATA.ANALYTICS_UPGRADES = [
  {
    id: 'an_basic', name: 'Basic Analytics', tier: 1, icon: '📊',
    desc: 'See your impressions, likes, and followers over time. Raw numbers. No insights.',
    cost: 150, effect: 'Unlocks the analytics dashboard', max: 1,
  },
  {
    id: 'an_curve', name: 'Engagement Curves', tier: 2, icon: '📈',
    desc: 'See the live engagement curve of each post. Watch it spike, then decay. Depressing.',
    cost: 600, effect: 'Show per-post engagement curves', max: 1,
  },
  {
    id: 'an_insight', name: 'AI Insights', tier: 3, icon: '🔮',
    desc: 'Our AI reads your numbers and tells you what to post. It always says "post more".',
    cost: 2000, effect: 'Show AI-generated insights', max: 1,
  },
  {
    id: 'an_bench', name: 'Benchmarking', tier: 4, icon: '🏁',
    desc: 'Compare your engagement to fictional thought leaders. You are losing.',
    cost: 6000, effect: 'Show benchmark comparisons', max: 1,
  },
];

/* ---------- Outsource workers ---------- */
DATA.WORKERS = [
  {
    id: 'raj', name: 'Rajesh Kumar', role: 'Engagement Specialist', emoji: '🧑‍💼', country: 'India',
    cost: 300, prod: 2, auth: -0.3,
    bio: 'Very hard worker. Will like all post. Please give more work.',
    phrases: [
      'Sir, very informative post. Please follow me back.',
      'Great post sir! Very useful content. God bless you.',
      'This is very nice. I like it. Keep posting sir.',
      'Excellent thoughts. I learned many things today.',
      'Sir please check my profile also. I post daily.',
    ],
    replies: [
      'Sir, I liked all 50 posts. Please pay on time.',
      'Yes sir, working very hard. Need more likes?',
      'Sir, my friend also wants this job. Very good worker.',
      'I am doing best sir. The comments are very professional.',
    ],
  },
  {
    id: 'maria', name: 'Maria Santos', role: 'Comment Team Lead', emoji: '👩‍💼', country: 'Philippines',
    cost: 800, prod: 5, auth: -0.5,
    bio: 'Team of 10. We comment all day. Fast fingers.',
    phrases: [
      'This! 🙌 Great share!',
      'Absolutely agree! Very well said.',
      'Thanks for sharing this!',
      'So true! I was just thinking this.',
      'Amazing post! More please!',
    ],
    replies: [
      'Boss, team is ready. We comment on everything.',
      'We need more posts boss. Fingers getting slow.',
      'The comments are looking very natural yes?',
      'Boss, pay increase? We work very hard.',
    ],
  },
  {
    id: 'dmitri', name: 'Dmitri Volkov', role: 'Account Network Operator', emoji: '🧔', country: 'Eastern Europe',
    cost: 2500, prod: 12, auth: -1,
    bio: 'We run 5,000 accounts. Proxies. Rotations. You never get caught. Probably.',
    phrases: [
      'Great post. Our bot network engaged.',
      'This one went to 2,000 accounts. Good.',
      'Engagement confirmed. Network active.',
      'We boosted this post. Very effective.',
    ],
    replies: [
      'Network is stable. 5,000 accounts online.',
      'Do not worry about detection. We are professionals.',
      'We can push 10,000 more accounts if you pay.',
      'The algorithm cannot see us. Trust me.',
    ],
  },
];

/* ---------- Telegram engagement pods ---------- */
DATA.PODS = [
  {
    id: 'pod1', name: 'Engagement Pod Alpha', icon: '👥', members: 24,
    desc: 'A group of professionals who agree to like and comment on each other\'s posts in the first hour.',
    cost: 50, prod: 0.8, auth: -0.1,
    messages: [
      'Welcome! Post your content here and everyone will boost it. 🙏',
      'New rule: like everything within 1 hour of posting. The algorithm loves speed.',
      'I posted my morning thought leadership. Please boost! 🙏',
      'Boosted your post. Great content sir!',
      'Does anyone have a template for a humble brag? Asking for a friend.',
      'Remember: we are a community of like-minded professionals. We are NOT a pod. This is NOT engagement farming.',
      'Posting at 9am EST tomorrow. Be ready.',
      'The algorithm is watching. Boost responsibly.',
    ],
  },
  {
    id: 'pod2', name: 'Thought Leaders Circle', icon: '🧠', members: 40,
    desc: 'Exclusive circle for aspiring thought leaders. We boost each other to the top.',
    cost: 300, prod: 2, auth: -0.2,
    messages: [
      'Welcome to the inner circle. Here we become thought leaders together.',
      'Today\'s topic: how to post about AI without knowing anything about AI.',
      'I\'m humbled to announce I joined this circle. 🙏',
      'Boost my carousel please. It took me 4 hours to make.',
      'The secret is: post at 9am, use 3 emojis, end with a question.',
      'We are not a pod. We are a "professional network".',
    ],
  },
  {
    id: 'pod3', name: 'Viral Syndicate', icon: '🔥', members: 60,
    desc: 'For those who want to go viral. High risk, high reward. The algorithm is watching.',
    cost: 1200, prod: 5, auth: -0.5,
    messages: [
      'You made it. Welcome to the Syndicate.',
      'We boost hard. We boost fast. We boost without mercy.',
      'If the algorithm catches you, you\'re on your own. We deny everything.',
      'Post your most controversial hot take. We\'ll make it viral.',
      'The Syndicate does not lose. The Syndicate does not get caught.',
    ],
  },
];

/* ---------- Bot service configs ---------- */
DATA.BOT_CONFIGS = [
  { id: 'likebot', name: 'LikeBot', icon: '👍', desc: 'Likes every post you make. Instantly. Like a loyal dog.', cost: 500, prod: 3, auth: -0.4 },
  { id: 'commentbot', name: 'CommentBot', icon: '💬', desc: 'Comments "Great post!" on everything. Originality not included.', cost: 1500, prod: 6, auth: -0.8 },
  { id: 'followbot', name: 'FollowBot', icon: '➕', desc: 'Follows and unfollows 500 people a day. The algorithm hates this. We do it anyway.', cost: 4000, prod: 12, auth: -1.5 },
  { id: 'replybot', name: 'ReplyBot', icon: '🔁', desc: 'Replies to every comment on your posts. With AI. The AI is a random phrase generator.', cost: 10000, prod: 20, auth: -2 },
];

/* ---------- Dark web marketplace listings ---------- */
DATA.DARK_LISTINGS = [
  { id: 'dl1', name: '1,000 Likes (Organic Looking)', icon: '👍', desc: 'From real-looking accounts. No, they are not real. They just look real.', cost: 800, reward: 1000, auth: -2 },
  { id: 'dl2', name: '500 Comments (Custom Phrases)', icon: '💬', desc: 'Your choice of phrase. Popular: "Great post!", "This! 🙌", "Sir, very informative".', cost: 2000, reward: 1500, auth: -3 },
  { id: 'dl3', name: 'Follower Package (2,000)', icon: '➕', desc: 'Followers that will never engage. Perfect for looking influential.', cost: 5000, reward: 2000, auth: -5 },
  { id: 'dl4', name: 'Viral Booster (One Time)', icon: '🚀', desc: 'We push your post to 100,000 accounts. It may go viral. It may get you banned. No refunds.', cost: 12000, reward: 5000, auth: -8 },
  { id: 'dl5', name: 'The "Thought Leader" Package', icon: '🧠', desc: 'We make you look like a thought leader. Verified badge not included. We tried.', cost: 25000, reward: 10000, auth: -12 },
];

/* ---------- Real commenters (for the comment stream) ---------- */
DATA.COMMENTERS = [
  { name: 'Sarah Chen', role: 'Marketing Director', emoji: '👩‍💼', color: '#e91e63', phrases: ['Great post! Really resonates with me.', 'This is exactly what I needed today. 🙏', 'Love this perspective. Sharing with my team!', 'So true! The algorithm is everything.', '100% agree. Well said.', 'This should be required reading.'] },
  { name: 'James O\'Brien', role: 'Sales Lead', emoji: '👨‍💼', color: '#3f51b5', phrases: ['Spot on. Couldn\'t agree more.', 'This hit different today. 🔥', 'Thanks for sharing this insight.', 'Real talk. Appreciate you.', 'Bookmarking this one.', 'The synergy here is unreal.'] },
  { name: 'Priya Sharma', role: 'Product Manager', emoji: '👩‍💻', color: '#9c27b0', phrases: ['Love the way you think about this.', 'Needed this reminder today.', 'This is the content I come here for.', 'Absolutely brilliant take.', 'Saving this for later.', 'Your posts are always on point.'] },
  { name: 'Mike Johnson', role: 'Founder', emoji: '🧔', color: '#00acc1', phrases: ['Facts. Every word.', 'This is the way. 💯', 'Great breakdown, thanks!', 'Agreed. The grind is real.', 'We should connect!', 'This changed my morning.'] },
  { name: 'Emily Rodriguez', role: 'HR Director', emoji: '👩‍🎤', color: '#d32f2f', phrases: ['This is so well written.', 'I feel seen by this post.', 'Thanks for putting this out there.', 'Needed this energy today!', 'The best post I\'ve seen this week.', 'You always deliver.'] },
  { name: 'David Kim', role: 'Engineer', emoji: '👨‍💻', color: '#00897b', phrases: ['Solid take, thanks for sharing.', 'This is underrated content.', 'Well said. Saving this.', 'The algorithm gods smile upon you.', 'Great post, very informative.', 'This is the content we need.'] },
  { name: 'Anonymous User', role: 'Professional', emoji: '🙂', color: '#757575', phrases: ['Great post!', 'This! 🙌', 'Very informative!', 'Thanks for sharing!', 'Couldn\'t agree more!', 'Absolutely! 👏'] },
];

/* ---------- Worker command phrases (player -> worker) ---------- */
DATA.WORKER_COMMANDS = [
  { id: 'like', label: '👍 Like all my posts', reply: 'Yes sir, liking everything now.' },
  { id: 'comment', label: '💬 Comment on my posts', reply: 'Comments going out. Very professional ones.' },
  { id: 'follow', label: '➕ Follow new people', reply: 'Following 200 new people today.' },
  { id: 'report', label: '📊 Send engagement report', reply: 'Report: 1,200 likes, 400 comments, 98% fake. All good.' },
  { id: 'pay', label: '💰 Pay bonus', reply: 'Thank you boss! Very generous! More work please!' },
  { id: 'fire', label: '🚫 Fire worker', reply: 'No no please! I have family! I will work harder!' },
];

/* ---------- Notification templates ---------- */
DATA.NOTIFS = {
  view: [
    'Someone viewed your profile',
    'A recruiter viewed your profile',
    'Someone in "Executive Presence" viewed your profile',
  ],
  like: [
    'liked your post',
    'reacted 👍 to your post',
    'reacted 💡 to your post',
  ],
  comment: [
    'commented: "Great post! 🙌"',
    'commented: "This! 🙌"',
    'commented: "Sir, very informative"',
    'commented: "Couldn\'t agree more!"',
  ],
  connection: [
    'accepted your connection request',
    'sent you a connection request',
  ],
  follower: [
    'followed you',
    'started following you',
  ],
  recruiter: [
    '🚨 Recruiter: "We\'re hiring! Are you open to a quick chat?"',
    '🚨 Recruiter: "Your profile stood out. 10x engineer needed!"',
  ],
};

/* ---------- Sponsored ads ---------- */
DATA.ADS = [
  { emoji: '💼', title: 'Executive Presence™', sub: 'Become a thought leader. 97% of leaders agree.' },
  { emoji: '🤖', title: 'Automate Your Brand', sub: 'AI writes. You retire. Try free.' },
  { emoji: '📈', title: 'Get 10k Followers', sub: 'Our bots work while you sleep.' },
  { emoji: '🏖️', title: 'The 4-Hour Workweek 2.0', sub: 'Outsource your entire life.' },
];

/* ---------- Fourth wall posts ---------- */
DATA.FOURTHWALL = [
  "You've been scrolling for 2 hours. Your real boss is wondering where you are.",
  "This is a game. You are not actually gaining influence. You are clicking a button.",
  "You just felt pride in a number that exists on a fake website. Reflect.",
  "The algorithm thanks you for your continued engagement. The algorithm is always watching.",
  "Your real connections are outside. The 4,000 here are fictional. Mostly.",
];
