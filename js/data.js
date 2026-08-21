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

/* ---------- Naive first posts (the honest, pre-grift voice) ---------- */
// The first few posts are written by a real person who actually needs a job.
// No bait, no hustle — just someone asking the internet for help. The
// algorithm reads this as weakness, which is exactly the point.
DATA.NAIVE_POSTS = [
  "Hi everyone. I just got laid off and I'm looking for a new role. I have 5 years of experience and I'm open to anything. Please reach out if you know of anything. 🙏",
  "I need a job. I've applied to 200 places and heard back from 3. If anyone is hiring, I'd really appreciate a referral.",
  "Honestly just posting here because I don't know what else to do. I need work. I'm reliable, I show up, and I learn fast. Please help.",
  "My rent is due in two weeks and I still haven't found anything. I'm not asking for a handout, just a chance. Anyone hiring entry-level?",
  "First time posting. I'm nervous but I need to put myself out there. I'm looking for literally any job. I'll take anything at this point.",
  "I keep seeing everyone's success stories and I'm happy for them, but I just need one person to give me a shot. I need a job. That's it.",
  "Not sure how this app works but I heard people find jobs here. I'm a hard worker, I have references, and I need a job. Please share if you can.",
  "I've been unemployed for 6 months. I'm not here to network or build a brand. I just need a job so I can pay my bills.",
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
    id: 'pod', name: 'Engagement Pod', tier: 1, layer: 1, icon: '👥',
    desc: 'Join a community of like-minded professionals who agree to boost each other in the critical first hour.',
    cost: { base: 50, growth: 1.15 }, auth: -0.1, prod: { base: 0.8, perUnit: 0 },
    flavor: '"We scratch each other\'s backs. Professionally."',
  },
  {
    id: 'scheduler', name: 'Scheduling & Analytics', tier: 2, layer: 1, icon: '📅',
    desc: 'Maximize your reach with data-driven posting. Auto-posts at the optimal time. Shows you the curves.',
    cost: { base: 250, growth: 1.15 }, auth: -0.15, prod: { base: 2.5, perUnit: 0 },
    flavor: '"Post at 9am EST. The data demands it."',
  },
  {
    id: 'outsource', name: 'Outsourced Engagement', tier: 3, layer: 1, icon: '🌏',
    desc: 'Scale your engagement affordably. Cheap likes and comments from a global workforce with broken English.',
    cost: { base: 1200, growth: 1.15 }, auth: -0.5, prod: { base: 7, perUnit: 0 },
    flavor: '"Sir, very informative. Please follow me back."',
  },
  {
    id: 'agency', name: 'Growth Agency', tier: 4, layer: 1, icon: '🏢',
    desc: 'Enterprise-grade personal branding. Networks of loyal accounts, proxy rotation, follow/unfollow bots, multiple clients.',
    cost: { base: 6000, growth: 1.15 }, auth: -1.2, prod: { base: 18, perUnit: 0 },
    flavor: '"We run 40,000 accounts. Yours is one of them."',
  },
  {
    id: 'aifactory', name: 'AI Factory', tier: 5, layer: 1, icon: '🏭',
    desc: 'Fully automated thought leadership. AI writes, AI comments, AI replies, AI lives your life. You just watch.',
    cost: { base: 30000, growth: 1.15 }, auth: -3, prod: { base: 45, perUnit: 0 },
    flavor: '"In the symphony of business... (written by you, an AI)"',
  },
  {
    id: 'hashtag', name: 'Hashtag Farm', tier: 6, layer: 1, icon: '#️⃣',
    desc: 'A server farm that generates trending hashtags and tags them onto everything you post.',
    cost: { base: 150000, growth: 1.15 }, auth: -4, prod: { base: 90, perUnit: 0 },
    flavor: '"#grindset #hustle #synergy #blessed #thoughtleader"',
  },
  {
    id: 'newsletter', name: 'Newsletter Empire', tier: 7, layer: 1, icon: '📧',
    desc: 'A daily newsletter nobody reads, forwarded to 100,000 inboxes that mark it as spam.',
    cost: { base: 750000, growth: 1.15 }, auth: -5, prod: { base: 180, perUnit: 0 },
    flavor: '"Issue #1,247: The same three paragraphs, reworded."',
  },
  {
    id: 'podcast', name: 'Podcast Network', tier: 8, layer: 1, icon: '🎙️',
    desc: 'A podcast where you interview other thought leaders about their thought leadership.',
    cost: { base: 4000000, growth: 1.15 }, auth: -6, prod: { base: 360, perUnit: 0 },
    flavor: '"Episode 89: How I Built My Brand (by talking about building my brand)."',
  },
  {
    id: 'course', name: 'Online Course Mill', tier: 9, layer: 1, icon: '🎓',
    desc: 'Sell a $499 course on how to sell $499 courses. The funnel feeds itself.',
    cost: { base: 20000000, growth: 1.15 }, auth: -7, prod: { base: 720, perUnit: 0 },
    flavor: '"Module 1: Believe in yourself. Module 2: Charge for it."',
  },
  {
    id: 'conference', name: 'Thought Leadership Summit', tier: 10, layer: 1, icon: '🏛️',
    desc: 'Host a conference where everyone pays to watch you talk about how you got here.',
    cost: { base: 100000000, growth: 1.15 }, auth: -8, prod: { base: 1500, perUnit: 0 },
    flavor: '"Keynote: The Art of the Keynote."',
  },
  {
    id: 'brand', name: 'Personal Brand Inc.', tier: 11, layer: 2, icon: '💼',
    desc: 'Incorporate yourself. You are now a legal entity with a mission statement and a logo.',
    cost: { base: 500000000, growth: 1.15 }, auth: -9, prod: { base: 3000, perUnit: 0 },
    flavor: '"Our mission: to be the most followed entity in the room."',
  },
  {
    id: 'franchise', name: 'Franchise Your Persona', tier: 12, layer: 2, icon: '🏪',
    desc: 'License your face to other people who want to be you. They pay you to be a worse version of you.',
    cost: { base: 2500000000, growth: 1.15 }, auth: -10, prod: { base: 6000, perUnit: 0 },
    flavor: '"Now with 40% less authenticity, in every major city."',
  },
  {
    id: 'media', name: 'Media Conglomerate', tier: 13, layer: 2, icon: '📺',
    desc: 'Buy the outlets that interview you. Now the news is just you, reporting on you.',
    cost: { base: 12000000000, growth: 1.15 }, auth: -11, prod: { base: 12000, perUnit: 0 },
    flavor: '"Tonight at 9: You, on You, with special guest You."',
  },
  {
    id: 'ipo', name: 'Take Yourself Public', tier: 14, layer: 3, icon: '📈',
    desc: 'IPO your personal brand. Shareholders now own a piece of your soul. They want growth.',
    cost: { base: 60000000000, growth: 1.15 }, auth: -12, prod: { base: 25000, perUnit: 0 },
    flavor: '"Q3 earnings: engagement up, authenticity down, shareholders thrilled."',
  },
  {
    id: 'exchange', name: 'Thought Leadership Exchange', tier: 15, layer: 3, icon: '🏦',
    desc: 'A stock exchange where influence is the currency and you are the reserve asset.',
    cost: { base: 300000000000, growth: 1.15 }, auth: -13, prod: { base: 50000, perUnit: 0 },
    flavor: '"Your clout is now a ticker symbol. It only goes up."',
  },
  {
    id: 'algorithm', name: 'Become the Algorithm', tier: 16, layer: 4, icon: '👁️',
    desc: 'You are no longer farming the algorithm. You are the algorithm. The room is you now.',
    cost: { base: 1500000000000, growth: 1.15 }, auth: -15, prod: { base: 100000, perUnit: 0 },
    flavor: '"The number going up is the only thing that has ever felt like progress."',
  },
];

