const Creator = require('../models/Creator');
const ActivityEvent = require('../models/ActivityEvent');
const RankingSnapshot = require('../models/RankingSnapshot');

/**
 * Score weights — loaded from env so they can be tuned without code changes.
 */
const WEIGHTS = {
  REFERRAL: parseInt(process.env.WEIGHT_REFERRAL  || '50'),
  UGC:      parseInt(process.env.WEIGHT_UGC       || '30'),
  LIKE:     parseInt(process.env.WEIGHT_LIKE      || '2'),
  COMMENT:  parseInt(process.env.WEIGHT_COMMENT   || '5'),
};

/**
 * Calculate score components for a given stats object.
 * Pure function — no DB access.
 */
const calculateScoreComponents = (stats) => {
  const referralScore   = (stats.approvedReferrals || 0) * WEIGHTS.REFERRAL;
  const ugcScore        = (stats.ugcPostsSubmitted || 0) * WEIGHTS.UGC;
  const engagementScore = ((stats.totalLikes || 0) * WEIGHTS.LIKE)
                        + ((stats.totalComments || 0) * WEIGHTS.COMMENT);

  return {
    referralScore,
    ugcScore,
    engagementScore,
    total: referralScore + ugcScore + engagementScore,
  };
};

/**
 * Recalculate scores for ALL active creators by aggregating their
 * activity_events from scratch, then assign ranks.
 *
 * Called by the daily cron job.
 */
