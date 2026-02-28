const Post = require("./models/Post");
const Comment = require("./models/Comment");
const http = require("http");
const url = require("url");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();
// ✅ Helper: supports both CommonJS + default-export modules
const unwrapDefault = (mod) =>
  mod && typeof mod === "object" && "default" in mod ? mod.default : mod;

const Feedback = require("./models/feedback.model");
const Guideline = require("./models/guideline.model");
const Notification = require("./models/Notification");
const MilestoneType = unwrapDefault(require("./models/MilestoneType"));
const UserMilestone = unwrapDefault(require("./models/UserMilestone"));

// ✅ IMPORTANT: these match your filenames in models folder
const Training = require("./models/Training");
const Event = require("./models/Event");
const Reward = require("./models/reward");
const postRoutes = require("./routes/postRoutes");

const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/referralUu");
const { Referral, ReferralCode } = require("./models/Referral");
const Userprofile = require("./models/userProfile.model");

// ✅ NEW (Sub-issue #155)
const Campaign = require("./models/Campaign");
const Certificate = require("./models/Certificate");
// ✅ NEW (Sub-issue #158)
const CampaignMetric = require("./models/CampaignMetric");

const PORT = process.env.PORT || 5000;
const Visit = require("./models/visit");

// ---------------- helpers ----------------
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