/* ---------- Upgrades ---------- */
// Each upgrade has a machine-readable `key` + `value` so the engine applies
// effects generically (Engine.upgradeMult(key) / Engine.upgradeFlat(key))
// instead of hardcoding 60 checks. `effect` is the human-readable label the
// UI shows. `layer` gates the upgrade behind a prestige layer.
//
// Effect keys:
//   gen_mult       -> all generators +value% output (additive, summed)
//   post_mult      -> your posts +value% impressions
//   follower_mult  -> follower gain +value%
//   like_mult      -> likes +value%
//   click_mult     -> click power (liking NPC posts) +value%
//   viral_mult     -> viral posts +value% impressions
//   auth_less      -> authenticity drain reduced by value (flat, summed)
//   start_followers-> start each run with value followers (head start)
//   start_impressions -> start each run with value impressions (head start)
DATA.UPGRADES = [
  // ---- tier 1: the basics (layer 1) ----
  {
    id: 'emoji', name: 'Use 3 Emojis Per Post', tier: 1, layer: 1, icon: '😀',
    desc: 'Studies show emojis boost engagement by 47%. The studies were made up. It works anyway.',
    cost: { base: 80, growth: 1.5 }, key: 'post_mult', value: 0.15, max: 1, effect: 'Posts gain +15% impressions',
  },
  {
    id: 'question', name: 'End With a Question', tier: 1, layer: 1, icon: '❓',
    desc: 'Questions force people to comment. Commenting forces the algorithm to notice you.',
    cost: { base: 120, growth: 1.5 }, key: 'post_mult', value: 0.20, max: 1, effect: 'Posts gain +20% impressions',
  },
  {
    id: 'tag', name: 'Tag 5 People', tier: 2, layer: 1, icon: '🏷️',
    desc: 'Tagging people notifies them, which makes them look, which makes the algorithm happy.',
    cost: { base: 400, growth: 1.5 }, key: 'post_mult', value: 0.25, max: 1, effect: 'Posts gain +25% impressions',
  },
  {
    id: 'synergy', name: 'Use the Word "Synergy"', tier: 2, layer: 1, icon: '🤝',
    desc: 'Nothing says "I understand business" like a word nobody can define.',
    cost: { base: 500, growth: 1.5 }, key: 'gen_mult', value: 0.10, max: 1, effect: 'All generators +10% output',
  },
  {
    id: 'humble', name: 'Humble Brag About Your Kids', tier: 3, layer: 1, icon: '👶',
    desc: 'Nothing humanizes a thought leader like weaponizing their children.',
    cost: { base: 1500, growth: 1.5 }, key: 'gen_mult', value: 0.15, max: 1, effect: 'All generators +15% output',
  },
  {
    id: 'viralboost', name: 'Viral Boost Algorithm', tier: 4, layer: 1, icon: '🚀',
    desc: 'A proprietary algorithm that definitely exists and definitely works.',
    cost: { base: 8000, growth: 1.5 }, key: 'viral_mult', value: 1.0, max: 1, effect: 'Viral posts ×2 more impressions',
  },
  // ---- post format upgrades (layer 1) ----
  {
    id: 'carousel', name: 'Carousel Posts', tier: 2, layer: 1, icon: '🎠',
    desc: 'Ten slides of the same thought, reworded. The algorithm counts each swipe as love.',
    cost: { base: 300, growth: 1.5 }, key: 'post_mult', value: 0.15, max: 1, effect: 'Posts gain +15% impressions',
  },
  {
    id: 'poll', name: 'Engagement Polls', tier: 2, layer: 1, icon: '📊',
    desc: '"Agree or strongly agree?" Every vote is a comment. Every comment is a win.',
    cost: { base: 350, growth: 1.5 }, key: 'post_mult', value: 0.12, max: 1, effect: 'Posts gain +12% impressions',
  },
  {
    id: 'video', name: 'Video Content', tier: 3, layer: 1, icon: '🎬',
    desc: 'A 15-second clip of you nodding at a camera. The algorithm loves faces.',
    cost: { base: 1200, growth: 1.5 }, key: 'post_mult', value: 0.20, max: 1, effect: 'Posts gain +20% impressions',
  },
  {
    id: 'photo', name: 'Headshot Every Post', tier: 3, layer: 1, icon: '📸',
    desc: 'Your face, again. People engage with faces. Even the same face, 40 times.',
    cost: { base: 1000, growth: 1.5 }, key: 'post_mult', value: 0.14, max: 1, effect: 'Posts gain +14% impressions',
  },
  {
    id: 'thread', name: 'Thread the Post', tier: 4, layer: 1, icon: '🧵',
    desc: 'One thought, broken into 12 posts. Each one is a fresh chance to be seen.',
    cost: { base: 5000, growth: 1.5 }, key: 'post_mult', value: 0.30, max: 1, effect: 'Posts gain +30% impressions',
  },
  {
    id: 'story', name: 'Daily Story', tier: 4, layer: 1, icon: '⏳',
    desc: 'A 24-hour post that disappears. Like your authenticity.',
    cost: { base: 6000, growth: 1.5 }, key: 'post_mult', value: 0.18, max: 1, effect: 'Posts gain +18% impressions',
  },
  // ---- engagement upgrades (layer 1) ----
  {
    id: 'likebait', name: 'Like-Baiting', tier: 2, layer: 1, icon: '👍',
    desc: '"Like if you agree." They always agree. They have to.',
    cost: { base: 250, growth: 1.5 }, key: 'like_mult', value: 0.15, max: 1, effect: 'Likes +15%',
  },
  {
    id: 'commentbait', name: 'Comment-Baiting', tier: 3, layer: 1, icon: '💬',
    desc: '"Comment your favorite word." The comments write themselves.',
    cost: { base: 900, growth: 1.5 }, key: 'like_mult', value: 0.20, max: 1, effect: 'Likes +20%',
  },
  {
    id: 'followbait', name: 'Follow-Baiting', tier: 3, layer: 1, icon: '➕',
    desc: '"Follow for more insights." They follow. They forget. They stay.',
    cost: { base: 1100, growth: 1.5 }, key: 'follower_mult', value: 0.15, max: 1, effect: 'Follower gain +15%',
  },
  {
    id: 'clickbait', name: 'Clickbait Headlines', tier: 4, layer: 1, icon: '🪝',
    desc: '"You won\'t believe what happened next." Neither will you. You wrote it.',
    cost: { base: 4000, growth: 1.5 }, key: 'click_mult', value: 0.25, max: 1, effect: 'Click power +25%',
  },
  {
    id: 'engagement', name: 'Engagement Pod Membership', tier: 4, layer: 1, icon: '👥',
    desc: 'A group of strangers who agree to like everything you post. It\'s not cheating. It\'s community.',
    cost: { base: 4500, growth: 1.5 }, key: 'like_mult', value: 0.25, max: 1, effect: 'Likes +25%',
  },
  // ---- generator multipliers (layer 1) ----
  {
    id: 'optimize', name: 'Optimize the Funnel', tier: 3, layer: 1, icon: '📈',
    desc: 'A spreadsheet that says your numbers should be higher. They are now.',
    cost: { base: 2000, growth: 1.5 }, key: 'gen_mult', value: 0.10, max: 1, effect: 'All generators +10% output',
  },
  {
    id: 'automate', name: 'Automate the Automation', tier: 4, layer: 1, icon: '⚙️',
    desc: 'A bot that manages your bots. The bots are now unionized.',
    cost: { base: 7000, growth: 1.5 }, key: 'gen_mult', value: 0.15, max: 1, effect: 'All generators +15% output',
  },
  {
    id: 'scale', name: 'Scale the Scaling', tier: 5, layer: 1, icon: '🏗️',
    desc: 'You scaled. Now scale the scaling. The scaling scales.',
    cost: { base: 25000, growth: 1.5 }, key: 'gen_mult', value: 0.20, max: 1, effect: 'All generators +20% output',
  },
  {
    id: 'synergy2', name: 'Double Synergy', tier: 5, layer: 1, icon: '🤝',
    desc: 'Synergy, but twice. The word now means even less.',
    cost: { base: 30000, growth: 1.5 }, key: 'gen_mult', value: 0.25, max: 1, effect: 'All generators +25% output',
  },
  // ---- authenticity management (layer 1) ----
  {
    id: 'authentic', name: 'Authenticity Coach', tier: 3, layer: 1, icon: '🧘',
    desc: 'A coach who teaches you to feel real while posting fake. It costs less authenticity.',
    cost: { base: 1800, growth: 1.5 }, key: 'auth_less', value: 0.5, max: 1, effect: 'Authenticity drain -50%',
  },
  {
    id: 'mindful', name: 'Mindful Posting', tier: 4, layer: 1, icon: '🌿',
    desc: 'Breathe before you post. The algorithm appreciates the pause.',
    cost: { base: 5500, growth: 1.5 }, key: 'auth_less', value: 0.5, max: 1, effect: 'Authenticity drain -50%',
  },
  {
    id: 'genuine', name: 'Genuine Engagement', tier: 5, layer: 1, icon: '💚',
    desc: 'Actually read one post before liking it. It feels almost human.',
    cost: { base: 20000, growth: 1.5 }, key: 'auth_less', value: 1.0, max: 1, effect: 'Authenticity drain -100%',
  },
  // ---- viral upgrades (layer 1) ----
  {
    id: 'viral1', name: 'Viral Seed', tier: 4, layer: 1, icon: '🌱',
    desc: 'A tiny nudge that makes your posts slightly more likely to blow up.',
    cost: { base: 6000, growth: 1.5 }, key: 'viral_mult', value: 0.25, max: 1, effect: 'Viral posts +25% impressions',
  },
  {
    id: 'viral2', name: 'Viral Accelerant', tier: 5, layer: 1, icon: '🔥',
    desc: 'Pour fuel on the fire. The fire is your engagement.',
    cost: { base: 22000, growth: 1.5 }, key: 'viral_mult', value: 0.50, max: 1, effect: 'Viral posts +50% impressions',
  },
  {
    id: 'viral3', name: 'Viral Detonator', tier: 6, layer: 1, icon: '💥',
    desc: 'One post. A million eyes. The algorithm detonates on command.',
    cost: { base: 80000, growth: 1.5 }, key: 'viral_mult', value: 1.0, max: 1, effect: 'Viral posts ×2 impressions',
  },
  // ---- tier 6-8: mid-game (layer 1) ----
  {
    id: 'newsletter', name: 'Newsletter Signup', tier: 6, layer: 1, icon: '📧',
    desc: 'Capture emails. Send them thoughts. They never open them. They\'re still yours.',
    cost: { base: 50000, growth: 1.5 }, key: 'follower_mult', value: 0.25, max: 1, effect: 'Follower gain +25%',
  },
  {
    id: 'webinar', name: 'Free Webinar', tier: 6, layer: 1, icon: '🎥',
    desc: 'A webinar on how to grow. Nobody attends. The signup list grows anyway.',
    cost: { base: 60000, growth: 1.5 }, key: 'follower_mult', value: 0.30, max: 1, effect: 'Follower gain +30%',
  },
  {
    id: 'podcast', name: 'Guest Podcast', tier: 7, layer: 1, icon: '🎙️',
    desc: 'You appear on a podcast with 12 listeners. All 12 follow you.',
    cost: { base: 200000, growth: 1.5 }, key: 'follower_mult', value: 0.40, max: 1, effect: 'Follower gain +40%',
  },
  {
    id: 'course', name: 'Sell a Course', tier: 7, layer: 1, icon: '🎓',
    desc: 'A $499 course on how to sell courses. The funnel feeds itself.',
    cost: { base: 250000, growth: 1.5 }, key: 'gen_mult', value: 0.30, max: 1, effect: 'All generators +30% output',
  },
  {
    id: 'book', name: 'Write a Book', tier: 8, layer: 1, icon: '📕',
    desc: 'A book of your posts, bound. It sells 40 copies. It makes you a "published author".',
    cost: { base: 800000, growth: 1.5 }, key: 'post_mult', value: 0.40, max: 1, effect: 'Posts gain +40% impressions',
  },
  {
    id: 'keynote', name: 'Keynote Speaker', tier: 8, layer: 1, icon: '🎤',
    desc: 'You speak at a conference. The audience is 90% bots. They applaud.',
    cost: { base: 1000000, growth: 1.5 }, key: 'gen_mult', value: 0.35, max: 1, effect: 'All generators +35% output',
  },
  // ---- tier 9-10: late game (layer 1) ----
  {
    id: 'brand', name: 'Personal Brand', tier: 9, layer: 1, icon: '💼',
    desc: 'You are now a brand. The brand is you. Neither is real.',
    cost: { base: 5000000, growth: 1.5 }, key: 'gen_mult', value: 0.40, max: 1, effect: 'All generators +40% output',
  },
  {
    id: 'merch', name: 'Merch Drop', tier: 9, layer: 1, icon: '👕',
    desc: 'T-shirts with your face. They sell out. To bots. Who wear them.',
    cost: { base: 6000000, growth: 1.5 }, key: 'follower_mult', value: 0.50, max: 1, effect: 'Follower gain +50%',
  },
  {
    id: 'agency', name: 'Start an Agency', tier: 10, layer: 1, icon: '🏢',
    desc: 'You sell your growth secrets to others. The secrets are "post more".',
    cost: { base: 20000000, growth: 1.5 }, key: 'gen_mult', value: 0.50, max: 1, effect: 'All generators +50% output',
  },
  {
    id: 'fund', name: 'Raise a Fund', tier: 10, layer: 1, icon: '💰',
    desc: 'Investors give you money to be more influential. You spend it on bots.',
    cost: { base: 25000000, growth: 1.5 }, key: 'gen_mult', value: 0.60, max: 1, effect: 'All generators +60% output',
  },
  // ---- layer 2: Brand (prestige gated) ----
  {
    id: 'l2_reach', name: 'Brand Reach', tier: 11, layer: 2, icon: '📡',
    desc: 'Your brand has reach. The reach has reach. Everything reaches.',
    cost: { base: 100000000, growth: 1.5 }, key: 'gen_mult', value: 0.75, max: 1, effect: 'All generators +75% output',
  },
  {
    id: 'l2_follow', name: 'Brand Loyalty', tier: 11, layer: 2, icon: '🧲',
    desc: 'Followers who will never leave. Because they were never real.',
    cost: { base: 120000000, growth: 1.5 }, key: 'follower_mult', value: 0.75, max: 1, effect: 'Follower gain +75%',
  },
  {
    id: 'l2_viral', name: 'Brand Virality', tier: 12, layer: 2, icon: '🌋',
    desc: 'Your brand goes viral. The virus is your brand.',
    cost: { base: 500000000, growth: 1.5 }, key: 'viral_mult', value: 1.5, max: 1, effect: 'Viral posts ×2.5 impressions',
  },
  {
    id: 'l2_post', name: 'Brand Voice', tier: 12, layer: 2, icon: '🗣️',
    desc: 'A consistent voice. The voice is a bot. The bot is consistent.',
    cost: { base: 600000000, growth: 1.5 }, key: 'post_mult', value: 0.60, max: 1, effect: 'Posts gain +60% impressions',
  },
  {
    id: 'l2_like', name: 'Brand Love', tier: 13, layer: 2, icon: '❤️',
    desc: 'People love your brand. The people are bots. The love is real.',
    cost: { base: 2000000000, growth: 1.5 }, key: 'like_mult', value: 0.75, max: 1, effect: 'Likes +75%',
  },
  {
    id: 'l2_click', name: 'Brand Magnetism', tier: 13, layer: 2, icon: '🧿',
    desc: 'Every click on your brand is worth more. The clicks are automated.',
    cost: { base: 2500000000, growth: 1.5 }, key: 'click_mult', value: 0.75, max: 1, effect: 'Click power +75%',
  },
  // ---- layer 3: Platform (prestige gated) ----
  {
    id: 'l3_reach', name: 'Platform Reach', tier: 14, layer: 3, icon: '🌐',
    desc: 'You are the platform. The platform reaches everyone. Everyone is a bot.',
    cost: { base: 10000000000, growth: 1.5 }, key: 'gen_mult', value: 1.0, max: 1, effect: 'All generators ×2 output',
  },
  {
    id: 'l3_follow', name: 'Platform Gravity', tier: 14, layer: 3, icon: '🪐',
    desc: 'Followers orbit you. They cannot escape. They do not want to.',
    cost: { base: 12000000000, growth: 1.5 }, key: 'follower_mult', value: 1.0, max: 1, effect: 'Follower gain ×2',
  },
  {
    id: 'l3_viral', name: 'Platform Detonation', tier: 15, layer: 3, icon: '☄️',
    desc: 'Every post is a supernova. The platform is the sky.',
    cost: { base: 50000000000, growth: 1.5 }, key: 'viral_mult', value: 2.0, max: 1, effect: 'Viral posts ×3 impressions',
  },
  {
    id: 'l3_post', name: 'Platform Voice', tier: 15, layer: 3, icon: '📢',
    desc: 'Your voice is the platform\'s voice. The platform has no voice. It has you.',
    cost: { base: 60000000000, growth: 1.5 }, key: 'post_mult', value: 1.0, max: 1, effect: 'Posts gain ×2 impressions',
  },
  // ---- layer 4: The Algorithm (prestige gated) ----
  {
    id: 'l4_reach', name: 'Algorithmic Reach', tier: 16, layer: 4, icon: '👁️',
    desc: 'You are the algorithm. The algorithm reaches itself. It is infinite.',
    cost: { base: 200000000000, growth: 1.5 }, key: 'gen_mult', value: 1.5, max: 1, effect: 'All generators ×2.5 output',
  },
  {
    id: 'l4_follow', name: 'Algorithmic Gravity', tier: 16, layer: 4, icon: '🕳️',
    desc: 'Nothing escapes. Not even you. Especially not you.',
    cost: { base: 250000000000, growth: 1.5 }, key: 'follower_mult', value: 1.5, max: 1, effect: 'Follower gain ×2.5',
  },
  {
    id: 'l4_viral', name: 'Algorithmic Singularity', tier: 16, layer: 4, icon: '🌌',
    desc: 'The number goes up. It has always gone up. It will always go up.',
    cost: { base: 1000000000000, growth: 1.5 }, key: 'viral_mult', value: 3.0, max: 1, effect: 'Viral posts ×4 impressions',
  },
  {
    id: 'l4_post', name: 'Algorithmic Voice', tier: 16, layer: 4, icon: '🔊',
    desc: 'You speak. The algorithm speaks. There is no difference anymore.',
    cost: { base: 1200000000000, growth: 1.5 }, key: 'post_mult', value: 1.5, max: 1, effect: 'Posts gain ×2.5 impressions',
  },
];

