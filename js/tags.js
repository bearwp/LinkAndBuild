/* ============================================================
   LINK & BUILD — Tags System
   The vocabulary of the feed. Every post is made of tags. When you
   scroll a post you absorb its tags into your bucket. You spend
   bucket tags to write posts. Post quality = the tags you spend.

   This is the whole loop:
     scroll -> absorb tags -> spend tags to write -> get engagement
     -> get influence -> get opportunities -> get money
   ============================================================ */

const Tags = {
  /* ---------- lookups ---------- */
  def(id) { return DATA.TAGS.find(t => t.id === id); },

  // the tags a post carries (post.tags is an array of tag ids)
  postTags(post) {
    if (!post) return [];
    if (Array.isArray(post.tags)) return post.tags;
    return [];
  },

  // average quality of a list of tag ids (0..1)
  qualityOf(ids) {
    if (!ids || !ids.length) return 0;
    // tiers are gone — tags are equal-weight personas. Neutral baseline.
    return 0.5;
  },

  /* ---------- bucket ---------- */
  // total tags currently held
  count() {
    const s = State.data;
    let n = 0;
    for (const k in s.bucket.tags) n += s.bucket.tags[k];
    return n;
  },

  // average quality of everything in the bucket (0..1)
  bucketQuality() {
    const s = State.data;
    // tiers are gone — every tag is a 0.5 neutral baseline. Quality comes
    // from composition, not individual tag values, so the bucket bar just
    // reflects how full the bucket is, not how "rare" its contents are.
    let n = 0;
    for (const id in s.bucket.tags) n += s.bucket.tags[id];
    return n ? 0.5 : 0;
  },

  // absorb a post's tags into the bucket. Called when the player scrolls
  // a post into view. Returns the number of tags absorbed.
  absorb(post) {
    const s = State.data;
    const ids = this.postTags(post);
    if (!ids.length) return 0;
    let added = 0;
    for (const id of ids) {
      s.bucket.tags[id] = (s.bucket.tags[id] || 0) + 1;
      added++;
    }
    s.bucket.total += added;
    return added;
  },

  // spend specific tag ids from the bucket. Returns the ids actually spent.
  spend(ids) {
    const s = State.data;
    const spent = [];
    for (const id of ids) {
      if ((s.bucket.tags[id] || 0) > 0) {
        s.bucket.tags[id]--;
        if (s.bucket.tags[id] <= 0) delete s.bucket.tags[id];
        spent.push(id);
        s.bucket.spent++;
      }
    }
    return spent;
  },

  // pick `n` tags from the bucket, weighted toward the ones you hold more of.
  // Used by auto-post bots and the composer's "auto-fill" convenience.
  pick(n) {
    const s = State.data;
    const pool = [];
    for (const id in s.bucket.tags) {
      const c = s.bucket.tags[id];
      const d = this.def(id);
      if (!d) continue;
      // tiers are gone — weight purely by how many copies you hold
      for (let i = 0; i < c; i++) pool.push(id);
    }
    if (!pool.length) return [];
    const out = [];
    for (let i = 0; i < n; i++) {
      if (!pool.length) break;
      const idx = (Math.random() * pool.length) | 0;
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  },

  // the quality multiplier a post gets from its tags (drives reach).
  // 0.5x at slop, 1x at average, up to ~2x at top-tier craft.
  postMult(ids) {
    const q = this.qualityOf(ids);
    return 0.5 + q; // q=0.1 -> 0.6, q=0.5 -> 1.0, q=0.95 -> 1.45
  },

  // build a post body from a set of tag ids (one phrase per tag)
  buildText(ids) {
    const parts = [];
    for (const id of ids) {
      const d = this.def(id);
      if (d && d.setup && d.setup.length) {
        parts.push(d.setup[(Math.random() * d.setup.length) | 0]);
      }
    }
    if (!parts.length) return '';
    const openers = [
      "Grateful doesn't cover what the last few weeks have been.",
      "I almost didn't post this.",
      "Nobody talks enough about the messy middle.",
      "I keep getting DMs asking how I'm doing it. Honest answer:",
      "This isn't a brag. It's a note to my past self.",
    ];
    const closers = [
      "Sharing in case it helps one person going through it.",
      "What's been working for you lately?",
      "If you're in the same season, you're not alone.",
      "Stay stubborn. Stay kind. Keep going.",
      "I'd love to hear your take in the comments.",
    ];
    const pick = a => a[(Math.random() * a.length) | 0];
    return pick(openers) + ' ' + parts.join(' ') + ' ' + pick(closers);
  },
};
