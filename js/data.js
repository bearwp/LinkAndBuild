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
    id: 'hot', name: 'Hot Take', text: "Unpopular opinion: most 'thought leadership' on this app is just recycled LockedIn posts with extra steps. Change my mind.",
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
    desc: 'Enterprise-grade personal branding. Networks of loyal accounts, proxy rotation, follow/unfollow bots, multiple clients.',
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
    bio: 'We run 5,000 accounts. Proxies. Rotations. You always get noticed. Guaranteed.',
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
      'The algorithm is watching. And it loves what it sees.',
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
    desc: 'For those who want to go viral. The algorithm is watching, and it is impressed.',
    cost: 1200, prod: 5, auth: -0.5,
    messages: [
      'You made it. Welcome to the Syndicate.',
      'We boost hard. We boost fast. We boost without mercy.',
      'The algorithm is already a fan. It just doesn\'t know it yet.',
      'Post your most controversial hot take. We\'ll make it viral.',
      'The Syndicate only wins. The algorithm is on our side.',
    ],
  },
];

/* ---------- Bot service configs ---------- */
DATA.BOT_CONFIGS = [
  { id: 'likebot', name: 'LikeBot', icon: '👍', desc: 'Likes every post you make. Instantly. Like a loyal dog.', cost: 500, prod: 3, auth: -0.4 },
  { id: 'commentbot', name: 'CommentBot', icon: '💬', desc: 'Comments "Great post!" on everything. Originality guaranteed.', cost: 1500, prod: 6, auth: -0.8 },
  { id: 'followbot', name: 'FollowBot', icon: '➕', desc: 'Follows and unfollows 500 people a day. The algorithm loves the activity. So do we.', cost: 4000, prod: 12, auth: -1.5 },
  { id: 'replybot', name: 'ReplyBot', icon: '🔁', desc: 'Replies to every comment on your posts. With AI. The AI is a random phrase generator.', cost: 10000, prod: 20, auth: -2 },
];

/* ---------- Dark web marketplace listings ---------- */
DATA.DARK_LISTINGS = [
  { id: 'dl1', name: '1,000 Likes (Organic Looking)', icon: '👍', desc: 'From real-looking accounts. They look real because they are real. Trust us.', cost: 800, reward: 1000, auth: -2 },
  { id: 'dl2', name: '500 Comments (Custom Phrases)', icon: '💬', desc: 'Your choice of phrase. Popular: "Great post!", "This! 🙌", "Sir, very informative".', cost: 2000, reward: 1500, auth: -3 },
  { id: 'dl3', name: 'Follower Package (2,000)', icon: '➕', desc: 'Followers that will never engage. Perfect for looking influential.', cost: 5000, reward: 2000, auth: -5 },
  { id: 'dl4', name: 'Viral Booster (One Time)', icon: '🚀', desc: 'We push your post to 100,000 accounts. It will go viral. The algorithm will celebrate you.', cost: 12000, reward: 5000, auth: -8 },
  { id: 'dl5', name: 'The "Thought Leader" Package', icon: '🧠', desc: 'We make you a thought leader. Verified badge included. You have earned it.', cost: 25000, reward: 10000, auth: -12 },
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
  { id: 'report', label: '📊 Send engagement report', reply: 'Report: 1,200 likes, 400 comments, 98% organic. All thriving.' },
  { id: 'pay', label: '💰 Pay bonus', reply: 'Thank you boss! Very generous! More work please!' },
  { id: 'fire', label: '🚫 Fire worker', reply: 'No no please! I have family! I will work harder!' },
];

/* ---------- Notification templates ---------- */
DATA.NOTIFS = {
  view: [
    'Someone viewed your profile',
    'A recruiter viewed your profile',
    'Someone in "Executive Presence" viewed your profile',
    'A Fortune 500 CEO viewed your profile',
    'Your profile appeared in 3 searches this week',
  ],
  like: [
    'liked your post',
    'reacted 👍 to your post',
    'reacted 💡 to your post',
    'reacted 🔥 to your post',
  ],
  comment: [
    'commented: "Great post! 🙌"',
    'commented: "This! 🙌"',
    'commented: "Sir, very informative"',
    'commented: "Couldn\'t agree more!"',
    'commented: "You\'re the best thought leader on here."',
  ],
  connection: [
    'accepted your connection request',
    'sent you a connection request',
    'endorsed you for Leadership',
    'endorsed you for Thought Leadership',
  ],
  follower: [
    'followed you',
    'started following you',
    'joined your network',
  ],
  recruiter: [
    '🚨 Recruiter: "We\'re hiring! Are you open to a quick chat?"',
    '🚨 Recruiter: "Your profile stood out. 10x engineer needed!"',
    '🚨 Recruiter: "We\'ve been trying to reach you. Name your price."',
    '🚨 Recruiter: "A competitor wants to poach you. We\'ll beat their offer."',
  ],
};

