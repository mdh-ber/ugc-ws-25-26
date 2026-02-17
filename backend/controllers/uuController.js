const RefereeUu = require("../models/RefereeUu");
const ReferralUu = require("../models/referralUu");
const { Parser } = require("json2csv");

function parseRange(req) {
  const from = req.query.from || "2026-01-01";
  const to = req.query.to || "2026-12-31";
  return { from, to };
}

function buildSummary(series) {
  if (!series.length) {
    return { totalUu: 0, avgDailyUu: 0, peakUu: 0, peakDate: null };
  }

  let total = 0;
  let peakUu = -1;
  let peakDate = null;

  for (const p of series) {
    total += p.uu;
    if (p.uu > peakUu) {
      peakUu = p.uu;
      peakDate = p.date;
    }
  }

  const avg = Math.round((total / series.length) * 100) / 100;
  return { totalUu: total, avgDailyUu: avg, peakUu, peakDate };
}

// ---------- Referee ----------
exports.getRefereeOverview = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    // Sum uu by date for all referees
    const data = await RefereeUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

    res.json({ series: data });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getRefereeDetails = async (req, res) => {
  try {
    const { from, to } = parseRange(req);
    const { refereeId } = req.params;

    const docs = await RefereeUu.find({
      refereeId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1 })
      .lean();

    const series = docs.map((d) => ({ date: d.date, uu: d.uu }));
    const summary = buildSummary(series);

    res.json({ id: refereeId, summary, series });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// ---------- Referral ----------
exports.getReferralOverview = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    const data = await ReferralUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

    res.json({ series: data });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getReferralDetails = async (req, res) => {
  try {
    const { from, to } = parseRange(req);
    const { referralId } = req.params;

    const docs = await ReferralUu.find({
      referralId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1 })
      .lean();

    const series = docs.map((d) => ({ date: d.date, uu: d.uu }));
    const summary = buildSummary(series);

    res.json({ id: referralId, summary, series });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// ---------- CSV Download Functions ----------
exports.downloadRefereeMembersCSV = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);

    // TEMP dummy data (should match the members endpoint)
    const members = [
      { id: "RF-101", name: "Referee A" },
      { id: "RF-102", name: "Referee B" },
      { id: "RL-203", name: "Referral C" },
      { id: "RL-204", name: "Referral D" },
    ];

    // Convert to CSV
    const fields = ["id", "name"];
    const parser = new Parser({ fields });
    const csv = parser.parse(members);

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referee-members-${days}days.csv`
    );

    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ message: "Error generating CSV", error: e.message });
  }
};

exports.downloadReferralMembersCSV = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);

    // TEMP dummy data (should match the members endpoint)
    const members = [
      { id: "RL-201", name: "Referral A" },
      { id: "RL-202", name: "Referral B" },
    ];

    // Convert to CSV
    const fields = ["id", "name"];
    const parser = new Parser({ fields });
    const csv = parser.parse(members);

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=referral-members-${days}days.csv`
    );

    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ message: "Error generating CSV", error: e.message });
  }
};