/* ---------- Analytics upgrades ---------- */
DATA.ANALYTICS_UPGRADES = [
  {
    id: 'an_basic', name: 'Basic Analytics', tier: 1, icon: '📊',
    desc: 'See your impressions, likes, and followers over time. Raw numbers. No insights.',
    cost: { base: 150, growth: 1.5 }, effect: 'Unlocks the analytics dashboard', max: 1,
  },
  {
    id: 'an_curve', name: 'Engagement Curves', tier: 2, icon: '📈',
    desc: 'See the live engagement curve of each post. Watch it spike, then decay. Depressing.',
    cost: { base: 600, growth: 1.5 }, effect: 'Show per-post engagement curves', max: 1,
  },
  {
    id: 'an_insight', name: 'AI Insights', tier: 3, icon: '🔮',
    desc: 'Our AI reads your numbers and tells you what to post. It always says "post more".',
    cost: { base: 2000, growth: 1.5 }, effect: 'Show AI-generated insights', max: 1,
  },
  {
    id: 'an_bench', name: 'Benchmarking', tier: 4, icon: '🏁',
    desc: 'Compare your engagement to fictional thought leaders. You are losing.',
    cost: { base: 6000, growth: 1.5 }, effect: 'Show benchmark comparisons', max: 1,
  },
];

