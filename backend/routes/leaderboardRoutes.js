const express = require('express');
const router = express.Router();
const { query, param, validationResult } = require('express-validator');
const Creator = require('../models/Creator');
const RankingSnapshot = require('../models/RankingSnapshot');
const ActivityEvent = require('../models/ActivityEvent');
const { recalculateAllScores, generateSnapshot } = require('../services/scoreService');

// ─── Validation middleware ────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * GET /api/leaderboard
 * Fetch live leaderboard (current scores, sorted by rank)
 *
 * Query params:
 *   page     (default 1)
 *   limit    (default 20, max 100)
 *   minScore (optional filter)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('minScore').optional().isInt({ min: 0 }).toInt(),
  ],
  validate,
  async (req, res) => {
    try {
      const page     = req.query.page     || 1;
      const limit    = req.query.limit    || 20;
      const minScore = req.query.minScore || 0;
      const skip     = (page - 1) * limit;

      const filter = { isActive: true, 'score.total': { $gte: minScore } };

      const [creators, total] = await Promise.all([
        Creator.find(filter)
          .sort({ 'score.total': -1, createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .select('-email -__v'),
        Creator.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        data: {
          leaderboard: creators.map((c, idx) => ({
            rank:        skip + idx + 1,
            creatorId:   c._id,
            username:    c.username,
            displayName: c.displayName,
            avatarUrl:   c.avatarUrl,
            score: {
              total:           c.score.total,
              referralScore:   c.score.referralScore,
              ugcScore:        c.score.ugcScore,
              engagementScore: c.score.engagementScore,
              lastCalculated:  c.score.lastCalculated,
            },
            stats: c.stats,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/leaderboard/snapshot
 * Fetch a historical snapshot (weekly or monthly)
 *
 * Query params:
 *   period      WEEKLY | MONTHLY  (required)
 *   periodLabel e.g. "2024-W03" or "2024-01" (optional, defaults to latest)
 *   limit        (default 20, max 100)
 */
router.get(
  '/snapshot',
  [
    query('period').isIn(['WEEKLY', 'MONTHLY', 'DAILY']),
    query('periodLabel').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  async (req, res) => {
    try {
      const { period, periodLabel } = req.query;
      const limit = req.query.limit || 20;

      const filter = { period };
      if (periodLabel) filter.periodLabel = periodLabel;

      const snapshot = await RankingSnapshot.findOne(filter)
        .sort({ periodStart: -1 })
        .lean();

      if (!snapshot) {
        return res.status(404).json({ success: false, message: 'Snapshot not found' });
      }

      return res.json({
        success: true,
        data: {
          period:       snapshot.period,
          periodLabel:  snapshot.periodLabel,
          periodStart:  snapshot.periodStart,
          periodEnd:    snapshot.periodEnd,
          generatedAt:  snapshot.generatedAt,
          totalCreators: snapshot.totalCreators,
          leaderboard:  snapshot.entries.slice(0, limit),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/leaderboard/snapshots/list
 * List all available snapshots (for a period type)
 */
router.get(
  '/snapshots/list',
  [query('period').optional().isIn(['WEEKLY', 'MONTHLY', 'DAILY'])],
  validate,
  async (req, res) => {
    try {
      const filter = {};
      if (req.query.period) filter.period = req.query.period;

      const snapshots = await RankingSnapshot.find(filter)
        .sort({ periodStart: -1 })
        .limit(50)
        .select('period periodLabel periodStart periodEnd totalCreators generatedAt');

      return res.json({ success: true, data: snapshots });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/leaderboard/creator/:creatorId
 * Get a single creator's rank, score, and recent activity
 */
router.get(
  '/creator/:creatorId',
  [param('creatorId').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const creator = await Creator.findById(req.params.creatorId).select('-email -__v');
      if (!creator) {
        return res.status(404).json({ success: false, message: 'Creator not found' });
      }

      const recentEvents = await ActivityEvent.find({
        creatorId: creator._id,
        status: 'ACTIVE',
      })
        .sort({ occurredAt: -1 })
        .limit(10)
        .select('-__v');

      return res.json({
        success: true,
        data: {
          creator: {
            id:          creator._id,
            username:    creator.username,
            displayName: creator.displayName,
            avatarUrl:   creator.avatarUrl,
            currentRank: creator.currentRank,
            score:       creator.score,
            stats:       creator.stats,
          },
          recentActivity: recentEvents,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/leaderboard/recalculate
 * Manually trigger a full score recalculation (admin use)
 */
router.post('/recalculate', async (req, res) => {
  try {
    const result = await recalculateAllScores();
    return res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/leaderboard/snapshot/generate
 * Manually generate a snapshot (admin use)
 * Body: { period: "WEEKLY" | "MONTHLY" }
 */
router.post('/snapshot/generate', async (req, res) => {
  try {
    const { period = 'WEEKLY' } = req.body;
    const now = new Date();

    let periodStart, periodEnd, periodLabel;

    if (period === 'WEEKLY') {
      periodEnd   = now;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - 7);
      const weekNo = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000) / 7);
      periodLabel = `${now.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd   = now;
      periodLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const snapshot = await generateSnapshot(period, periodStart, periodEnd, periodLabel);
    return res.json({ success: true, data: { snapshotId: snapshot._id, periodLabel } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;