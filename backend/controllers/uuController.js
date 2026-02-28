const RefereeUu = require("../models/RefereeUu");
const ReferralUu = require("../models/ReferralUu");
<<<<<<< HEAD
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
=======

function parseRange(req) {
  const from = req.query.from || "2026-01-01";
  const to = req.query.to || "2026-12-31";
  return { from, to };
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
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

<<<<<<< HEAD
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
=======
// ---------- Referee ----------
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
exports.getRefereeOverview = async (req, res) => {
  try {
    const { from, to } = parseRange(req);

<<<<<<< HEAD
=======
    // Sum uu by date for all referees
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
    const data = await RefereeUu.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

<<<<<<< HEAD
    res.json({ series: data, from, to });
=======
    res.json({ series: data });
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

<<<<<<< HEAD
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
=======
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
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

<<<<<<< HEAD
    res.json({ id: refereeId, summary, series, from, to });
=======
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
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

<<<<<<< HEAD
// Referral details (UU + profile details)
=======
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
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

<<<<<<< HEAD
    // try to fetch referral profile (works if referralId == Referral._id)
    let profile = null;
    try {
      profile = await Referral.findById(referralId).lean();
    } catch (_) {}

    res.json({ id: referralId, profile, summary, series, from, to });
=======
    res.json({ id: referralId, summary, series });
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};