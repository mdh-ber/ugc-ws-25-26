const creatorSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    avatarUrl:   { type: String, default: null },
    isActive:    { type: Boolean, default: true },

    // ── Raw Activity Counters (updated by event ingestion) ───────────────
    stats: {
      approvedReferrals: { type: Number, default: 0, min: 0 },
      ugcPostsSubmitted: { type: Number, default: 0, min: 0 },
      totalLikes:        { type: Number, default: 0, min: 0 },
      totalComments:     { type: Number, default: 0, min: 0 },
    },

    // ── Computed Score (recalculated by scheduler or on event) ───────────
    score: {
      total:          { type: Number, default: 0, index: true },
      referralScore:  { type: Number, default: 0 },
      ugcScore:       { type: Number, default: 0 },
      engagementScore:{ type: Number, default: 0 },
      lastCalculated: { type: Date, default: null },
    },

    // ── Current Rank (updated after each score recalculation) ────────────
    currentRank: { type: Number, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'creators',
  }
);

// Compound index for fast leaderboard queries
creatorSchema.index({ 'score.total': -1, createdAt: 1 });
creatorSchema.index({ isActive: 1, 'score.total': -1 });