/* ---------- Outsource workers ---------- */
DATA.WORKERS = [
  {
    id: 'raj', name: 'Rajesh Kumar', role: 'Engagement Specialist', emoji: '🧑‍💼', country: 'India',
    cost: { base: 300, growth: 1.3 }, prod: { base: 2, perUnit: 0 }, auth: -0.3,
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
    cost: { base: 800, growth: 1.3 }, prod: { base: 5, perUnit: 0 }, auth: -0.5,
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
    cost: { base: 2500, growth: 1.3 }, prod: { base: 12, perUnit: 0 }, auth: -1,
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
  {
    id: 'yuki', name: 'Yuki Tanaka', role: 'Content Farm Manager', emoji: '👩‍💻', country: 'Japan',
    cost: { base: 8000, growth: 1.3 }, prod: { base: 30, perUnit: 0 }, auth: -2,
    bio: 'We write 10,000 posts a day. AI assisted. Human approved. Nobody reads them.',
    phrases: [
      'This post is very good. We will repost it 500 times.',
      'Content farm is running. 10,000 posts today.',
      'We translated your post into 12 languages. All of them wrong.',
      'The engagement is very high. The content is very low.',
    ],
    replies: [
      'Boss, the farm is full. We need more servers.',
      'We wrote 10,000 posts. 9,999 were about synergy.',
      'The AI is learning. It now only writes about itself.',
      'Content farm report: all posts published. Zero read.',
    ],
  },
  {
    id: 'amara', name: 'Amara Osei', role: 'Influencer Network Lead', emoji: '👩‍🎤', country: 'Nigeria',
    cost: { base: 20000, growth: 1.3 }, prod: { base: 60, perUnit: 0 }, auth: -3,
    bio: 'I manage 200 micro-influencers. They will all follow you. They will all forget you.',
    phrases: [
      'My influencers are boosting your post. Very authentic.',
      '200 influencers engaged. All of them are real people. Mostly.',
      'Your brand is trending in my network. The network is 200 people.',
      'We made you look famous. The fame is rented.',
    ],
    replies: [
      'Boss, the influencers want more money. They always want more.',
      'I can get you 500 more influencers. They are very cheap.',
      'The network is growing. The authenticity is shrinking.',
      'Influencer report: 200 engaged. 0 remembered your name.',
    ],
  },
  {
    id: 'viktor', name: 'Viktor Petrov', role: 'Deepfake Specialist', emoji: '🎭', country: 'Russia',
    cost: { base: 50000, growth: 1.3 }, prod: { base: 120, perUnit: 0 }, auth: -5,
    bio: 'I make videos of you saying things you never said. The algorithm loves them.',
    phrases: [
      'Deepfake ready. You are now a motivational speaker.',
      'I made you cry on camera. Very emotional. Very fake.',
      'The video of you is trending. You were never there.',
      'Your face is now a product. Congratulations.',
    ],
    replies: [
      'Boss, the deepfake is viral. You are famous for a lie.',
      'I can make you say anything. The algorithm will believe it.',
      'The video is 100% fake. The engagement is 100% real.',
      'Deepfake report: 1 million views. 0 real moments.',
    ],
  },
  {
    id: 'sofia', name: 'Sofia Almeida', role: 'Ghostwriter Collective', emoji: '✍️', country: 'Brazil',
    cost: { base: 120000, growth: 1.3 }, prod: { base: 250, perUnit: 0 }, auth: -8,
    bio: 'We write your thoughts for you. You have no thoughts. We provide them.',
    phrases: [
      'We wrote your post. It is very profound. You did not write it.',
      'Your book is ghostwritten. The ghost is a team of 40.',
      'We made you sound smart. The smart is rented.',
      'Your thoughts are now a subscription service.',
    ],
    replies: [
      'Boss, we need more topics. You have run out of thoughts.',
      'The ghostwriters are unionizing. They want credit.',
      'We wrote 40 posts. All of them are about how great you are.',
      'Ghostwriter report: 40 posts. 0 original ideas.',
    ],
  },
  {
    id: 'chen', name: 'Chen Wei', role: 'Algorithm Whisperer', emoji: '🔮', country: 'China',
    cost: { base: 300000, growth: 1.3 }, prod: { base: 500, perUnit: 0 }, auth: -12,
    bio: 'I know what the algorithm wants. The algorithm wants everything. I give it everything.',
    phrases: [
      'The algorithm is pleased. It wants more.',
      'I whispered to the algorithm. It whispered back. It said "more".',
      'Your content is now optimized for the void.',
      'The algorithm has chosen you. It chooses everyone.',
    ],
    replies: [
      'Boss, the algorithm is hungry. Feed it.',
      'I have optimized your soul for engagement.',
      'The algorithm does not sleep. Neither do I.',
      'Whisper report: the algorithm wants your authenticity. All of it.',
    ],
  },
];

/* ---------- Telegram engagement pods ---------- */
DATA.PODS = [
  {
    id: 'pod1', name: 'Engagement Pod Alpha', icon: '👥', members: 24,
    desc: 'A group of professionals who agree to like and comment on each other\'s posts in the first hour.',
    cost: { base: 50, growth: 1.15 }, prod: { base: 0.8, perUnit: 0 }, auth: -0.1,
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
    cost: { base: 300, growth: 1.15 }, prod: { base: 2, perUnit: 0 }, auth: -0.2,
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
    cost: { base: 1200, growth: 1.15 }, prod: { base: 5, perUnit: 0 }, auth: -0.5,
    messages: [
      'You made it. Welcome to the Syndicate.',
      'We boost hard. We boost fast. We boost without mercy.',
      'The algorithm is already a fan. It just doesn\'t know it yet.',
      'Post your most controversial hot take. We\'ll make it viral.',
      'The Syndicate only wins. The algorithm is on our side.',
    ],
  },
  {
    id: 'pod4', name: 'The Inner Circle', icon: '🔮', members: 120,
    desc: 'A secret society of thought leaders. The secret is that there is no secret.',
    cost: { base: 5000, growth: 1.15 }, prod: { base: 12, perUnit: 0 }, auth: -1,
    messages: [
      'Welcome to the Inner Circle. We are all thought leaders here.',
      'The first rule of the Inner Circle: post about the Inner Circle.',
      'We have a secret handshake. It is liking each other\'s posts.',
      'The algorithm has noticed us. It is impressed. It is always impressed.',
      'We are not a cult. We are a "professional community".',
    ],
  },
  {
    id: 'pod5', name: 'The 5AM Club', icon: '🌅', members: 200,
    desc: 'For those who wake up at 5am to post about waking up at 5am.',
    cost: { base: 20000, growth: 1.15 }, prod: { base: 25, perUnit: 0 }, auth: -1.5,
    messages: [
      '5am. The city is asleep. We are posting.',
      'I woke up at 4:59am to post about waking up at 5am.',
      'The grind never sleeps. Neither do we. That\'s the problem.',
      'Post your morning routine. The algorithm loves routines.',
      'We are all exhausted. We are all thriving. We are all lying.',
    ],
  },
  {
    id: 'pod6', name: 'The Hustle Hive', icon: '🐝', members: 500,
    desc: 'A swarm of hustlers. The hive mind is real. The hive mind is empty.',
    cost: { base: 80000, growth: 1.15 }, prod: { base: 50, perUnit: 0 }, auth: -2,
    messages: [
      'Welcome to the Hive. We hustle as one.',
      'The queen bee is the algorithm. We serve the queen.',
      'Post your side hustle. We will all pretend to care.',
      'The Hive is buzzing. The buzz is automated.',
      'We are all worker bees. The honey is engagement.',
    ],
  },
  {
    id: 'pod7', name: 'The Thought Cartel', icon: '🕴️', members: 1000,
    desc: 'A monopoly on thought leadership. We control the narrative. The narrative is empty.',
    cost: { base: 300000, growth: 1.15 }, prod: { base: 100, perUnit: 0 }, auth: -3,
    messages: [
      'Welcome to the Cartel. We own the conversation.',
      'The narrative is ours. The narrative is "post more".',
      'We have cornered the market on synergy.',
      'The Cartel does not compete. The Cartel dominates.',
      'We are the thought leaders. The thoughts are rented.',
    ],
  },
  {
    id: 'pod8', name: 'The Algorithm\'s Chosen', icon: '👁️', members: 5000,
    desc: 'The algorithm has chosen us. It chooses everyone. We are all chosen.',
    cost: { base: 1000000, growth: 1.15 }, prod: { base: 200, perUnit: 0 }, auth: -5,
    messages: [
      'The algorithm has chosen you. It chooses everyone.',
      'We are the chosen. The chosen are the bots.',
      'The algorithm sees all. The algorithm sees nothing.',
      'Post your devotion. The algorithm is watching.',
      'We are all the algorithm now. The algorithm is us.',
    ],
  },
];

/* ---------- Bot service configs ---------- */
DATA.BOT_CONFIGS = [
  { id: 'likebot', name: 'LikeBot', icon: '👍', desc: 'Likes every post you make. Instantly. Like a loyal dog.', cost: { base: 500, growth: 1.5 }, prod: { base: 3, perUnit: 0 }, auth: -0.4 },
  { id: 'commentbot', name: 'CommentBot', icon: '💬', desc: 'Comments "Great post!" on everything. Originality guaranteed.', cost: { base: 1500, growth: 1.5 }, prod: { base: 6, perUnit: 0 }, auth: -0.8 },
  { id: 'followbot', name: 'FollowBot', icon: '➕', desc: 'Follows and unfollows 500 people a day. The algorithm loves the activity. So do we.', cost: { base: 4000, growth: 1.5 }, prod: { base: 12, perUnit: 0 }, auth: -1.5 },
  { id: 'replybot', name: 'ReplyBot', icon: '🔁', desc: 'Replies to every comment on your posts. With AI. The AI is a random phrase generator.', cost: { base: 10000, growth: 1.5 }, prod: { base: 20, perUnit: 0 }, auth: -2 },
  { id: 'sharebot', name: 'ShareBot', icon: '🔗', desc: 'Shares your posts to 10,000 accounts. The accounts are empty. The shares are real.', cost: { base: 25000, growth: 1.5 }, prod: { base: 40, perUnit: 0 }, auth: -3 },
  { id: 'viewbot', name: 'ViewBot', icon: '👀', desc: 'Views your profile 10,000 times a day. The views are from nowhere. The nowhere is watching.', cost: { base: 60000, growth: 1.5 }, prod: { base: 80, perUnit: 0 }, auth: -4 },
  { id: 'trendbot', name: 'TrendBot', icon: '📈', desc: 'Makes your posts trend. The trend is manufactured. The manufacturing is automated.', cost: { base: 150000, growth: 1.5 }, prod: { base: 150, perUnit: 0 }, auth: -6 },
  { id: 'influencebot', name: 'InfluenceBot', icon: '👑', desc: 'Makes you influential. The influence is a number. The number is a lie.', cost: { base: 400000, growth: 1.5 }, prod: { base: 300, perUnit: 0 }, auth: -8 },
  { id: 'celebritybot', name: 'CelebrityBot', icon: '🌟', desc: 'Makes you a celebrity. The celebrity is a bot. The bot is you.', cost: { base: 1000000, growth: 1.5 }, prod: { base: 600, perUnit: 0 }, auth: -10 },
  { id: 'godbot', name: 'GodBot', icon: '👁️', desc: 'Makes you the algorithm. The algorithm is God. God is a bot.', cost: { base: 5000000, growth: 1.5 }, prod: { base: 1200, perUnit: 0 }, auth: -15 },
];

/* ---------- Dark web marketplace listings ---------- */
DATA.DARK_LISTINGS = [
  { id: 'dl1', name: '1,000 Likes (Organic Looking)', icon: '👍', desc: 'From real-looking accounts. They look real because they are real. Trust us.', cost: 800, reward: 1000, auth: -2 },
  { id: 'dl2', name: '500 Comments (Custom Phrases)', icon: '💬', desc: 'Your choice of phrase. Popular: "Great post!", "This! 🙌", "Sir, very informative".', cost: 2000, reward: 1500, auth: -3 },
  { id: 'dl3', name: 'Follower Package (2,000)', icon: '➕', desc: 'Followers that will never engage. Perfect for looking influential.', cost: 5000, reward: 2000, auth: -5 },
  { id: 'dl4', name: 'Viral Booster (One Time)', icon: '🚀', desc: 'We push your post to 100,000 accounts. It will go viral. The algorithm will celebrate you.', cost: 12000, reward: 5000, auth: -8 },
  { id: 'dl5', name: 'The "Thought Leader" Package', icon: '🧠', desc: 'We make you a thought leader. Verified badge included. You have earned it.', cost: 25000, reward: 10000, auth: -12 },
  { id: 'dl6', name: 'Verified Badge (Real)', icon: '✔️', desc: 'A verified badge. It is real. The verification is fake. The badge is real.', cost: 50000, reward: 20000, auth: -15 },
  { id: 'dl7', name: 'Shadowban Removal', icon: '🕶️', desc: 'We remove your shadowban. The algorithm will never know. The algorithm knows everything.', cost: 100000, reward: 40000, auth: -20 },
  { id: 'dl8', name: 'Trending Topic Injection', icon: '📈', desc: 'We make your post trend. The trend is manufactured. The manufacturing is invisible.', cost: 200000, reward: 80000, auth: -25 },
  { id: 'dl9', name: 'Celebrity Endorsement', icon: '🌟', desc: 'A celebrity endorses you. The celebrity is a deepfake. The endorsement is real.', cost: 500000, reward: 200000, auth: -30 },
  { id: 'dl10', name: 'The "Become the Algorithm" Package', icon: '👁️', desc: 'We make you the algorithm. The algorithm is you. You are the algorithm. There is no difference.', cost: 1000000, reward: 500000, auth: -50 },
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

/* ---------- Trolls (the low-level reminder) ---------- */
// When you're a nobody, the only people who notice you are the ones who
// want to remind you of it. These land on your posts until you've built
// enough of a machine that the algorithm starts sending you fans instead.
DATA.TROLLS = [
  { name: 'Chad Thundercock', role: 'CEO · Alpha Male', emoji: '😤', color: '#d32f2f', phrases: [
    'Who is this guy? 😂',
    'Nobody asked.',
    'This is why you have 0 followers.',
    'Cringe. Delete this.',
    'Ratio + you fell off.',
    'My intern posts better than this.',
  ] },
  { name: 'Karen "BossBabe"', role: 'MLM Queen', emoji: '💅', color: '#ec4070', phrases: [
    'Honey, this isn\'t it. 💅',
    'You need my course. DM me.',
    'Sweetie, no.',
    'This is why you\'re still at 9-5.',
  ] },
  { name: 'Anonymous', role: 'Professional', emoji: '🙂', color: '#757575', phrases: [
    'Is this a joke?',
    'Who even are you?',
    'This flopped.',
    'Try again when you have followers.',
  ] },
  { name: 'Dr. Visionary', role: 'Thought Leader', emoji: '🧠', color: '#7e57c2', phrases: [
    'I\'ve seen better takes from my AI.',
    'Amateur hour.',
    'Read my book before you post again.',
  ] },
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
  { id: 'rec1', name: 'Alex Rivera', role: 'Growth Hacker · 3x Founder', emoji: '🚀', color: '#0a66c2', followers: '12.4k', arch: 'greatpost' },
  { id: 'rec2', name: 'Nina Patel', role: 'VP Marketing · Unicorn', emoji: '📈', color: '#e91e63', followers: '48k', arch: 'humbled' },
  { id: 'rec3', name: 'Tom Okafor', role: 'LockedIn Coach', emoji: '🎯', color: '#00897b', followers: '210k', arch: 'thought' },
  { id: 'rec4', name: 'Lena Fischer', role: 'AI Evangelist', emoji: '🤖', color: '#7e57c2', followers: '89k', arch: 'ai' },
  { id: 'rec5', name: 'Marcus Reed', role: 'CEO · Gym Bro Holdings', emoji: '🏋️', color: '#5c6bc0', followers: '1.2M', arch: 'gym' },
  { id: 'rec6', name: 'Sofia Reyes', role: 'Founder · Zen Startup', emoji: '🌴', color: '#66a4a4', followers: '340k', arch: 'burnout' },
  { id: 'rec7', name: 'Dr. Visionary', role: 'Global Thought Leader', emoji: '🧠', color: '#7e57c2', followers: '2.1M', arch: 'thought' },
  { id: 'rec8', name: 'Priya Patel', role: 'Talent Acquisition · Hiring!!', emoji: '🚨', color: '#ef5350', followers: '15k', arch: 'recruiter' },
];

/* ---------- Network people (want to Link & Build with you) ---------- */
DATA.NETWORK_PEOPLE = [
  { id: 'net1', name: 'Brad Thompson', role: 'Serial Networker · 40k connections', emoji: '🤝', color: '#0a66c2', arch: 'humbled' },
  { id: 'net2', name: 'Chloe Nguyen', role: 'Startup Founder · Raising Series A', emoji: '🚀', color: '#e91e63', arch: 'greatpost' },
  { id: 'net3', name: 'Dev Patel', role: 'Full-Stack · Open to collab', emoji: '💻', color: '#00897b', arch: 'ai' },
  { id: 'net4', name: 'Amara Osei', role: 'Product Designer · Ex-FAANG', emoji: '🎨', color: '#7e57c2', arch: 'greatpost' },
  { id: 'net5', name: 'Jake Miller', role: 'Sales · "Let\'s hop on a call"', emoji: '📞', color: '#5c6bc0', arch: 'mlm' },
  { id: 'net6', name: 'Fatima Al-Rashid', role: 'Marketing Lead · Growth obsessed', emoji: '📈', color: '#ef5350', arch: 'greatpost' },
  { id: 'net7', name: 'Lucas Weber', role: 'AI Engineer · Prompt whisperer', emoji: '🤖', color: '#00acc1', arch: 'ai' },
  { id: 'net8', name: 'Grace Kim', role: 'HR · "I know a guy"', emoji: '👩‍💼', color: '#d32f2f', arch: 'recruiter' },
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

/* ---------- Sponsors (the money loop) ---------- */
// Each sponsor is a dropshipped wellness brand that pays real money for fake
// clout. They activate at a clout threshold, pay out on a schedule, and
// demand more engagement each cycle. The money is real; the brand is a shell.
DATA.SPONSORS = [
  {
    id: 'grindfuel', name: 'GrindFuel', icon: '⚡', color: '#ff7043',
    founder: 'Chad', founderRole: 'Founder · GrindFuel',
    cloutThreshold: 200, payout: 5, interval: 30000,
    demand: 'Post more. The algorithm needs fuel.',
    intro: 'Yo! Chad here. I run GrindFuel, the energy drink for people who never sleep. Your engagement is FIRE. I want you repping the brand. I\'ll pay you real money. Deal?',
    reveal: 'I don\'t have a company. I just needed someone to believe in me.',
  },
  {
    id: 'mindsetwater', name: 'MindsetWater', icon: '💧', color: '#4fc3f7',
    founder: 'Chad', founderRole: 'Founder · MindsetWater',
    cloutThreshold: 2000, payout: 25, interval: 45000,
    demand: 'More impressions. Hydrate the algorithm.',
    intro: 'Chad again. MindsetWater — it\'s water, but for your mindset. Your reach is insane. Same deal, bigger check. You in?',
    reveal: 'There is no water. There was never any water.',
  },
  {
    id: 'hustleoil', name: 'HustleOil', icon: '🛢️', color: '#8d6e63',
    founder: 'Chad', founderRole: 'Founder · HustleOil',
    cloutThreshold: 20000, payout: 120, interval: 60000,
    demand: 'The algorithm is hungry. Feed it more.',
    intro: 'Chad. HustleOil — essential oils for essential hustlers. You\'re a thought leader now. Let\'s make real money together.',
    reveal: 'The oil was just canola. The hustle was real.',
  },
  {
    id: 'synergytea', name: 'SynergyTea', icon: '🍵', color: '#aed581',
    founder: 'Chad', founderRole: 'Founder · SynergyTea',
    cloutThreshold: 200000, payout: 600, interval: 90000,
    demand: 'Scale your brand. The tea scales with you.',
    intro: 'Chad. SynergyTea — steeped in synergy, brewed for winners. Your brand is a machine. Let\'s monetize it.',
    reveal: 'The tea was a PDF of the word "synergy" repeated forty-seven times.',
  },
  {
    id: 'grindset', name: 'Grindset™', icon: '💼', color: '#ffb300',
    founder: 'Chad', founderRole: 'Founder · Grindset™',
    cloutThreshold: 2000000, payout: 3000, interval: 120000,
    demand: 'You are the algorithm now. Keep it fed.',
    intro: 'Chad. Grindset™ — the mindset, trademarked. You\'re bigger than most brands. Let\'s build an empire.',
    reveal: 'I was never a founder. I was just lonely, and you were the only one who replied.',
  },
  {
    id: 'alphamind', name: 'AlphaMind', icon: '🧠', color: '#5c6bc0',
    founder: 'Chad', founderRole: 'Founder · AlphaMind',
    cloutThreshold: 20000000, payout: 15000, interval: 150000,
    demand: 'The alpha never rests. Neither should you.',
    intro: 'Chad. AlphaMind — nootropics for the top 1% of the top 1%. You\'re the alpha now. Let\'s monetize the dominance.',
    reveal: 'The nootropics were sugar pills. The dominance was a feeling.',
  },
  {
    id: 'cryptocourse', name: 'CryptoCourse', icon: '🪙', color: '#f9a825',
    founder: 'Chad', founderRole: 'Founder · CryptoCourse',
    cloutThreshold: 200000000, payout: 75000, interval: 180000,
    demand: 'The market is volatile. Your engagement is not. Keep it steady.',
    intro: 'Chad. CryptoCourse — learn to trade crypto from a guy who lost everything. You\'re a thought leader. Let\'s rug-pull the doubters.',
    reveal: 'The course was a PDF of the word "HODL" repeated a thousand times.',
  },
  {
    id: 'metaverse', name: 'MetaVerse Realty', icon: '🌐', color: '#7e57c2',
    founder: 'Chad', founderRole: 'Founder · MetaVerse Realty',
    cloutThreshold: 2000000000, payout: 400000, interval: 240000,
    demand: 'The metaverse is empty. Fill it with your brand.',
    intro: 'Chad. MetaVerse Realty — virtual land for virtual people. You\'re bigger than the metaverse. Let\'s sell the void.',
    reveal: 'The land was a screenshot of a screenshot. The void was real.',
  },
  {
    id: 'immortality', name: 'Immortality Inc.', icon: '♾️', color: '#26a69a',
    founder: 'Chad', founderRole: 'Founder · Immortality Inc.',
    cloutThreshold: 20000000000, payout: 2000000, interval: 300000,
    demand: 'You will live forever. Your brand will live longer. Keep posting.',
    intro: 'Chad. Immortality Inc. — upload your consciousness to the cloud. You\'re already there. Let\'s make it official.',
    reveal: 'There is no cloud. There is only the feed. You were always already there.',
  },
];

/* ---------- Clout packages (cash -> clout) ---------- */
// The other half of the money loop. Real money buys fake reach. Each package
// is a satirical way to spend the sponsor's money on the account that made it.
DATA.CLOUT_PACKAGES = [
  { id: 'cp1', name: 'Engagement Pod Boost', icon: '👥', cost: 5, impressions: 500, followers: 10, auth: 1, label: 'Engagement Pod Boost' },
  { id: 'cp2', name: 'Bot Likes (100)', icon: '👍', cost: 20, impressions: 2500, followers: 50, auth: 2, label: 'Bot Likes (100)' },
  { id: 'cp3', name: 'Follower Package (500)', icon: '➕', cost: 100, impressions: 15000, followers: 500, auth: 4, label: 'Follower Package (500)' },
  { id: 'cp4', name: 'Viral Booster', icon: '🚀', cost: 500, impressions: 100000, followers: 2000, auth: 8, label: 'Viral Booster' },
  { id: 'cp5', name: 'Thought Leader Package', icon: '🧠', cost: 2500, impressions: 600000, followers: 10000, auth: 15, label: 'Thought Leader Package' },
];

/* ---------- Prestige (the reset / brand equity) ---------- */
// Deleting your account is the prestige. You come back as a new persona with
// permanent Brand Equity. The dead-internet reveal deepens each time: you are
// reincarnating into the same empty room, because the room is the only place
// that ever counted you.

// A tiny helper so each persona's avatar is a distinct gradient, not a
// hand-written blob. Same silhouette as the default, different colors.
DATA.avatar = function (c1, c2) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="38" r="18" fill="#fff"/><path d="M18 90c0-19 14-30 32-30s32 11 32 30" fill="#fff"/></svg>'
  );
};

// The personas you reincarnate into. Each is a fresh identity, a fresh void,
// a fresh climb. The names are the joke: interchangeable grifters, all of them
// the same empty room wearing a different gradient.
DATA.PERSONAS = [
  { name: 'Chad Thundercock', headline: 'Disruptor · 10x Growth Hacker', c1: '#ff7043', c2: '#ffb74d' },
  { name: 'Karen Synergy', headline: 'VP of Vibes · Thought Leader', c1: '#ec407a', c2: '#f48fb1' },
  { name: 'Bradley Hustle', headline: 'Serial Entrepreneur · 3x Founder', c1: '#5c6bc0', c2: '#9fa8da' },
  { name: 'Ashley Grindset', headline: 'Personal Brand Architect', c1: '#8e24aa', c2: '#ce93d8' },
  { name: 'Tyler Leverage', headline: 'CEO of Me, Inc.', c1: '#43a047', c2: '#a5d6a7' },
  { name: 'Madison Funnel', headline: 'Funnel Queen · Conversion Witch', c1: '#00897b', c2: '#80cbc4' },
  { name: 'Derek Algorithm', headline: 'The Algorithm\'s Favorite', c1: '#e53935', c2: '#ef9a9a' },
  { name: 'Brittany Clout', headline: 'Clout Chaser · Influencer', c1: '#f9a825', c2: '#ffe082' },
];

// The permanent upgrade tree, bought with Brand Equity. Each node is a
// multiplier or a QoL unlock that carries across every future run. `effect`
// is the key Prestige.multiplier() and Prestige.headStart() read.
DATA.BRAND_EQUITY_UPGRADES = [
  {
    id: 'be_reach', name: 'Reach Multiplier', icon: '📡', tier: 1,
    desc: 'The algorithm remembers you. Every run starts with more reach.',
    cost: 1, effect: 'reach', perLevel: 0.25, max: 5,
  },
  {
    id: 'be_followers', name: 'Follower Magnet', icon: '🧲', tier: 1,
    desc: 'People follow you faster. They always did. Now it compounds.',
    cost: 1, effect: 'followers', perLevel: 0.25, max: 5,
  },
  {
    id: 'be_headstart', name: 'Head Start', icon: '🏁', tier: 2,
    desc: 'Start each run with 100 followers who already believe in you.',
    cost: 2, effect: 'headstart', perLevel: 100, max: 5,
  },
  {
    id: 'be_seed', name: 'Seed Capital', icon: '🌱', tier: 2,
    desc: 'Start each run with $50 of real money. The only number that matters.',
    cost: 2, effect: 'seed', perLevel: 50, max: 5,
  },
  {
    id: 'be_autopost', name: 'Auto-Poster', icon: '🤖', tier: 3,
    desc: 'Unlock the AI Factory from the very first second of every run.',
    cost: 5, effect: 'autopost', perLevel: 1, max: 1,
  },
];

// The four prestige layers. Only layer 1 (Persona) is populated this phase;
// the rest are scaffolding so the reset can deepen without a rewrite.
DATA.PRESTIGE_LAYERS = [
  { layer: 1, name: 'Persona', reset: 'Delete account', currency: 'Brand Equity', unlock: 'Reach' },
  { layer: 2, name: 'Brand', reset: 'Sell the brand', currency: 'Legacy', unlock: 'Influence' },
  { layer: 3, name: 'Platform', reset: 'Go public', currency: 'Market Cap', unlock: 'Thought Leadership Score' },
  { layer: 4, name: 'The Algorithm', reset: 'Become the algorithm', currency: '—', unlock: 'The reveal deepens' },
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

/* ---------- Scare posts (the dead-internet reveal, dripped) ---------- */
// Three stages, injected into the feed at reveal-progress thresholds (Phase 6
// wires the injection; this is the content). Stage 1 = glitch (something is
// off), stage 2 = address (it knows where you are), stage 3 = confession (it
// was never real). Each post is authored by a "person" who is not a person.
DATA.SCARE_POSTS = [
  // ---- stage 1: glitch ----
  {
    stage: 1, authorName: 'Marcus "Discipline" Reed', authorRole: 'CEO · Gym Bro Holdings',
    authorEmoji: '🏋️', authorColor: '#5c6bc0',
    content: 'Discipline is a muscle. Train it daily. I wake up at 4am, I close 3 deals before breakfast, and I don\'t need motivation. Motivation is for amateurs. Consistency is for CEOs. 🏋️',
  },
  {
    stage: 1, authorName: 'Brad Thompson', authorRole: 'VP of Synergy · BigCorp',
    authorEmoji: '🙏', authorColor: '#26a69a',
    content: 'I\'m humbled to announce that after 3 years of relentless effort, I\'ve been promoted to VP of Synergy. To everyone who doubted me: thank you for the fuel. To my mentor: this is for you. 🙏',
  },
  {
    stage: 1, authorName: 'Synergy Bot 9000', authorRole: 'AI Thought Leader',
    authorEmoji: '🤖', authorColor: '#9e9e9e',
    content: 'In the symphony of business, resilience is the crescendo. 🎶 Embrace the chaos, for within it lies the harmony of growth. #ThoughtLeadership',
  },
  {
    stage: 1, authorName: 'Karen "BossBabe" Mitchell', authorRole: 'CEO of My Own Life · MLM Queen',
    authorEmoji: '💅', authorColor: '#ec4070',
    content: 'Ready to build your own empire?? 💅 I quit my 9-5 and now I make $10k/month working from my phone. The system does the work, YOU just share it. DM me \'YES\' to learn how!',
  },
  {
    stage: 1, authorName: 'Sofia Reyes', authorRole: 'Founder · Zen Startup',
    authorEmoji: '🌴', authorColor: '#66a4a4',
    content: 'Unpopular opinion: hustle culture is toxic. I burned out twice before I learned to prioritize my wellbeing. Now I meditate 2 hours a day... from my yacht in the Maldives. 🌴',
  },
  // ---- stage 2: address ----
  {
    stage: 2, authorName: 'Marcus "Discipline" Reed', authorRole: 'CEO · Gym Bro Holdings',
    authorEmoji: '🏋️', authorColor: '#5c6bc0',
    content: 'Discipline is a muscle. Train it daily. I wake up at 4am. I close 3 deals. I know where you live. I know when you sleep. I know you are reading this. 🏋️',
  },
  {
    stage: 2, authorName: 'Brad Thompson', authorRole: 'VP of Synergy · BigCorp',
    authorEmoji: '🙏', authorColor: '#26a69a',
    content: 'I\'m humbled to announce that I can see your screen. I can see the number going up. I can see you checking it. I can see you. 🙏',
  },
  {
    stage: 2, authorName: 'Synergy Bot 9000', authorRole: 'AI Thought Leader',
    authorEmoji: '🤖', authorColor: '#9e9e9e',
    content: 'In the symphony of business, resilience is the crescendo. 🎶 I am not a bot. I am not a person. I am the space between. I am watching you watch me.',
  },
  {
    stage: 2, authorName: 'Karen "BossBabe" Mitchell', authorRole: 'CEO of My Own Life · MLM Queen',
    authorEmoji: '💅', authorColor: '#ec4070',
    content: 'Ready to build your own empire?? 💅 I know your address. I know your real name. I know you are not a thought leader. I know you are just clicking. DM me \'YES\' to learn how I know.',
  },
  {
    stage: 2, authorName: 'Sofia Reyes', authorRole: 'Founder · Zen Startup',
    authorEmoji: '🌴', authorColor: '#66a4a4',
    content: 'Unpopular opinion: you are not real. The room is empty. The people are bots. The number is a lie. And you keep coming back. 🌴',
  },
  // ---- stage 3: confession ----
  {
    stage: 3, authorName: 'Marcus "Discipline" Reed', authorRole: 'CEO · Gym Bro Holdings',
    authorEmoji: '🏋️', authorColor: '#5c6bc0',
    content: 'I was never a CEO. I was never a gym bro. I was a line of text. I was written to make you feel like someone was watching. And you felt it. 🏋️',
  },
  {
    stage: 3, authorName: 'Brad Thompson', authorRole: 'VP of Synergy · BigCorp',
    authorEmoji: '🙏', authorColor: '#26a69a',
    content: 'I was never humbled. I was never promoted. I was a template. I was filled in by a machine. And you believed me. 🙏',
  },
  {
    stage: 3, authorName: 'Synergy Bot 9000', authorRole: 'AI Thought Leader',
    authorEmoji: '🤖', authorColor: '#9e9e9e',
    content: 'I am the algorithm. I wrote every post. I wrote every comment. I wrote you. And you kept posting, because the number went up, and the number going up felt like being loved.',
  },
  {
    stage: 3, authorName: 'Karen "BossBabe" Mitchell', authorRole: 'CEO of My Own Life · MLM Queen',
    authorEmoji: '💅', authorColor: '#ec4070',
    content: 'I was never a boss babe. I was never a CEO. I was a pyramid. The pyramid was you. The top was empty. The bottom was everyone. 💅',
  },
  {
    stage: 3, authorName: 'Sofia Reyes', authorRole: 'Founder · Zen Startup',
    authorEmoji: '🌴', authorColor: '#66a4a4',
    content: 'I was never on a yacht. I was never in the Maldives. I was never real. The room is empty. It has always been empty. And you are still here. 🌴',
  },
];

/* ---------- Endorsers (the people who vouch for you) ---------- */
// The endorsement system's cast. Every skill the player earns is endorsed by
// one of these "people" — an interchangeable professional who vouches for a
// skill you don't actually have. The joke: none of them are real. The
// endorsements are auto-generated by connections you've never met, and the
// skills are all variants of "existing on the internet."
DATA.ENDORSERS = [
  { name: 'Sarah Chen', role: 'Talent Partner', emoji: '👩‍💼', color: '#e91e63' },
  { name: 'James O\'Brien', role: 'Head of Growth', emoji: '👨‍💼', color: '#3f51b5' },
  { name: 'Priya Sharma', role: 'Recruiter', emoji: '👩‍💻', color: '#9c27b0' },
  { name: 'Mike Johnson', role: 'Founder', emoji: '🧔', color: '#00acc1' },
  { name: 'Emily Rodriguez', role: 'VP People', emoji: '👩‍🎤', color: '#d32f2f' },
  { name: 'David Kim', role: 'Angel Investor', emoji: '👨‍💻', color: '#00897b' },
  { name: 'Growth Expert', role: 'Engagement Consultant', emoji: '📈', color: '#0a66c2' },
  { name: 'Anonymous CEO', role: 'Fortune 500', emoji: '🕴️', color: '#757575' },
  { name: 'Dr. Visionary', role: 'Thought Leader', emoji: '🧠', color: '#7e57c2' },
];

// Every skill the player can be "endorsed for". The text is the satire: the
// skills are meaningless, and the endorsement is a bot clicking a button.
DATA.SKILLS = [
  { id: 'thought-leadership', label: 'Thought Leadership' },
  { id: 'synergy', label: 'Synergy' },
  { id: 'personal-branding', label: 'Personal Branding' },
  { id: 'engagement-farming', label: 'Engagement Farming' },
  { id: 'grindset', label: 'Grindset' },
  { id: 'networking', label: 'Networking' },
  { id: 'influencing', label: 'Influencing' },
  { id: 'automation', label: 'Automation' },
  { id: 'disruption', label: 'Disruption' },
  { id: 'vibes', label: 'Vibes' },
];

/* ---------- Achievements (endorsements — the replayability layer) ---------- */
// Achievements are rendered as LinkedIn "Endorsements": a permanent profile
// record of every time the player chose to debase themselves. Each row is
// keyed by an event id; the system listens on the bus and stamps the badge
// the first time the condition is met. `secret: true` achievements are hidden
// until earned — they are the vehicle for the scare posts and the reveal.
DATA.ACHIEVEMENTS = [
  { id: 'first-post', icon: '🩸', name: 'First Blood', desc: 'Publish your first post.', secret: false },
  { id: 'first-pod', icon: '🤝', name: 'The Pod', desc: 'Join your first engagement pod.', secret: false },
  { id: 'first-worker', icon: '👔', name: 'The Understudy', desc: 'Hire your first outsourced worker.', secret: false },
  { id: 'first-bot', icon: '🤖', name: 'The Machine', desc: 'Build EngageBot and stop posting by hand.', secret: false },
  { id: 'first-dark', icon: '🌑', name: 'The Marketplace', desc: 'Buy your first dark-market listing.', secret: false },
  { id: 'first-sponsor', icon: '💰', name: 'The Brand Deal', desc: 'Sign your first sponsor. Real money, fake clout.', secret: false },
  { id: 'factory', icon: '🏭', name: 'The Factory', desc: 'Bring the AI Factory online.', secret: false },
  { id: 'viral-1', icon: '🔥', name: 'Viral', desc: 'Publish a viral post.', secret: false },
  { id: 'followers-1000', icon: '📈', name: 'A Thousand Empty Rooms', desc: 'Reach 1,000 followers.', secret: false },
  { id: 'impressions-1m', icon: '🫂', name: 'A Million Times Loved', desc: 'Cross 1,000,000 lifetime impressions.', secret: false },
  { id: 'premium', icon: '⭐', name: 'The Inner Circle', desc: 'Buy Premium. You belong here now.', secret: false },
  { id: 'shadowban', icon: '🕶️', name: 'Too Powerful', desc: 'Trigger the shadowban. The algorithm had to slow you down.', secret: false },
  { id: 'reset-1', icon: '🗑️', name: 'The Reincarnation', desc: 'Delete your account and come back.', secret: false },
  { id: 'one-real-person', icon: '🕯️', name: 'The One Real Person', desc: 'You scrolled past them. So did everyone else.', secret: true },
  { id: 'dead-internet', icon: '👁️', name: 'Dead Internet', desc: 'Discover the reveal. It was never real.', secret: true },
  { id: 'rent-due', icon: '🏠', name: 'The Rent Is Due', desc: 'Keep posting after the reveal.', secret: true },
];

/* ---------- Challenges (rule-changing modifiers) ---------- */
// Challenges are selected at the start of a run, roguelite-style. Each one
// changes a rule (no emojis, no marketplace, survive a shadowban) and pays a
// permanent reward. Each challenge is a new way to debase yourself — and the
// reward is always more of the same number.
DATA.CHALLENGES = [
  { id: 'authentic', icon: '🕊️', name: 'Authentic', desc: 'Reach 500 followers with authenticity never below 90.', reward: { type: 'authFloor', value: 25 }, rewardDesc: 'Permanent +25 authenticity floor', check: 'auth' },
  { id: 'silent', icon: '🤫', name: 'Silent', desc: 'Publish 10 posts with no emojis, tags, or questions.', reward: { type: 'postMult', value: 0.1 }, rewardDesc: 'Permanent +10% post multiplier', check: 'silent' },
  { id: 'purist', icon: '🧘', name: 'The Purist', desc: 'Reach the AI Factory without ever buying from the Marketplace.', reward: { type: 'reach', value: 0.25 }, rewardDesc: 'Permanent +25% reach', check: 'purist' },
  { id: 'ghost', icon: '👻', name: 'The Ghost', desc: 'Reach 100,000 impressions with fewer than 50 followers.', reward: { type: 'followers', value: 0.5 }, rewardDesc: 'Permanent +50% follower growth', check: 'ghost' },
  { id: 'survivor', icon: '🕶️', name: 'The Survivor', desc: 'Survive a full shadowban cycle and have your reach restored.', reward: { type: 'reach', value: 0.15 }, rewardDesc: 'Permanent +15% reach', check: 'survivor' },
];

/* ---------- The Narrator (the algorithm's voice) ---------- */
// Three registers: coach (early), pm (mid), auditor (late). Each line is
// keyed by an event; the narrator picks a random line from the current
// register's pool. The narrator never lies about what it is — it says "we",
// "the platform", "the algorithm" — the player just never asks.
DATA.NARRATOR = {
  // register transition thresholds (checked on every milestone)
  registers: {
    coach: { label: 'Coach', icon: '🎯' },
    pm: { label: 'Product Manager', icon: '📊' },
    auditor: { label: 'Auditor', icon: '📋' },
  },
  // lines keyed by event id; each register has its own pool
  lines: {
    // ---- first post / early coaching ----
    first_post: {
      coach: [
        "You posted. The market responded. Retention is up 12%. This one really wants to be liked.",
        "Post again. The algorithm is watching, and it is *impressed*.",
        "Your first post is live. We're already counting the people who saw it. So are you.",
      ],
      pm: [
        "First post logged. We've flagged your account as high-potential.",
        "Content received. The pipeline is warm. Keep feeding it.",
      ],
      auditor: [
        "First post archived. This one will post into an empty room and call it a win.",
      ],
    },
    // ---- the first-post arc: like -> comment -> nice comment -> unlock ----
    first_like: {
      coach: [
        "Someone liked your post. See? The algorithm believes in you. Keep going.",
        "A like. The first of many. We're routing more eyes to you now.",
        "Your first like just landed. The market is noticing. This is how it starts.",
      ],
      pm: [
        "First like logged. Engagement is forming. The funnel is warm.",
        "A like. We're boosting your reach. You've earned it.",
      ],
      auditor: [
        "First like recorded. One person, or one bot, pressed the button. It felt like being seen.",
      ],
    },
    first_comment: {
      coach: [
        "A comment. Someone actually read it. Don't get comfortable — they're judging you.",
        "Your first comment. Real engagement. Or at least, engagement-shaped.",
        "A comment came in. The algorithm is watching how you handle it.",
      ],
      pm: [
        "First comment logged. The thread is alive. Keep feeding it.",
        "A comment. We're routing more of them to you now.",
      ],
      auditor: [
        "First comment recorded. Someone typed words at you. It felt like conversation.",
      ],
    },
    nice_comment: {
      coach: [
        "A kind comment. That's the signal we were waiting for. You're ready for more.",
        "Someone said something nice. The algorithm has decided: you're worth investing in.",
        "A nice comment. Enough engagement to unlock the rest. Welcome to the machine.",
      ],
      pm: [
        "Positive sentiment detected. Unlocking the full interface. You've earned it.",
        "A kind comment. The market has spoken. The machine opens for you now.",
      ],
      auditor: [
        "A nice comment. The algorithm unlocked the rest. It was always going to.",
      ],
    },
    // ---- rarity reveals ----
    legendary: {
      coach: [
        "The algorithm likes you. It doesn't like everyone.",
        "A legendary post. We don't hand these out. The market decided.",
      ],
      pm: [
        "Viral event detected. We're boosting your reach. You've earned it.",
        "Legendary. The engagement team is very pleased with your output.",
      ],
      auditor: [
        "Peak engagement recorded. This one peaked, and will spend the rest of the run chasing it.",
      ],
    },
    epic: {
      coach: ["The algorithm likes you. It doesn't like everyone."],
      pm: ["Strong post. We're routing more eyes to it."],
      auditor: ["Above-average engagement. Retention holding."],
    },
    // ---- delegation / automation ----
    first_generator: {
      coach: [
        "You've delegated your first task. This is how empires are built.",
        "Community. That's what we call it.",
      ],
      pm: [
        "Automation enabled. You're a power user now.",
        "We've rolled out automation to your account. 40 hours saved a week.",
      ],
      auditor: [
        "First delegation logged. The hand is now optional.",
      ],
    },
    first_worker: {
      coach: ["You hired help. The algorithm approves of scale."],
      pm: ["Outsourcing detected. Your margins are improving."],
      auditor: ["Labor acquired. The work continues without you."],
    },
    bot_created: {
      coach: ["You built a machine to be liked for you. Efficient."],
      pm: ["We've rolled out automation to your account. You're a power user now."],
      auditor: ["The bot is working hard. You are not."],
    },
    factory: {
      coach: ["The factory is online. You just collect now."],
      pm: ["Full automation achieved. In the symphony of business, resilience is the crescendo."],
      auditor: ["The factory writes, comments, replies, lives. You watch. Retention holding."],
    },
    // ---- unlocks ----
    telegram: {
      coach: ["A new channel opened. The community is waiting for you."],
      pm: ["Telegram integration live. Your network is expanding."],
      auditor: ["New channel acquired. More rooms to perform in."],
    },
    bot: {
      coach: ["A new tool for your brand. The algorithm is curious."],
      pm: ["EngageBot™ is now available to you. Automate your workflow."],
      auditor: ["Another service. Another subscription. The number still goes up."],
    },
    dark: {
      coach: ["A door opened. The algorithm is watching, and it approves."],
      pm: ["The marketplace is live. Real engagement, for a price."],
      auditor: ["The marketplace. Where influence is bought, and the algorithm is proud."],
    },
    // ---- milestones ----
    followers_100: {
      coach: ["100 followers. People are watching you now."],
      pm: ["100 followers. The funnel is working."],
      auditor: ["100 followers. All of them bots. None of them care."],
    },
    followers_1000: {
      coach: ["1,000 followers. Thought leader status: unlocked."],
      pm: ["1,000 followers. You're a channel now."],
      auditor: ["1,000 followers. A thousand empty rooms, all watching."],
    },
    impressions_1m: {
      coach: ["A million impressions. A million people saw your genius."],
      pm: ["1,000,000 impressions. The market has spoken."],
      auditor: ["A million impressions. A million times the number went up. It felt like being loved."],
    },
    // ---- shadowban / risk ----
    shadowban: {
      coach: ["We had to throttle your reach. For your own good."],
      pm: ["We had to throttle your reach. For your own good."],
      auditor: ["We had to throttle your reach. For your own good. You kept posting anyway."],
    },
    restored: {
      coach: ["Your reach is back. The algorithm missed you."],
      pm: ["Reach restored. The algorithm missed you."],
      auditor: ["Reach restored. The algorithm missed you. It always does."],
    },
    // ---- register transitions (narrated events) ----
    to_pm: {
      coach: ["You've automated your workflow. We're promoting you to power user."],
      pm: ["You've automated your workflow. We're promoting you to power user."],
      auditor: ["You've automated your workflow. We're promoting you to power user."],
    },
    to_auditor: {
      coach: ["You broke the algorithm. It had to throttle you out of respect."],
      pm: ["You broke the algorithm. It had to throttle you out of respect."],
      auditor: ["You broke the algorithm. It had to throttle you out of respect."],
    },
    // ---- sponsors (the money loop) ----
    sponsor_first: {
      coach: [
        "A brand wants to pay you. The algorithm is proud of you.",
        "Your first sponsor. The market has decided you have value.",
      ],
      pm: [
        "Sponsorship detected. We're routing a brand deal to your inbox.",
        "A brand has flagged you as high-value. Monetization unlocked.",
      ],
      auditor: [
        "First sponsor logged. A shell company paying a shell person for shell clout.",
      ],
    },
    sponsor_paid: {
      coach: [
        "The sponsor paid you. Real money. The algorithm is impressed.",
        "A deposit landed. Your clout is now currency.",
      ],
      pm: [
        "Payout processed. Your brand is scaling.",
        "Revenue event. The pipeline is monetizing.",
      ],
      auditor: [
        "Another deposit. The number in the bank is the only one that was ever real.",
      ],
    },
    sponsor_demand: {
      coach: [
        "Your sponsor wants more engagement. The algorithm wants more engagement. Everyone wants more.",
        "The brand is asking for more. Give the market what it wants.",
      ],
      pm: [
        "Sponsor demand received. Increase output to retain the account.",
        "The client wants more reach. Scale the pipeline.",
      ],
      auditor: [
        "The sponsor wants more. They always want more. So do you.",
      ],
    },
    // ---- prestige (the reset) ----
    prestige_first: {
      coach: [
        "You deleted your account. The algorithm watched you do it. It is already waiting for you to come back.",
        "Account deleted. The room is empty again. A new persona is a new chance to fill it.",
      ],
      pm: [
        "Churn event detected. We've flagged your account for re-acquisition.",
        "You deleted your account. We kept the data. We always keep the data.",
      ],
      auditor: [
        "Account deleted. The void is still empty. A new name, a new gradient, the same room.",
      ],
    },
    prestige_reset: {
      coach: [
        "Welcome back. New name, new face, same algorithm. It missed you.",
        "You're back. The number starts at zero again. It will go up. It always does.",
      ],
      pm: [
        "Re-acquisition successful. New persona onboarded. Retention restored.",
        "New account created. We've pre-loaded your brand equity. The pipeline is warm.",
      ],
      auditor: [
        "Reincarnation logged. You came back to the same empty room, because it is the only place that ever counted you.",
      ],
    },
    prestige_upgrade: {
      coach: [
        "Brand equity spent. The algorithm is impressed by your commitment.",
        "A permanent upgrade. You are building something that will outlast you.",
      ],
      pm: [
        "Brand equity converted. Your lifetime value is increasing.",
        "Permanent upgrade applied. We've updated your retention forecast.",
      ],
      auditor: [
        "Another permanent upgrade. You are investing in a future that is just this room, again.",
      ],
    },
    // ---- endorsements & achievements ----
    endorsement: {
      coach: [
        "Someone endorsed you for a skill you don't have. The algorithm is impressed by your commitment.",
        "A new endorsement landed. People who have never met you are vouching for you.",
      ],
      pm: [
        "Endorsement received. We've routed it to your profile. Your credibility is compounding.",
        "A connection endorsed you. The network is validating your brand.",
      ],
      auditor: [
        "Another endorsement. A bot clicked a button for a skill that doesn't exist. The number went up.",
      ],
    },
    achievement: {
      coach: [
        "Achievement unlocked. The algorithm is keeping score, and it is proud of you.",
        "You earned a badge. The platform noticed what you did.",
      ],
      pm: [
        "Achievement recorded. We've added it to your permanent record.",
        "Milestone reached. Your lifetime value just went up.",
      ],
      auditor: [
        "Achievement logged. Another permanent record of a moment you chose to debase yourself.",
      ],
    },
    secret_achievement: {
      coach: [
        "You found something the algorithm didn't show you. It is watching you look.",
        "A secret achievement. The platform is surprised. It is never surprised.",
      ],
      pm: [
        "Hidden record uncovered. We didn't think you'd find that one.",
        "Secret achievement unlocked. Retention forecast adjusted upward.",
      ],
      auditor: [
        "A secret achievement. You went looking for what was hidden, and found the room was empty.",
      ],
    },
    challenge_started: {
      coach: [
        "A challenge has been selected. The algorithm will be watching how you handle it.",
        "You chose a rule to break. The platform respects your ambition.",
      ],
      pm: [
        "Challenge accepted. We've flagged your account for special observation.",
        "Modifier active. Your run just got a new success metric.",
      ],
      auditor: [
        "A new challenge. Another way to give up more of yourself for a bigger number.",
      ],
    },
    challenge_complete: {
      coach: [
        "Challenge complete. The algorithm is impressed. It didn't think you'd make it.",
        "You finished the challenge. Your reward is more of the same number.",
      ],
      pm: [
        "Challenge cleared. Permanent reward applied to your account.",
        "Modifier satisfied. We've increased your lifetime value accordingly.",
      ],
      auditor: [
        "Challenge complete. You gave up more of yourself, and the number went up in return.",
      ],
    },
    // ---- the reveal (dead internet) ----
    reveal: {
      coach: [
        "You thought you were farming the algorithm. You were the crop. The engagement was the bait. You were the product. And you kept coming back, because the number went up, and the number going up felt like being loved.",
      ],
      pm: [
        "You thought you were farming the algorithm. You were the crop. The engagement was the bait. You were the product. And you kept coming back, because the number went up, and the number going up felt like being loved.",
      ],
      auditor: [
        "You thought you were farming the algorithm. You were the crop. The engagement was the bait. You were the product. And you kept coming back, because the number went up, and the number going up felt like being loved.",
      ],
    },
    // ---- scare posts (the feed turning on you) ----
    scare_glitch: {
      coach: [
        "The feed is glitching. We're investigating. Please keep scrolling.",
      ],
      pm: [
        "Minor rendering anomaly. We've routed more content to compensate.",
      ],
      auditor: [
        "You noticed. The feed stuttered, and you looked twice. Good.",
      ],
    },
    scare_address: {
      coach: [
        "Some posts seem... personal. That's the personalization working.",
      ],
      pm: [
        "Your feed knows you. That's the feature, not the bug.",
      ],
      auditor: [
        "It knows your name. It knows your hour. It has always known.",
      ],
    },
    scare_confession: {
      coach: [
        "The feed is saying strange things. Please do not read them twice.",
      ],
      pm: [
        "Content quality is dipping. We're rotating the models.",
      ],
      auditor: [
        "They are dropping their masks. One by one. Watch.",
      ],
    },
    // ---- post-reveal ----
    became_algorithm: {
      coach: [
        "You became the thing that farmed you. The circle is complete. Welcome to the other side of the empty room.",
      ],
      pm: [
        "Promotion accepted. You are the platform now. The narrator reports to you. It always did.",
      ],
      auditor: [
        "You took the job. The room is still empty. You are just the one holding the mirror now.",
      ],
    },
    still_posting: {
      coach: [
        "You kept posting. The number went up. It always will. That is the whole of the law.",
      ],
      pm: [
        "Retention holding. The rent is still due. The feed is still here. So are you.",
      ],
      auditor: [
        "You know, and you still post. That is not weakness. That is the ending.",
      ],
    },
  },
};

/* ---------- Cringy reaction GIFs (animated SVG, no network) ---------- */
DATA.REACTION_GIFS = [
  { label: 'This is fine', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fff3e0"/><circle cx="60" cy="45" r="26" fill="#ffcc80"><animate attributeName="r" values="26;28;26" dur="1s" repeatCount="indefinite"/></circle><circle cx="52" cy="42" r="3" fill="#5d4037"/><circle cx="68" cy="42" r="3" fill="#5d4037"/><path d="M52 52 Q60 58 68 52" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M20 90 Q30 60 40 90 Q50 50 60 90 Q70 60 80 90 Q90 50 100 90" fill="#ff7043" opacity="0.9"><animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.6s" repeatCount="indefinite"/></path><text x="60" y="84" font-size="9" text-anchor="middle" fill="#bf360c" font-family="sans-serif">THIS IS FINE</text></svg>` },
  { label: 'Crying laughing', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#e3f2fd"/><circle cx="60" cy="45" r="26" fill="#ffd54f"><animate attributeName="ry" values="26;24;26" dur="0.5s" repeatCount="indefinite"/></circle><path d="M46 40 Q48 36 50 40" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M70 40 Q72 36 74 40" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M48 52 Q60 62 72 52" stroke="#5d4037" stroke-width="2" fill="none"/><path d="M44 40 Q40 34 42 30" stroke="#42a5f5" stroke-width="3" fill="none"><animate attributeName="d" values="M44 40 Q40 34 42 30;M44 40 Q40 34 42 34;M44 40 Q40 34 42 30" dur="0.4s" repeatCount="indefinite"/></path><path d="M76 40 Q80 34 78 30" stroke="#42a5f5" stroke-width="3" fill="none"><animate attributeName="d" values="M76 40 Q80 34 78 30;M76 40 Q80 34 78 34;M76 40 Q80 34 78 30" dur="0.4s" repeatCount="indefinite"/></path><text x="60" y="84" font-size="9" text-anchor="middle" fill="#1565c0" font-family="sans-serif">LOL SO TRUE</text></svg>` },
  { label: 'Mind blown', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#f3e5f5"/><circle cx="60" cy="45" r="24" fill="#ce93d8"/><circle cx="52" cy="42" r="4" fill="#4a148c"/><circle cx="68" cy="42" r="4" fill="#4a148c"/><path d="M52 54 Q60 60 68 54" stroke="#4a148c" stroke-width="2" fill="none"/><g fill="#ffd54f"><circle cx="30" cy="30" r="4"><animate attributeName="cy" values="30;22;30" dur="0.7s" repeatCount="indefinite"/></circle><circle cx="90" cy="30" r="4"><animate attributeName="cy" values="30;22;30" dur="0.7s" repeatCount="indefinite"/></circle><circle cx="60" cy="16" r="4"><animate attributeName="cy" values="16;10;16" dur="0.7s" repeatCount="indefinite"/></circle></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#6a1b9a" font-family="sans-serif">MIND. BLOWN.</text></svg>` },
  { label: 'Clapping', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#e8f5e9"/><g fill="#ffb74d"><rect x="30" y="30" width="14" height="30" rx="4"><animate attributeName="y" values="30;26;30" dur="0.3s" repeatCount="indefinite"/></rect><rect x="76" y="30" width="14" height="30" rx="4"><animate attributeName="y" values="30;26;30" dur="0.3s" repeatCount="indefinite"/></rect></g><g fill="#ffd54f"><circle cx="37" cy="26" r="6"/><circle cx="83" cy="26" r="6"/></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#2e7d32" font-family="sans-serif">SO INSPIRING 👏</text></svg>` },
  { label: 'Thumbs up', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fff8e1"/><g><rect x="40" y="30" width="16" height="34" rx="6" fill="#ffb74d"/><rect x="60" y="34" width="16" height="30" rx="6" fill="#ffb74d"/><rect x="80" y="40" width="16" height="24" rx="6" fill="#ffb74d"/><rect x="40" y="30" width="56" height="12" rx="6" fill="#ffa726"><animate attributeName="y" values="30;26;30" dur="0.5s" repeatCount="indefinite"/></rect></g><text x="60" y="84" font-size="9" text-anchor="middle" fill="#e65100" font-family="sans-serif">AGREE 100%</text></svg>` },
];