function sendJson(res, status, data) {
  setCors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---- UU helpers ----
function toYYYYMMDD(d) {
  return d.toISOString().slice(0, 10);
}

function parseRange(query) {
  const fromQ = query.from;
  const toQ = query.to;
  const days = Number(query.days || 7);

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

// =========================================================
// ROI helpers (Sub-issue #158.2)
// =========================================================
function yyyyMmDd(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function dateRangeDays(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return { from: yyyyMmDd(start), to: yyyyMmDd(end) };
}

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

// ---------------- server ----------------
const server = http.createServer(async (req, res) => {
  setCors(res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Modern URL Parsing to remove deprecation warning
  const baseURL = `http://${req.headers.host || "localhost"}`;
  const parsed = new URL(req.url, baseURL);
  const path = parsed.pathname;
  const query = Object.fromEntries(parsed.searchParams.entries());
  const segments = path.split("/").filter(Boolean); // no empty

  try {
    // ===========================
    // AUTH
    // ===========================
    if (req.method === "POST" && path === "/api/visits/track") {
      const clientIp =
        req.ip || req.headers["x-forwarded-for"] || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      const ipHash = crypto
        .createHash("sha256")
        .update(clientIp)
        .digest("hex");
      await Visit.create({ ipHash, userAgent });
      return sendJson(res, 200, { message: "Visit tracked" });
    }

    if (req.method === "GET" && path === "/api/visits/stats") {
      const totalVisits = await Visit.countDocuments();
      const uniqueIps = await Visit.distinct("ipHash");
      return sendJson(res, 200, {
        totalVisits,
        uniqueVisits: uniqueIps.length,
      });
    }

    if (req.method === "POST" && path === "/api/auth/login") {
      const body = await readJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (email === "admin@mdh.com" && password === "admin123") {
        return sendJson(res, 200, {
          token: "demo-token-123",
          user: { email, role: "admin" },
        });
      }
      return sendJson(res, 401, { message: "Invalid email or password" });
    }

    // ✅ Visit Timeline (Daily)
    if (req.method === "GET" && path === "/api/visits/timeline") {
      try {
        const dailyData = await Visit.aggregate([
          {
            $addFields: {
              ts: { $ifNull: ["$timestamp", "$createdAt"] },
            },
          },
          { $match: { ts: { $type: "date" } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$ts" },
              },
              totalVisits: { $sum: 1 },
              uniqueIps: { $addToSet: "$ipHash" },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              totalVisits: 1,
              uniqueVisits: { $size: "$uniqueIps" },
            },
          },
          { $sort: { date: 1 } },
        ]);

        return sendJson(res, 200, dailyData);
      } catch (err) {
        console.error("Timeline error:", err);
        return sendJson(res, 500, { message: "Failed to fetch timeline" });
      }
    }

    // ===========================
    // TRAININGS
    // ===========================
    const trainingController = require("./controllers/trainingController");
    if (path.startsWith("/api/trainings")) {
      const id = segments[2];
      if (req.method === "GET") {
        if (id) {
          return trainingController.getTrainingById(
            { params: { id } },
            res
          );
        } else {
          return trainingController.getTrainings(req, res);
        }
      } else if (req.method === "POST") {
        return trainingController.createTraining(req, res);
      } else if (req.method === "PUT") {
        if (id) {
          return trainingController.updateTraining(req, id, res);
        } else {
          return sendJson(res, 400, {
            message: "Training ID is required for update",
          });
        }
      } else if (req.method === "DELETE") {
        const id = segments[2];
        if (!id) {
          return sendJson(res, 400, {
            message: "Training ID is required for deletion",
          });
        }
        return trainingController.deleteTraining({ params: { id } }, res);
      }
    }

    // ===========================
    // CERTIFICATES
    // Base: /api/certificates
    // ===========================
    if (segments[0] === "api" && segments[1] === "certificates") {
      // GET /api/certificates
      if (req.method === "GET" && segments.length === 2) {
        const items = await Certificate.find()
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, items);
      }

      // POST /api/certificates
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);

        const title = String(body.title || "").trim();
        const issueDate = String(body.issueDate || "").trim();
        const issuer = String(body.issuer || "").trim();
        const issuedTo = String(body.issuedTo || "").trim();
        const type = String(body.type || "").trim();

        if (!title || !issueDate || !issuer || !issuedTo || !type) {
          return sendJson(res, 400, { message: "All fields are required." });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
          return sendJson(res, 400, {
            message: "Issue date must be YYYY-MM-DD",
          });
        }

        const created = await Certificate.create({
          title,
          issueDate,
          issuer,
          issuedTo,
          type,
        });

        return sendJson(res, 201, created);
      }

      // PUT /api/certificates/:id
      if (req.method === "PUT" && segments.length === 3) {
        const id = segments[2];
        if (!isValidObjectId(id))
          return sendJson(res, 400, { message: "Invalid id" });

        const body = await readJsonBody(req);
        const updates = {};

        if (body.title !== undefined)
          updates.title = String(body.title).trim();
        if (body.issueDate !== undefined)
          updates.issueDate = String(body.issueDate).trim();
        if (body.issuer !== undefined)
          updates.issuer = String(body.issuer).trim();
        if (body.issuedTo !== undefined)
          updates.issuedTo = String(body.issuedTo).trim();
        if (body.type !== undefined)
          updates.type = String(body.type).trim();

        if (updates.title !== undefined && !updates.title)
          return sendJson(res, 400, { message: "Title is required." });
        if (updates.issuer !== undefined && !updates.issuer)
          return sendJson(res, 400, { message: "Issuer is required." });
        if (updates.issuedTo !== undefined && !updates.issuedTo)
          return sendJson(res, 400, { message: "IssuedTo is required." });
        if (updates.type !== undefined && !updates.type)
          return sendJson(res, 400, { message: "Type is required." });

        if (updates.issueDate !== undefined) {
          if (!updates.issueDate)
            return sendJson(res, 400, {
              message: "Issue date is required.",
            });
          if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.issueDate)) {
            return sendJson(res, 400, {
              message: "Issue date must be YYYY-MM-DD",
            });
          }
        }

        const updated = await Certificate.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        }).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Certificate not found" });

        return sendJson(res, 200, {
          message: "Certificate updated",
          certificate: updated,
        });
      }

      // DELETE /api/certificates/:id
      if (req.method === "DELETE" && segments.length === 3) {
        const id = segments[2];
        if (!isValidObjectId(id))
          return sendJson(res, 400, { message: "Invalid id" });

        const deleted = await Certificate.findByIdAndDelete(id).lean();
        if (!deleted)
          return sendJson(res, 404, { message: "Certificate not found" });

        return sendJson(res, 200, {
          message: "Certificate deleted",
          certificate: deleted,
        });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // ===========================
    // EVENTS
    // ===========================
    if (req.method === "GET" && path === "/api/events") {
      const items = await Event.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, items);
    }

    // ===========================
    // REWARDS
    // ===========================
    if (req.method === "GET" && path === "/api/rewards") {
      const items = await Reward.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, items);
    }

    // ===========================
    // FEEDBACK
    // ===========================
    if (req.method === "GET" && path === "/api/feedback") {
      const items = await Feedback.find().sort({ createdAt: -1 });
      return sendJson(res, 200, { items });
    }

    if (req.method === "POST" && path === "/api/feedback") {
      const body = await readJsonBody(req);
      const text = (body.feedback ?? body.message ?? "").trim();

      if (!text || text.length < 2) {
        return sendJson(res, 400, { message: "Feedback is required" });
      }

      await Feedback.create({ feedback: text });
      return sendJson(res, 201, { message: "Feedback saved" });
    }

    // ===========================
    // GUIDELINES
    // ===========================
    if (req.method === "GET" && path === "/api/guidelines") {
      const guidelines = await Guideline.find({ isActive: true }).sort({
        createdAt: -1,
      });
      return sendJson(res, 200, guidelines);
    }

    if (req.method === "POST" && path === "/api/guidelines") {
      const body = await readJsonBody(req);

      const text = (body.text || "").trim();
      const type = (body.type || "").trim();
      const category = (body.category || "general").trim();
      const tags = Array.isArray(body.tags) ? body.tags : [];

      if (!text) {
        return sendJson(res, 400, { message: "Guideline text is required" });
      }
      if (type !== "do" && type !== "dont") {
        return sendJson(res, 400, {
          message: 'Type must be either "do" or "dont"',
        });
      }

      const created = await Guideline.create({
        text,
        type,
        category,
        tags,
        isActive: true,
      });
      return sendJson(res, 201, created);
    }

    if (req.method === "PUT" && path.startsWith("/api/guidelines/")) {
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      const body = await readJsonBody(req);
      const updates = {};
      if (body.text !== undefined) updates.text = String(body.text).trim();
      if (body.type !== undefined) updates.type = String(body.type).trim();
      if (body.category !== undefined)
        updates.category = String(body.category).trim();
      if (body.tags !== undefined)
        updates.tags = Array.isArray(body.tags) ? body.tags : [];
      if (body.isActive !== undefined) updates.isActive = !!body.isActive;

      if (updates.type && updates.type !== "do" && updates.type !== "dont") {
        return sendJson(res, 400, {
          message: 'Type must be either "do" or "dont"',
        });
      }

      const updated = await Guideline.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updated)
        return sendJson(res, 404, { message: "Guideline not found" });

      return sendJson(res, 200, updated);
    }

    if (req.method === "DELETE" && path.startsWith("/api/guidelines/")) {
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      const updated = await Guideline.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!updated)
        return sendJson(res, 404, { message: "Guideline not found" });

      return sendJson(res, 200, { message: "Guideline deleted successfully" });
    }

    // =========================================================
    // CAMPAIGNS CRUD (Sub-issue #155)
    // Base: /api/campaigns
    // =========================================================
    if (segments[0] === "api" && segments[1] === "campaigns") {
      // GET /api/campaigns
      if (req.method === "GET" && segments.length === 2) {
        const items = await Campaign.find({ status: "active" })
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, items);
      }

      // POST /api/campaigns
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);

        if (!body.name)
          return sendJson(res, 400, { message: "name is required" });
        if (!body.startDate)
          return sendJson(res, 400, { message: "startDate is required" });
        if (!body.endDate)
          return sendJson(res, 400, { message: "endDate is required" });
        if (!body.utmCampaign)
          return sendJson(res, 400, { message: "utmCampaign is required" });

        const created = await Campaign.create({
          name: String(body.name).trim(),
          description: String(body.description || "").trim(),
          platform: String(body.platform || "Instagram").trim(),
          targetAudience: String(body.targetAudience || "").trim(),
          goals: String(body.goals || "").trim(),
          budget: Number(body.budget || 0),
          spent: Number(body.spent || 0),
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          assignedCreators: Array.isArray(body.assignedCreators)
            ? body.assignedCreators
            : [],
          utmCampaign: String(body.utmCampaign).trim().toLowerCase(),
          status: "active",
        });

        return sendJson(res, 201, created);
      }

      // /api/campaigns/:id
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/campaigns/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await Campaign.findById(id).lean();
        if (!doc)
          return sendJson(res, 404, { message: "Campaign not found" });
        return sendJson(res, 200, doc);
      }

      // PUT /api/campaigns/:id
      if (req.method === "PUT" && segments.length === 3) {
        const body = await readJsonBody(req);
        const updates = {};

        if (body.name !== undefined) updates.name = String(body.name).trim();
        if (body.description !== undefined)
          updates.description = String(body.description).trim();
        if (body.platform !== undefined)
          updates.platform = String(body.platform).trim();
        if (body.targetAudience !== undefined)
          updates.targetAudience = String(body.targetAudience).trim();
        if (body.goals !== undefined)
          updates.goals = String(body.goals).trim();
        if (body.budget !== undefined) updates.budget = Number(body.budget);
        if (body.spent !== undefined) updates.spent = Number(body.spent);
        if (body.startDate !== undefined)
          updates.startDate = new Date(body.startDate);
        if (body.endDate !== undefined)
          updates.endDate = new Date(body.endDate);
        if (body.assignedCreators !== undefined)
          updates.assignedCreators = Array.isArray(body.assignedCreators)
            ? body.assignedCreators
            : [];
        if (body.utmCampaign !== undefined)
          updates.utmCampaign = String(body.utmCampaign)
            .trim()
            .toLowerCase();

        const updated = await Campaign.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        }).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Campaign not found" });

        return sendJson(res, 200, {
          message: "Campaign updated successfully",
          campaign: updated,
        });
      }

      // DELETE /api/campaigns/:id (archive)
      if (req.method === "DELETE" && segments.length === 3) {
        const updated = await Campaign.findByIdAndUpdate(
          id,
          { status: "archived" },
          { new: true }
        ).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Campaign not found" });

        return sendJson(res, 200, {
          message: "Campaign archived successfully",
          campaign: updated,
        });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // ROI ROUTES (Sub-issue #158)
    // Base: /api/roi/...
    // =========================================================
    if (segments[0] === "api" && segments[1] === "roi") {
      const campaignId = segments[2];
      if (!campaignId)
        return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(campaignId))
        return sendJson(res, 400, { message: "Invalid campaignId" });

      // GET /api/roi/:campaignId?days=7 (totals)
      if (req.method === "GET" && segments.length === 3) {
        const days = safeNumber(query.days, 7);
        const { from, to } = dateRangeDays(days);

        const rows = await CampaignMetric.aggregate([
          {
            $match: {
              campaignId: new mongoose.Types.ObjectId(campaignId),
              day: { $gte: from, $lte: to },
            },
          },
          {
            $group: {
              _id: "$campaignId",
              spend: { $sum: "$spend" },
              revenue: { $sum: "$revenue" },
              clicks: { $sum: "$clicks" },
              conversions: { $sum: "$conversions" },
            },
          },
        ]);

        const totals = rows[0] || {
          spend: 0,
          revenue: 0,
          clicks: 0,
          conversions: 0,
        };
        const profit = totals.revenue - totals.spend;
        const roiPct =
          totals.spend === 0 ? 0 : (profit / totals.spend) * 100;

        return sendJson(res, 200, {
          campaignId,
          from,
          to,
          spend: totals.spend,
          revenue: totals.revenue,
          profit,
          roi: `${roiPct.toFixed(2)}%`,
          clicks: totals.clicks,
          conversions: totals.conversions,
          lastUpdatedAt: new Date().toISOString(),
        });
      }

      // GET /api/roi/:campaignId/timeseries?days=7
      if (
        req.method === "GET" &&
        segments.length === 4 &&
        segments[3] === "timeseries"
      ) {
        const days = safeNumber(query.days, 7);
        const { from, to } = dateRangeDays(days);

        const rows = await CampaignMetric.aggregate([
          {
            $match: {
              campaignId: new mongoose.Types.ObjectId(campaignId),
              day: { $gte: from, $lte: to },
            },
          },
          {
            $group: {
              _id: "$day",
              spend: { $sum: "$spend" },
              revenue: { $sum: "$revenue" },
              clicks: { $sum: "$clicks" },
              conversions: { $sum: "$conversions" },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              day: "$_id",
              spend: 1,
              revenue: 1,
              clicks: 1,
              conversions: 1,
            },
          },
        ]);

        return sendJson(res, 200, { campaignId, from, to, series: rows });
      }

      // POST /api/roi/:campaignId/ingest
      if (
        req.method === "POST" &&
        segments.length === 4 &&
        segments[3] === "ingest"
      ) {
        const body = await readJsonBody(req);

        const day = String(body.day || yyyyMmDd()).slice(0, 10);
        const platform = String(body.platform || "unknown");

        const spend = safeNumber(body.spend, 0);
        const revenue = safeNumber(body.revenue, 0);
        const clicks = safeNumber(body.clicks, 0);
        const conversions = safeNumber(body.conversions, 0);

        const doc = await CampaignMetric.findOneAndUpdate(
          { campaignId, day, platform },
          { $inc: { spend, revenue, clicks, conversions } },
          { new: true, upsert: true }
        ).lean();

        return sendJson(res, 201, { message: "Ingested", metric: doc });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // REFERRALS CRUD
    // =========================================================
    if (segments[0] === "api" && segments[1] === "referrals") {
      // GET /api/referrals
      if (req.method === "GET" && segments.length === 2) {
        const referrals = await Referral.find()
          .populate({
            path: "referralCodeId",
            populate: { path: "userId", model: "UserProfile" },
          })
          .populate("refereeUUID")
          .populate("referrerUUID")
          .lean()
          .sort({ createdAt: -1 });
        return sendJson(res, 200, referrals);
      }

      // POST /api/referrals
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        const created = await Referral.create(body);
        return sendJson(res, 201, {
          message: "Referral added successfully",
          referral: created,
        });
      }

      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/referrals/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await Referral.findById(id)
          .populate({
            path: "referralCodeId",
            populate: { path: "userId", model: "UserProfile" },
          })
          .populate("refereeUUID")
          .populate("referrerUUID")
          .lean();
        if (!doc)
          return sendJson(res, 404, { message: "Referral not found" });
        return sendJson(res, 200, doc);
      }

      // PUT /api/referrals/:id
      if (req.method === "PUT" && segments.length === 3) {
        const body = await readJsonBody(req);
        const updated = await Referral.findByIdAndUpdate(id, body, {
          new: true,
          runValidators: true,
        }).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Referral not found" });

        return sendJson(res, 200, {
          message: "Referral updated successfully",
          referral: updated,
        });
      }

      // DELETE /api/referrals/:id
      if (req.method === "DELETE" && segments.length === 3) {
        const deleted = await Referral.findByIdAndDelete(id).lean();
        if (!deleted)
          return sendJson(res, 404, { message: "Referral not found" });

        return sendJson(res, 200, {
          message: "Referral deleted successfully",
          referral: deleted,
        });
      }
    }

    // =========================================================
    // REFERRAL CODES CRUD
    // =========================================================
    if (segments[0] === "api" && segments[1] === "referral-codes") {
      // GET /api/referral-codes
      if (req.method === "GET" && segments.length === 2) {
        const referralCodes = await ReferralCode.find()
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, referralCodes);
      }

      // POST /api/referral-codes
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        const created = await ReferralCode.create(body);
        return sendJson(res, 201, {
          message: "Referral Code added successfully",
          referralCode: created,
        });
      }

      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/referral-codes/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await ReferralCode.findById(id).lean();
        if (!doc)
          return sendJson(res, 404, { message: "Referral Code not found" });
        return sendJson(res, 200, doc);
      }

      // PUT /api/referral-codes/:id
      if (req.method === "PUT" && segments.length === 3) {
        const body = await readJsonBody(req);
        const updated = await ReferralCode.findByIdAndUpdate(id, body, {
          new: true,
          runValidators: true,
        }).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Referral Code not found" });

        return sendJson(res, 200, {
          message: "Referral Code updated successfully",
          referralCode: updated,
        });
      }

      // DELETE /api/referral-codes/:id
      if (req.method === "DELETE" && segments.length === 3) {
        const deleted = await ReferralCode.findByIdAndDelete(id).lean();
        if (!deleted)
          return sendJson(res, 404, { message: "Referral Code not found" });

        return sendJson(res, 200, {
          message: "Referral Code deleted successfully",
          referralCode: deleted,
        });
      }
    }

    // =========================================================
    // UU ROUTES
    // Base: /api/uu/...
    // =========================================================
    if (segments[0] === "api" && segments[1] === "uu") {
      const group = segments[2];
      const action = segments[3];
      const { from, to } = parseRange(query);

      // ---------- REFEREE ----------
      if (group === "referee") {
        if (req.method === "GET" && action === "overview") {
          const data = await RefereeUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$date", uu: { $sum: "$uu" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", uu: 1 } },
          ]);
          return sendJson(res, 200, { series: data, from, to });
        }

        if (req.method === "GET" && action === "members") {
          const members = await RefereeUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$refereeId", totalUu: { $sum: "$uu" } } },
            { $sort: { totalUu: -1 } },
            {
              $project: {
                _id: 0,
                id: "$_id",
                name: "$_id",
                totalUu: 1,
              },
            },
          ]);
          return sendJson(res, 200, { count: members.length, members, from, to });
        }

        if (req.method === "GET" && segments.length === 4 && action) {
          const refereeId = action;
          const docs = await RefereeUu.find({
            refereeId,
            date: { $gte: from, $lte: to },
          })
            .sort({ date: 1 })
            .lean();

          const series = docs.map((d) => ({ date: d.date, uu: d.uu }));
          const summary = buildSummary(series);
          return sendJson(res, 200, { id: refereeId, summary, series, from, to });
        }
      }

      // ---------- REFERRAL ----------
      if (group === "referral") {
        if (req.method === "GET" && action === "overview") {
          const data = await ReferralUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$date", uu: { $sum: "$uu" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", uu: 1 } },
          ]);
          return sendJson(res, 200, { series: data, from, to });
        }

        if (req.method === "GET" && action === "members") {
          const base = await ReferralUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$referralId", totalUu: { $sum: "$uu" } } },
            { $sort: { totalUu: -1 } },
          ]);

          const ids = base.map((x) => x._id);
          const validIds = ids.filter((id) => isValidObjectId(id));

          const profiles = validIds.length
            ? await Referral.find({ _id: { $in: validIds } })
                .select("firstName surName")
                .lean()
            : [];

          const profileMap = new Map(
            profiles.map((p) => [
              String(p._id),
              `${p.firstName} ${p.surName}`,
            ])
          );

          const members = base.map((x) => ({
            id: x._id,
            totalUu: x.totalUu,
            name: profileMap.get(String(x._id)) || x._id,
          }));

          return sendJson(res, 200, { count: members.length, members, from, to });
        }

        if (req.method === "GET" && segments.length === 4 && action) {
          const referralId = action;
          const docs = await ReferralUu.find({
            referralId,
            date: { $gte: from, $lte: to },
          })
            .sort({ date: 1 })
            .lean();

          const series = docs.map((d) => ({ date: d.date, uu: d.uu }));
          const summary = buildSummary(series);

          let profile = null;
          if (isValidObjectId(referralId)) {
            profile = await Referral.findById(referralId).lean();
          }

          return sendJson(res, 200, {
            id: referralId,
            profile,
            summary,
            series,
            from,
            to,
          });
        }
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // NOTIFICATIONS API
    // Base: /api/notifications
    // =========================================================
    if (segments[0] === "api" && segments[1] === "notifications") {
      const id = segments[2] || null;

      if (req.method === "GET" && segments.length === 2) {
        const userId = query.userId || null;
        const notifications = await Notification.find({
          $or: [{ userId: null }, { userId }],
        })
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, notifications);
      }

      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        if (!body.title || !body.message) {
          return sendJson(res, 400, {
            message: "title and message are required",
          });
        }
        const created = await Notification.create({
          userId: body.userId || null,
          title: String(body.title).trim(),
          message: String(body.message).trim(),
          type: body.type || "info",
          isRead: false,
        });
        return sendJson(res, 201, created);
      }

      if (req.method === "PATCH" && segments.length === 3 && id) {
        if (!isValidObjectId(id))
          return sendJson(res, 400, { message: "Invalid id" });

        const updated = await Notification.findByIdAndUpdate(
          id,
          { isRead: true },
          { new: true }
        ).lean();

        if (!updated)
          return sendJson(res, 404, { message: "Notification not found" });
        return sendJson(res, 200, updated);
      }

      if (req.method === "DELETE" && segments.length === 3 && id) {
        if (!isValidObjectId(id))
          return sendJson(res, 400, { message: "Invalid id" });

        const deleted = await Notification.findByIdAndDelete(id).lean();
        if (!deleted)
          return sendJson(res, 404, { message: "Notification not found" });
        return sendJson(res, 200, { message: "Deleted successfully" });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // COMMUNITY FEED / POSTS
    // Base: /api/posts
    // =========================================================
    if (segments[0] === "api" && segments[1] === "posts") {
      // GET /api/posts
      if (req.method === "GET" && segments.length === 2) {
        const sort = query.sort || "newest";
        const page = parseInt(query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        let sortQuery = { createdAt: -1 };
        if (sort === "popular") sortQuery = { likes: -1, createdAt: -1 };

        const posts = await Post.find()
          .sort(sortQuery)
          .skip(skip)
          .limit(limit);
        const totalPosts = await Post.countDocuments();
        const hasMore = totalPosts > skip + posts.length;

        return sendJson(res, 200, { success: true, posts, hasMore });
      }

      // POST /api/posts
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        const newPost = await Post.create({
          user: "650000000000000000000000",
          caption: body.caption,
          mediaType: body.mediaType || "none",
          mediaUrl: body.mediaUrl || null,
          hashtags: body.hashtags || [],
        });
        return sendJson(res, 201, { success: true, post: newPost });
      }

      const postId = segments[2];
      if (!postId) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(postId))
        return sendJson(res, 400, { message: "Invalid post id" });

      // DELETE /api/posts/:id
      if (req.method === "DELETE" && segments.length === 3) {
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost)
          return sendJson(res, 404, { message: "Post not found" });
        await Comment.deleteMany({ post: postId });
        return sendJson(res, 200, {
          success: true,
          message: "Post deleted successfully",
        });
      }

      // POST /api/posts/:id/like
      if (
        req.method === "POST" &&
        segments.length === 4 &&
        segments[3] === "like"
      ) {
        const post = await Post.findById(postId);
        if (!post) return sendJson(res, 404, { message: "Post not found" });

        const userId = "650000000000000000000000";
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
          post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
          post.likes.push(userId);
        }
        await post.save();
        return sendJson(res, 200, {
          success: true,
          likes: post.likes.length,
          hasLiked: !hasLiked,
        });
      }

      // POST /api/posts/:id/comment
      if (
        req.method === "POST" &&
        segments.length === 4 &&
        segments[3] === "comment"
      ) {
        const body = await readJsonBody(req);
        const newComment = await Comment.create({
          post: postId,
          user: "650000000000000000000000",
          text: body.text,
        });
        return sendJson(res, 201, { success: true, comment: newComment });
      }

      // GET /api/posts/:id/comment
      if (
        req.method === "GET" &&
        segments.length === 4 &&
        segments[3] === "comment"
      ) {
        const comments = await Comment.find({ post: postId }).sort({
          createdAt: -1,
        });
        return sendJson(res, 200, { success: true, comments });
      }

      // POST /api/posts/:id/report
      if (
        req.method === "POST" &&
        segments.length === 4 &&
        segments[3] === "report"
      ) {
        await Post.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } });
        return sendJson(res, 200, {
          success: true,
          message: "Post reported",
        });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // ===========================
    // HEALTH
    // ===========================
    if (req.method === "GET" && path === "/health") {
      return sendJson(res, 200, { status: "OK" });
    }

    // =========================================================
    // MILESTONE TYPES API
    // Base: /api/milestone-types
    // =========================================================
    if (segments[0] === "api" && segments[1] === "milestone-types") {
      if (req.method === "GET" && segments.length === 2) {
        const items = await MilestoneType.find()
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, items);
      }

      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);

        if (!body.title || !body.metric || !body.computeMethod) {
          return sendJson(res, 400, {
            message: "title, metric, computeMethod are required",
          });
        }

        const created = await MilestoneType.create({
          title: String(body.title).trim(),
          description: String(body.description || "").trim(),
          category: String(body.category || "general").trim(),
          metric: String(body.metric).trim(),
          computeMethod: String(body.computeMethod).trim(),
          goal: Number(body.goal || 0),
          rewardPoints: Number(body.rewardPoints || 0),
          isActive: body.isActive !== undefined ? !!body.isActive : true,
          period: String(body.period || "lifetime").trim(),
          scope: String(body.scope || "global").trim(),
          scopeValue: body.scopeValue ?? null,
          slots: Number(body.slots || 1),
          version: Number(body.version || 1),
          updatedBy: body.updatedBy ?? null,
        });

        return sendJson(res, 201, created);
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // USER MILESTONES API
    // Base: /api/user-milestones
    // =========================================================
    if (segments[0] === "api" && segments[1] === "user-milestones") {
      const creatorId = segments[2];

      if (req.method === "GET" && segments.length === 3 && creatorId) {
        const items = await UserMilestone.find({ creatorId })
          .populate("milestoneTypeId")
          .sort({ createdAt: -1 })
          .lean();
        return sendJson(res, 200, items);
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // =========================================================
    // LEADERBOARDS API
    // Base: /api/leaderboards
    // =========================================================
    if (segments[0] === "api" && segments[1] === "leaderboards") {
      // GET /api/leaderboards/best-creators-month
      if (
        req.method === "GET" &&
        segments[2] === "best-creators-month"
      ) {
        return sendJson(res, 200, [
          { creatorId: "u1", name: "Creator A", points: 1000, clicks: 120, leads: 12 },
          { creatorId: "u2", name: "Creator B", points: 850,  clicks: 95,  leads: 8  },
          { creatorId: "u3", name: "Creator C", points: 700,  clicks: 70,  leads: 5  },
        ]);
      }

      // GET /api/leaderboards/best-creator-by-city
      if (
        req.method === "GET" &&
        segments[2] === "best-creator-by-city"
      ) {
        return sendJson(res, 200, {
          Berlin: { creatorId: "u10", name: "Berlin Winner", points: 800, clicks: 50, leads: 6 },
          Düsseldorf: { creatorId: "u20", name: "Düsseldorf Winner", points: 750, clicks: 45, leads: 5 },
        });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // FINAL CATCH-ALL 404
    return sendJson(res, 404, { message: "Route not found" });

  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: "Server error" });
  }
});

