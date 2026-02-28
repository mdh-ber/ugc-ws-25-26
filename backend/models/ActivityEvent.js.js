const mongoose = require('mongoose');

const activityEventSchema = new mongoose.Schema(
  {
      // ── Core Fields ───────────────────────────────────────────────────────
          creatorId: {
                type: mongoose.Schema.Types.ObjectId,
                      ref: 'Creator',
                            required: true,
                                  index: true,
                                      },

                                          eventType: {
                                                type: String,
                                                      enum: [
                                                              'REFERRAL_APPROVED',   // +50 pts — a referred user completed signup
                                                                      'UGC_SUBMITTED',       // +30 pts — creator submitted a post
                                                                              'LIKE_RECEIVED',       //  +2 pts — a post got a like
                                                                                      'COMMENT_RECEIVED',    //  +5 pts — a post got a comment
                                                                                            ],
                                                                                                  required: true,
                                                                                                        index: true,
                                                                                                            },

                                                                                                                // Points awarded at the time this event was recorded
                                                                                                                    pointsAwarded: { type: Number, required: true, min: 0 },

                                                                                                                        // ── Event-Specific Metadata ───────────────────────────────────────────
                                                                                                                            metadata: {
                                                                                                                                  // REFERRAL_APPROVED fields
                                                                                                                                        referredUserId: { type: String, default: null },
                                                                                                                                              referralCode:   { type: String, default: null },

                                                                                                                                                    // UGC_SUBMITTED / LIKE_RECEIVED / COMMENT_RECEIVED fields
                                                                                                                                                          postId:    { type: String, default: null },
                                                                                                                                                                postTitle: { type: String, default: null },
                                                                                                                                                                      platform:  { type: String, default: null }, // "instagram", "tiktok", etc.

                                                                                                                                                                            // LIKE_RECEIVED / COMMENT_RECEIVED fields
                                                                                                                                                                                  actorUserId: { type: String, default: null }, // who performed the action
                                                                                                                                                                                      },

                                                                                                                                                                                          // ── Status ────────────────────────────────────────────────────────────
                                                                                                                                                                                              status: {
                                                                                                                                                                                                    type: String,
                                                                                                                                                                                                          enum: ['ACTIVE', 'CANCELLED', 'DUPLICATE'],
                                                                                                                                                                                                                default: 'ACTIVE',
                                                                                                                                                                                                                    },

                                                                                                                                                                                                                        occurredAt: { type: Date, default: Date.now, index: true },
                                                                                                                                                                                                                          },
                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                timestamps: true,
                                                                                                                                                                                                                                    collection: 'activity_events',
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                      );

                                                                                                                                                                                                                                      // Per-creator event history (most common query pattern)
                                                                                                                                                                                                                                      activityEventSchema.index({ creatorId: 1, eventType: 1, occurredAt: -1 });
                                                                                                                                                                                                                                      // Per-creator timeline
                                                                                                                                                                                                                                      activityEventSchema.index({ creatorId: 1, occurredAt: -1 });
                                                                                                                                                                                                                                      // Global event type filter
                                                                                                                                                                                                                                      activityEventSchema.index({ eventType: 1, occurredAt: -1 });

                                                                                                                                                                                                                                      module.exports = mongoose.model('ActivityEvent', activityEventSchema);