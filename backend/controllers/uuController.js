const RefereeUu = require("../models/RefereeUu");
const ReferralUu = require("../models/ReferralUu");
const { Referral } = require("../models/Referral");

// ---------------- Helpers ----------------
function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10);
}


function parseRange(req) {
  // Option 1: explicit from/to
  const fromQ = req.query.from;
  const toQ = req.query.to;

  // Option 2: days
  const days = Number(req.query.days || 7);

  if (fromQ && toQ) return { from: fromQ, to: toQ };

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return { from: toYYYYMMDD(start), to: toYYYYMMDD(end) };
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

// ---------------- Members (Dynamic) ----------------

// Referee members list (dynamic from RefereeUu)
exports.getRefereeMembers = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    const members = await RefereeUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$refereeId", totalUu: { $sum: "$uu" } } },
      { $sort: { totalUu: -1 } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$_id", // if you have a separate Referee collection, later you can lookup name
          totalUu: 1,
        },
      },
    ]);

    res.json({ count: members.length, members, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Referral members list (dynamic from ReferralUu + lookup Referral for names)
exports.getReferralMembers = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    const members = await ReferralUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$referralId", totalUu: { $sum: "$uu" } } },
      { $sort: { totalUu: -1 } },

      // referralId stored as string -> convert to ObjectId for lookup
      { $addFields: { referralObjectId: { $toObjectId: "$_id" } } },
      {
        $lookup: {
          from: "referrals",
          localField: "referralObjectId",
          foreignField: "_id",
          as: "ref",
        },
      },
      { $unwind: { path: "$ref", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: "$_id",
          totalUu: 1,
          name: {
            $cond: [
              { $ifNull: ["$ref.firstName", false] },
              { $concat: ["$ref.firstName", " ", "$ref.surName"] },
              "$_id",
            ],
          },
        },
      },
    ]);

    res.json({ count: members.length, members, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// ---------------- Overview (Graph Data) ----------------

// Referee overview
exports.getRefereeOverview = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    const data = await RefereeUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

    res.json({ series: data, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Referral overview
exports.getReferralOverview = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

    const data = await ReferralUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

    res.json({ series: data, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// ---------------- Details (Per Member) ----------------

// Referee details
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

    res.json({ id: refereeId, summary, series, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Referral details (UU + profile details)
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

    // try to fetch referral profile (works if referralId == Referral._id)
    let profile = null;
    try {
      profile = await Referral.findById(referralId).lean();
    } catch (_) {}

    res.json({ id: referralId, profile, summary, series, from, to });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};