/* ---------- Incoming DMs (opportunities streaming in) ---------- */
DATA.DM_SENDERS = [
  { name: 'Sarah Chen', role: 'Talent Partner · Google', emoji: '👩‍💼', color: '#e91e63' },
  { name: 'James O\'Brien', role: 'Head of Growth · ScaleUp', emoji: '👨‍💼', color: '#3f51b5' },
  { name: 'Priya Sharma', role: 'Recruiter · FAANG', emoji: '👩‍💻', color: '#9c27b0' },
  { name: 'Mike Johnson', role: 'Founder · Unicorn', emoji: '🧔', color: '#00acc1' },
  { name: 'Emily Rodriguez', role: 'VP People · BigCorp', emoji: '👩‍🎤', color: '#d32f2f' },
  { name: 'David Kim', role: 'Angel Investor', emoji: '👨‍💻', color: '#00897b' },
  { name: 'Growth Expert', role: 'Engagement Consultant', emoji: '📈', color: '#0a66c2' },
  { name: 'Anonymous CEO', role: 'Fortune 500', emoji: '🕴️', color: '#757575' },
  { name: 'Karen Mitchell', role: 'MLM Queen', emoji: '💅', color: '#ec4070' },
  { name: 'Dr. Visionary', role: 'Thought Leader', emoji: '🧠', color: '#7e57c2' },
];

DATA.DM_MESSAGES = [
  'We\'ve been trying to reach you. Name your price. 💼',
  'Your profile stood out. 10x engineer needed. Are you open?',
  'A competitor wants to poach you. We\'ll beat their offer.',
  'I saw your post. Want 10x engagement? I have a tool.',
  'Join my "professional network". The algorithm loves it.',
  'Are you open to a quick chat? 15 minutes. I promise.',
  'Your content is fire. Let\'s collab on a carousel.',
  'We\'re hiring a Chief Synergy Officer. You\'re perfect.',
  'DM me "YES" to learn how I make $10k/month from my phone.',
  'I endorsed you for Thought Leadership. Return the favor?',
  'Your last post changed my life. Can I feature you?',
  'Investors are circling. Are you raising?',
  'We want you on our podcast. 1M listeners.',
  'Free webinar on financial freedom. You\'re invited.',
  'The algorithm showed me your profile. I\'m impressed.',
  'Can you mentor me? I\'ll pay in exposure.',
  'We\'re building the LockedIn of LockedIn. Join us.',
  'Your engagement is unreal. What\'s your secret?',
  'I have a once-in-a-lifetime opportunity. DM for details.',
  'Congrats on the growth! Let\'s connect.',
];

/* ---------- Calendar (coffees & quick chats) ---------- */
DATA.CAL_TYPES = [
  { icon: '☕', label: 'Coffee Chat', reward: 15, auth: 1 },
  { icon: '🤝', label: 'Quick Sync', reward: 10, auth: 0.5 },
  { icon: '🍸', label: 'Networking Drinks', reward: 25, auth: 1.5 },
  { icon: '💼', label: 'Intro Call', reward: 20, auth: 1 },
  { icon: '🧠', label: 'Mentor Session', reward: 30, auth: 2 },
];

DATA.CAL_PEOPLE = [
  'Sarah Chen', 'James O\'Brien', 'Priya Sharma', 'Mike Johnson',
  'Emily Rodriguez', 'David Kim', 'Dr. Visionary', 'Karen Mitchell',
  'Brad Thompson', 'Sofia Reyes', 'Marcus Reed', 'Anonymous CEO',
];