// ─── REMOVED: app.use() calls that caused "app is not defined" error ──────────
// This server uses raw http.createServer, NOT Express.
// All routes are handled inside the http.createServer block above.
// app.use('/api/leaderboard', leaderboardRoutes);  ← DELETED
// app.use('/api/events',      eventsRoutes);        ← DELETED
// app.use('/api/creators',    creatorsRoutes);      ← DELETED

// ---------------- connect & listen ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, () =>
      console.log(`Node server running on port ${PORT}`)
    );

    // =========================================================
    // DYNAMIC ROI DATA GENERATOR (Sub-issue #158.3)
    // Inserts/upserts metrics every 2 minutes
    // =========================================================
    setInterval(async () => {
      try {
        const day = yyyyMmDd(new Date());

        const campaigns = await Campaign.find({ status: "active" })
          .select("_id platforms")
          .lean();

        for (const c of campaigns) {
          const platform =
            Array.isArray(c.platforms) && c.platforms.length
              ? String(c.platforms[0])
              : "unknown";

          const spend = Math.round(Math.random() * 200);
          const revenue = Math.round(Math.random() * 500);
          const clicks = Math.round(Math.random() * 120);
          const conversions = Math.round(Math.random() * 10);

          await CampaignMetric.findOneAndUpdate(
            { campaignId: c._id, day, platform },
            { $inc: { spend, revenue, clicks, conversions } },
            { upsert: true, new: true }
          );
        }

        console.log(
          `[ROI] metrics updated for ${campaigns.length} campaigns (${day})`
        );
      } catch (e) {
        console.error("[ROI] metric job failed:", e);
      }
    }, 2 * 60 * 1000);
  })
  .catch((err) => console.error("MongoDB connection error:", err));