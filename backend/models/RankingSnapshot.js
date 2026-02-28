const mongoose = require('mongoose');

const rankingSnapshotSchema = new mongoose.Schema(
  {
      // ── Snapshot Identity ─────────────────────────────────────────────────
          period: {
                type: String,
                      enum: ['DAILY', 'WEEKLY',  'MONTHLY'],
                            required: true,
                                  index: true,
                                      },

                                              // Weekly  → "2024-W03"
                                                  // Monthly → "2024-01"
                                                      // Daily   → "2024-01-15"
                                                          periodLabel: { type: String, required: true },

                                                              periodStart: { type: Date, required: true },
                                                                  periodEnd:   { type: Date, required: true },

                                                                      // ── Ordered Leaderboard Entries ───────────────────────────────────────
                                                                          entries: [
                                                                                {
                                                                                        rank:        { type: Number, required: true },
                                                                                                creatorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
                                                                                                        username:    { type: String, required: true },
                                                                                                                displayName: { type: String, required: true },
                                                                                                                        avatarUrl:   { type: String, default: null },

                                                                                                                                // Scores frozen at snapshot time
                                                                                                                                        totalScore:      { type: Number, required: true },
                                                                                                                                                referralScore:   { type: Number, default: 0 },
                                                                                                                                                        ugcScore:        { type: Number, default: 0 },
                                                                                                                                                                engagementScore: { type: Number, default: 0 },

                                                                                                                                                                        // Raw stats frozen at snapshot time
                                                                                                                                                                                approvedReferrals: { type: Number, default: 0 },
                                                                                                                                                                                        ugcPostsSubmitted: { type: Number, default: 0 },
                                                                                                                                                                                                totalLikes:        { type: Number, default: 0 },
                                                                                                                                                                                                        totalComments:     { type: Number, default: 0 },

                                                                                                                                                                                                                // Positive = moved up, negative = moved down vs previous snapshot
                                                                                                                                                                                                                        rankChange: { type: Number, default: 0 },
                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                  ],

                                                                                                                                                                                                                                      // ── Metadata ──────────────────────────────────────────────────────────
                                                                                                                                                                                                                                          totalCreators: { type: Number, default: 0 },
                                                                                                                                                                                                                                              generatedAt:   { type: Date, default: Date.now },
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                  {
                                                                                                                                                                                                                                                      timestamps: true,
                                                                                                                                                                                                                                                          collection: 'ranking_snapshots',
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                            );

                                                                                                                                                                                                                                                            // Enforce one snapshot per period type + label (e.g. only one "2024-W03" WEEKLY)
                                                                                                                                                                                                                                                            rankingSnapshotSchema.index({ period: 1, periodLabel: 1 }, { unique: true });
                                                                                                                                                                                                                                                            // Fetch latest snapshot for a given period
                                                                                                                                                                                                                                                            rankingSnapshotSchema.index({ period: 1, periodStart: -1 });

                                                                                                                                                                                                                                                            module.exports = mongoose.model('RankingSnapshot', rankingSnapshotSchema);
                                                                                                                                                                                                                            

                                                                                                                                            
                                                                                                                                                                                                                                                    