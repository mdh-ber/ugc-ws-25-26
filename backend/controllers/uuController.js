const mongoose = require("mongoose");
const RefereeReferralUu = require("../models/Referee_Referral_UU");
const { Referral } = require("../models/Referral");

// ---------------- helpers ----------------

function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10);
}

function parseRange(req) {
  const q = req.query || {};
  const fromQ = q.from;
  const toQ = q.to;
  const days = Number(q.days || 7);

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

function send(res, status, data) {
  if (typeof res.sendJson === "function") return res.sendJson(status, data);

  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ============================================================
// GENERIC HANDLERS
// ============================================================

async function getOverview(entityType, req, res) {
  try {
    const { from, to } = parseRange(req);

    const data = await RefereeReferralUu.aggregate([
      { $match: { entityType, date: { $gte: from, $lte: to } } },
      { $group: { _id: "$date", uu: { $sum: "$uu" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", uu: 1 } },
    ]);

    return send(res, 200, { series: data, from, to });
  } catch (e) {
    return send(res, 500, { message: "Server error", error: e.message });
  }
}

async function getMembers(entityType, req, res) {
  try {
    const { from, to } = parseRange(req);

    const grouped = await RefereeReferralUu.aggregate([
      { $match: { entityType, date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: "$entityId",
          totalUu: { $sum: "$uu" },
          entityName: { $first: "$entityName" }, // take stored name if exists
        },
      },
      { $sort: { totalUu: -1 } },
    ]);

    // ---------------- REFEREE ----------------
    if (entityType === "referee") {
      const members = grouped.map((g) => ({
        id: g._id,
        totalUu: g.totalUu,
        name:
          g.entityName && g.entityName.trim().length
            ? g.entityName
            : g._id,
      }));

      return send(res, 200, { count: members.length, members, from, to });
    }

    // ---------------- REFERRAL ----------------
    const ids = grouped.map((g) => g._id);
    const validIds = ids.filter(isValidObjectId);

    const profiles = validIds.length
      ? await Referral.find({ _id: { $in: validIds } })
          .select("firstName surName")
          .lean()
      : [];

    const profileMap = new Map(
      profiles.map((p) => [
        String(p._id),
        `${p.firstName || ""} ${p.surName || ""}`.trim(),
      ])
    );

    const members = grouped.map((g) => {
      const nameFromUu =
        g.entityName && g.entityName.trim().length
          ? g.entityName
          : null;

      const nameFromReferral = profileMap.get(String(g._id)) || null;

      return {
        id: g._id,
        totalUu: g.totalUu,
        name: nameFromUu || nameFromReferral || g._id,
      };
    });

    return send(res, 200, { count: members.length, members, from, to });
  } catch (e) {
    return send(res, 500, { message: "Server error", error: e.message });
  }
}

async function getDetails(entityType, idParamName, req, res) {
  try {
    const { from, to } = parseRange(req);
    const entityId = req.params?.[idParamName];

    if (!entityId) {
      return send(res, 400, { message: `${idParamName} is required` });
    }

    const docs = await RefereeReferralUu.find({
      entityType,
      entityId: String(entityId),
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1 })
      .lean();

    const series = docs.map((d) => ({ date: d.date, uu: d.uu }));
    const summary = buildSummary(series);

    const entityName = docs[0]?.entityName || "";

    // REFEREE
    if (entityType === "referee") {
      return send(res, 200, {
        id: entityId,
        entityName,
        summary,
        series,
        from,
        to,
      });
    }

    // REFERRAL
    let profile = null;

    if (isValidObjectId(entityId)) {
      profile = await Referral.findById(entityId).lean();
    }

    return send(res, 200, {
      id: entityId,
      entityName,
      profile,
      summary,
      series,
      from,
      to,
    });
  } catch (e) {
    return send(res, 500, { message: "Server error", error: e.message });
  }
}

// ============================================================
// EXPORTED CONTROLLERS (same routes)
// ============================================================

// REFEREE
exports.getRefereeOverview = (req, res) =>
  getOverview("referee", req, res);

exports.getRefereeMembers = (req, res) =>
  getMembers("referee", req, res);

exports.getRefereeDetails = (req, res) =>
  getDetails("referee", "refereeId", req, res);

// REFERRAL
exports.getReferralOverview = (req, res) =>
  getOverview("referral", req, res);

exports.getReferralMembers = (req, res) =>
  getMembers("referral", req, res);

exports.getReferralDetails = (req, res) =>
  getDetails("referral", "referralId", req, res);