const recalculateAllScores = async () => {
  console.log('🔄 Starting full score recalculation...');
  const startTime = Date.now();

  // Aggregate stats per creator from active events
  const aggregated = await ActivityEvent.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $group: {
        _id: '$creatorId',
        approvedReferrals: {
          $sum: { $cond: [{ $eq: ['$eventType', 'REFERRAL_APPROVED'] }, 1, 0] },
        },
        ugcPostsSubmitted: {
          $sum: { $cond: [{ $eq: ['$eventType', 'UGC_SUBMITTED'] }, 1, 0] },
        },
        totalLikes: {
          $sum: { $cond: [{ $eq: ['$eventType', 'LIKE_RECEIVED'] }, 1, 0] },
        },
        totalComments: {
          $sum: { $cond: [{ $eq: ['$eventType', 'COMMENT_RECEIVED'] }, 1, 0] },
        },
      },
    },
  ]);

  // Build a lookup map
  const statsMap = {};
  for (const row of aggregated) {
    statsMap[row._id.toString()] = row;
  }

  // Fetch all active creators
  const creators = await Creator.find({ isActive: true }).select('_id');

  const bulkOps = creators.map((creator) => {
    const stats = statsMap[creator._id.toString()] || {
      approvedReferrals: 0,
      ugcPostsSubmitted: 0,
      totalLikes: 0,
      totalComments: 0,
    };
    const scoreComponents = calculateScoreComponents(stats);

    return {
      updateOne: {
        filter: { _id: creator._id },
        update: {
          $set: {
            'stats.approvedReferrals': stats.approvedReferrals,
            'stats.ugcPostsSubmitted': stats.ugcPostsSubmitted,
            'stats.totalLikes':        stats.totalLikes,
            'stats.totalComments':     stats.totalComments,
            'score.total':             scoreComponents.total,
            'score.referralScore':     scoreComponents.referralScore,
            'score.ugcScore':          scoreComponents.ugcScore,
            'score.engagementScore':   scoreComponents.engagementScore,
            'score.lastCalculated':    new Date(),
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Creator.bulkWrite(bulkOps);
  }

  // Assign ranks (sorted by total score desc, then by oldest account for tie-breaking)
  const rankedCreators = await Creator.find({ isActive: true })
    .sort({ 'score.total': -1, createdAt: 1 })
    .select('_id');

  const rankBulkOps = rankedCreators.map((c, idx) => ({
    updateOne: {
      filter: { _id: c._id },
      update: { $set: { currentRank: idx + 1 } },
    },
  }));

  if (rankBulkOps.length > 0) {
    await Creator.bulkWrite(rankBulkOps);
  }

  const elapsed = Date.now() - startTime;
  console.log(`✅ Score recalculation done in ${elapsed}ms. Updated ${creators.length} creators.`);

  return { creatorsUpdated: creators.length, durationMs: elapsed };
};

/**
 * Recalculate score for a SINGLE creator.
 * Called immediately after an activity event is ingested (real-time update).
 */
const recalculateSingleCreatorScore = async (creatorId) => {
  const aggregated = await ActivityEvent.aggregate([
    { $match: { creatorId: creatorId, status: 'ACTIVE' } },
    {
      $group: {
        _id: '$creatorId',
        approvedReferrals: {
          $sum: { $cond: [{ $eq: ['$eventType', 'REFERRAL_APPROVED'] }, 1, 0] },
        },
        ugcPostsSubmitted: {
          $sum: { $cond: [{ $eq: ['$eventType', 'UGC_SUBMITTED'] }, 1, 0] },
        },
        totalLikes: {
          $sum: { $cond: [{ $eq: ['$eventType', 'LIKE_RECEIVED'] }, 1, 0] },
        },
        totalComments: {
          $sum: { $cond: [{ $eq: ['$eventType', 'COMMENT_RECEIVED'] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = aggregated[0] || {
    approvedReferrals: 0,
    ugcPostsSubmitted: 0,
    totalLikes: 0,
    totalComments: 0,
  };

  const scoreComponents = calculateScoreComponents(stats);

  await Creator.findByIdAndUpdate(creatorId, {
    $set: {
      'stats.approvedReferrals': stats.approvedReferrals,
      'stats.ugcPostsSubmitted': stats.ugcPostsSubmitted,
      'stats.totalLikes':        stats.totalLikes,
      'stats.totalComments':     stats.totalComments,
      'score.total':             scoreComponents.total,
      'score.referralScore':     scoreComponents.referralScore,
      'score.ugcScore':          scoreComponents.ugcScore,
      'score.engagementScore':   scoreComponents.engagementScore,
      'score.lastCalculated':    new Date(),
    },
  });

  return scoreComponents;
};

/**
 * Generate and persist a leaderboard snapshot (WEEKLY or MONTHLY).
 */
const generateSnapshot = async (period, periodStart, periodEnd, periodLabel) => {
  console.log(`📸 Generating ${period} snapshot: ${periodLabel}`);

  // Fetch previous snapshot to calculate rank changes
  const prevSnapshot = await RankingSnapshot.findOne({ period })
    .sort({ periodStart: -1 })
    .lean();

  const prevRankMap = {};
  if (prevSnapshot) {
    for (const entry of prevSnapshot.entries) {
      prevRankMap[entry.creatorId.toString()] = entry.rank;
    }
  }

  // Get current leaderboard (all active creators, sorted by score)
  const creators = await Creator.find({ isActive: true })
    .sort({ 'score.total': -1, createdAt: 1 })
    .lean();

  const entries = creators.map((creator, idx) => {
    const rank = idx + 1;
    const prevRank = prevRankMap[creator._id.toString()] || rank;
    return {
      rank,
      creatorId:   creator._id,
      username:    creator.username,
      displayName: creator.displayName,
      avatarUrl:   creator.avatarUrl,
      totalScore:       creator.score.total,
      referralScore:    creator.score.referralScore,
      ugcScore:         creator.score.ugcScore,
      engagementScore:  creator.score.engagementScore,
      approvedReferrals: creator.stats.approvedReferrals,
      ugcPostsSubmitted: creator.stats.ugcPostsSubmitted,
      totalLikes:        creator.stats.totalLikes,
      totalComments:     creator.stats.totalComments,
      rankChange: prevRank - rank, // positive = moved up in ranking
    };
  });

  const snapshot = await RankingSnapshot.findOneAndUpdate(
    { period, periodLabel },
    {
      period,
      periodLabel,
      periodStart,
      periodEnd,
      entries,
      totalCreators: creators.length,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  console.log(`✅ ${period} snapshot saved: ${entries.length} entries`);
  return snapshot;
};

module.exports = {
  WEIGHTS,
  calculateScoreComponents,
  recalculateAllScores,
  recalculateSingleCreatorScore,
  generateSnapshot,
};