/* ---------- Recommended people to follow ---------- */
DATA.RECOMMENDED = [
  { id: 'rec1', name: 'Alex Rivera', role: 'Growth Hacker · 3x Founder', emoji: '🚀', color: '#0a66c2', followers: '12.4k' },
  { id: 'rec2', name: 'Nina Patel', role: 'VP Marketing · Unicorn', emoji: '📈', color: '#e91e63', followers: '48k' },
  { id: 'rec3', name: 'Tom Okafor', role: 'LockedIn Coach', emoji: '🎯', color: '#00897b', followers: '210k' },
  { id: 'rec4', name: 'Lena Fischer', role: 'AI Evangelist', emoji: '🤖', color: '#7e57c2', followers: '89k' },
  { id: 'rec5', name: 'Marcus Reed', role: 'CEO · Gym Bro Holdings', emoji: '🏋️', color: '#5c6bc0', followers: '1.2M' },
  { id: 'rec6', name: 'Sofia Reyes', role: 'Founder · Zen Startup', emoji: '🌴', color: '#66a4a4', followers: '340k' },
  { id: 'rec7', name: 'Dr. Visionary', role: 'Global Thought Leader', emoji: '🧠', color: '#7e57c2', followers: '2.1M' },
  { id: 'rec8', name: 'Priya Patel', role: 'Talent Acquisition · Hiring!!', emoji: '🚨', color: '#ef5350', followers: '15k' },
];

/* ---------- Network people (want to Link & Build with you) ---------- */
DATA.NETWORK_PEOPLE = [
  { id: 'net1', name: 'Brad Thompson', role: 'Serial Networker · 40k connections', emoji: '🤝', color: '#0a66c2' },
  { id: 'net2', name: 'Chloe Nguyen', role: 'Startup Founder · Raising Series A', emoji: '🚀', color: '#e91e63' },
  { id: 'net3', name: 'Dev Patel', role: 'Full-Stack · Open to collab', emoji: '💻', color: '#00897b' },
  { id: 'net4', name: 'Amara Osei', role: 'Product Designer · Ex-FAANG', emoji: '🎨', color: '#7e57c2' },
  { id: 'net5', name: 'Jake Miller', role: 'Sales · "Let\'s hop on a call"', emoji: '📞', color: '#5c6bc0' },
  { id: 'net6', name: 'Fatima Al-Rashid', role: 'Marketing Lead · Growth obsessed', emoji: '📈', color: '#ef5350' },
  { id: 'net7', name: 'Lucas Weber', role: 'AI Engineer · Prompt whisperer', emoji: '🤖', color: '#00acc1' },
  { id: 'net8', name: 'Grace Kim', role: 'HR · "I know a guy"', emoji: '👩‍💼', color: '#d32f2f' },
];

/* ---------- Bank (pathetic transactions) ---------- */
DATA.BANK_SEED = [
  { label: 'EngageBot™ Monthly Subscription', amount: -4.99, icon: '🤖' },
  { label: 'Energy Drink (for the grind)', amount: -2.50, icon: '⚡' },
  { label: 'Electricity Bill (bots need power)', amount: -18.32, icon: '💡' },
  { label: 'LockedIn Premium (free trial ended)', amount: -29.99, icon: '💼' },
  { label: 'Wi-Fi Bill (the algorithm needs you online)', amount: -9.99, icon: '📶' },
  { label: 'Coffee for "networking"', amount: -4.75, icon: '☕' },
  { label: 'Refund from MLM webinar (denied)', amount: -49.00, icon: '💅' },
  { label: 'Deposit: sold 3 "mentorship" slots', amount: 15.00, icon: '🧠' },
  { label: 'Deposit: mom sent money', amount: 20.00, icon: '👩' },
  { label: 'Deposit: refunded a bot that broke', amount: 3.50, icon: '🔧' },
];

/* ---------- Sponsored ads ---------- */
DATA.ADS = [
  { emoji: '💼', title: 'Executive Presence™', sub: 'Become a thought leader. 97% of leaders agree.' },
  { emoji: '🤖', title: 'Automate Your Brand', sub: 'AI writes. You retire. Try free.' },
  { emoji: '📈', title: 'Get 10k Followers', sub: 'Our bots work while you sleep.' },
  { emoji: '🏖️', title: 'The 4-Hour Workweek 2.0', sub: 'Outsource your entire life.' },
];

/* ---------- Fourth wall posts ---------- */
DATA.FOURTHWALL = [
  "You've been scrolling for 2 hours. Your empire is growing. Your real boss is wondering where you are.",
  "This is a game. You are not actually gaining influence. You are clicking a button. And it feels amazing.",
  "You just felt pride in a number that exists on a fake website. That number is huge. Reflect on your success.",
  "The algorithm thanks you for your continued engagement. The algorithm is always watching. It likes what it sees.",
  "Your real connections are outside. The 4,000 here are fictional. But they all think you're a genius.",
];

