const cron = require('node-cron');
const {
  recalculateAllScores,
  generateSnapshot,
} = require('../services/scoreService');

/**
 * Helper: get ISO week label "YYYY-Www"
 */
const getWeekLabel = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * Helper: get month label "YYYY-MM"
 */
const getMonthLabel = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const initSchedulers = () => {
  // ── 1. Daily Score Recalculation (default: 2:00 AM every day) ──────────
  const dailyCron = process.env.DAILY_SCORE_CRON || '0 2 * * *';
  cron.schedule(dailyCron, async () => {
    console.log(`\n⏰ [CRON] Daily score recalculation triggered at ${new Date().toISOString()}`);
    try {
      const result = await recalculateAllScores();
      console.log(`✅ [CRON] Daily recalc complete:`, result);
    } catch (err) {
      console.error('❌ [CRON] Daily recalc failed:', err.message);
    }
  });

  // ── 2. Weekly Snapshot (default: 3:00 AM every Sunday) ─────────────────
  const weeklyCron = process.env.WEEKLY_SNAPSHOT_CRON || '0 3 * * 0';
  cron.schedule(weeklyCron, async () => {
    console.log(`\n⏰ [CRON] Weekly snapshot triggered at ${new Date().toISOString()}`);
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      await generateSnapshot('WEEKLY', weekStart, now, getWeekLabel(now));
    } catch (err) {
      console.error('❌ [CRON] Weekly snapshot failed:', err.message);
    }
  });

  // ── 3. Monthly Snapshot (default: 3:00 AM on 1st of every month) ───────
  const monthlyCron = process.env.MONTHLY_SNAPSHOT_CRON || '0 3 1 * *';
  cron.schedule(monthlyCron, async () => {
    console.log(`\n⏰ [CRON] Monthly snapshot triggered at ${new Date().toISOString()}`);
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      await generateSnapshot('MONTHLY', monthStart, monthEnd, getMonthLabel(monthStart));
    } catch (err) {
      console.error('❌ [CRON] Monthly snapshot failed:', err.message);
    }
  });

  console.log('⏰ Schedulers initialized:');
  console.log(`   Daily score recalc : ${dailyCron}`);
  console.log(`   Weekly snapshot    : ${weeklyCron}`);
  console.log(`   Monthly snapshot   : ${monthlyCron}`);
};

module.exports = { initSchedulers };