/* ---------- Cringy reaction GIFs (animated SVG, no network) ---------- */
DATA.REACTION_GIFS = [
  { label: 'This is fine', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fff3e0"/><circle cx="60" cy="45" r="26" fill="#ffcc80"><animate attributeName="r" values="26;28;26" dur="1s" repeatCount="indefinite"/></circle><circle cx="52" cy="42" r="3" fill="#5d4037"/><circle cx="68" cy="42" r="3" fill="#5d4037"/><path d="M52 52 Q60 58 68 52" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M20 90 Q30 60 40 90 Q50 50 60 90 Q70 60 80 90 Q90 50 100 90" fill="#ff7043" opacity="0.9"><animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.6s" repeatCount="indefinite"/></path><text x="60" y="84" font-size="9" text-anchor="middle" fill="#bf360c" font-family="sans-serif">THIS IS FINE</text></svg>` },
  { label: 'Crying laughing', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#e3f2fd"/><circle cx="60" cy="45" r="26" fill="#ffd54f"><animate attributeName="ry" values="26;24;26" dur="0.5s" repeatCount="indefinite"/></circle><path d="M46 40 Q48 36 50 40" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M70 40 Q72 36 74 40" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M48 52 Q60 62 72 52" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M44 40 Q40 34 42 30" stroke="#42a5f5" stroke-width="3" fill="none"><animate attributeName="d" values="M44 40 Q40 34 42 30;M44 40 Q40 34 42 34;M44 40 Q40 34 42 30" dur="0.4s" repeatCount="indefinite"/></path><path d="M76 40 Q80 34 78 30" stroke="#42a5f5" stroke-width="3" fill="none"><animate attributeName="d" values="M76 40 Q80 34 78 30;M76 40 Q80 34 78 34;M76 40 Q80 34 78 30" dur="0.4s" repeatCount="indefinite"/></path><text x="60" y="84" font-size="9" text-anchor="middle" fill="#1565c0" font-family="sans-serif">LOL SO TRUE</text></svg>` },
  { label: 'Mind blown', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#f3e5f5"/><circle cx="60" cy="45" r="24" fill="#ce93d8"/><circle cx="52" cy="42" r="4" fill="#4a148c"/><circle cx="68" cy="42" r="4" fill="#4a148c"/><path d="M52 54 Q60 60 68 54" stroke="#4a148c" stroke-width="2" fill="none"/><g fill="#ffd54f"><circle cx="30" cy="30" r="4"><animate attributeName="cy" values="30;22;30" dur="0.7s" repeatCount="indefinite"/></circle><circle cx="90" cy="30" r="4"><animate attributeName="cy" values="30;22;30" dur="0.7s" repeatCount="indefinite"/></circle><circle cx="60" cy="16" r="4"><animate attributeName="cy" values="16;10;16" dur="0.7s" repeatCount="indefinite"/></circle></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#6a1b9a" font-family="sans-serif">MIND. BLOWN.</text></svg>` },
  { label: 'Clapping', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#e8f5e9"/><g fill="#ffb74d"><rect x="30" y="30" width="14" height="30" rx="4"><animate attributeName="y" values="30;26;30" dur="0.3s" repeatCount="indefinite"/></rect><rect x="76" y="30" width="14" height="30" rx="4"><animate attributeName="y" values="30;26;30" dur="0.3s" repeatCount="indefinite"/></rect></g><g fill="#ffd54f"><circle cx="37" cy="26" r="6"/><circle cx="83" cy="26" r="6"/></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#2e7d32" font-family="sans-serif">SO INSPIRING 👏</text></svg>` },
  { label: 'Thumbs up', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fff8e1"/><g><rect x="40" y="30" width="16" height="34" rx="6" fill="#ffb74d"/><rect x="60" y="34" width="16" height="30" rx="6" fill="#ffb74d"/><rect x="80" y="40" width="16" height="24" rx="6" fill="#ffb74d"/><rect x="40" y="30" width="56" height="12" rx="6" fill="#ffa726"><animate attributeName="y" values="30;26;30" dur="0.5s" repeatCount="indefinite"/></rect></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#e65100" font-family="sans-serif">AGREE 100%</text></svg>` },
];
