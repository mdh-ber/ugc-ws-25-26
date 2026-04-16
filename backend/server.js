const Post = require("./models/Post");
const Lead = require("./models/Lead");
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
const User = require("./models/user.model");
const authController = require("./controllers/authController");
const Notification = require("./models/Notification");
const MilestoneType = unwrapDefault(require("./models/MilestoneType"));
const UserMilestone = unwrapDefault(require("./models/UserMilestone"));

// ✅ IMPORTANT: these match your filenames in models folder
const Training = require("./models/Training");
const Event = require("./models/Event");
const Reward = require("./models/reward");
const leadRoutes = require("./routes/leadRoutes");
const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/ReferralUu");
const { Referral,ReferralCode } = require("./models/Referral");
const Userprofile = require("./models/userProfile.model"); // Reference UserProfile for RefereeUu 

// ✅ NEW (Sub-issue #155)
const Campaign = require("./models/Campaign");
const Certificate = require("./models/Certificate");
// ✅ NEW (Sub-issue #158)
// const CampaignMetric = require("./models/CampaignMetric");
//const CampaignMetric = require("./models/CampaignMetric");

const PORT = process.env.PORT || 5000;
const Visit = require("./models/visit");
const jwt = require("jsonwebtoken");
const UserProfile = require("./models/userProfile.model");

// LEADERBOARD (Enterprise Weighted Scoring)
// ===========================
const leaderboardEntrySchema = new mongoose.Schema(
  {
    creatorName: { type: String, required: true, trim: true },
    month: { type: String, required: true, trim: true }, // YYYY-MM
    platform: { type: String, required: true, trim: true, default: "Unknown" },
    location: { type: String, required: true, trim: true, default: "Unknown" },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    leads: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },

    revenue: { type: Number, default: 0 },

    certificates: { type: Number, default: 0 },
    milestones: { type: Number, default: 0 },
    rewards: { type: Number, default: 0 },

    engagementIndex: { type: Number, default: 0 },
    conversionIndex: { type: Number, default: 0 },
    revenueIndex: { type: Number, default: 0 },
    growthIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LeaderboardEntry =
  mongoose.models.LeaderboardEntry ||
  mongoose.model("LeaderboardEntry", leaderboardEntrySchema);

// ---------------- helpers ----------------



// ===========================
// Leaderboard score helpers
// ===========================
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function maxOf(list, key) {
  let m = 1;
  for (const x of list) {
    const v = Number(x?.[key] || 0);
    if (Number.isFinite(v) && v > m) m = v;
  }
  return m;
}

function norm100(value, max) {
  const v = Number(value || 0);
  if (!Number.isFinite(v) || max <= 0) return 0;
  return clamp(Math.round((v / max) * 100), 0, 100);
}

function computeEnterpriseScore(entry, maxes) {
  const engagementIndex = clamp(
    Math.round(
      0.40 * norm100(entry.views, maxes.views) +
        0.25 * norm100(entry.likes, maxes.likes) +
        0.20 * norm100(entry.comments, maxes.comments) +
        0.15 * norm100(entry.shares, maxes.shares)
    ),
    0,
    100
  );

  const conversionIndex = clamp(
    Math.round(
      0.35 * norm100(entry.leads, maxes.leads) +
        0.65 * norm100(entry.conversions, maxes.conversions)
    ),
    0,
    100
  );

  const revenueIndex = clamp(norm100(entry.revenue, maxes.revenue), 0, 100);

  const growthIndex = clamp(
    Math.round(
      0.20 * norm100(entry.certificates, maxes.certificates) +
        0.45 * norm100(entry.milestones, maxes.milestones) +
        0.35 * norm100(entry.rewards, maxes.rewards)
    ),
    0,
    100
  );

  const score = Math.round(
    10 *
      (0.30 * engagementIndex +
        0.35 * conversionIndex +
        0.25 * revenueIndex +
        0.10 * growthIndex)
  );

  return { engagementIndex, conversionIndex, revenueIndex, growthIndex, score };
}

function yyyymmFromIssueDate(issueDateStr) {
  if (!issueDateStr || typeof issueDateStr !== "string") return "unknown";
  return issueDateStr.slice(0, 7);
}



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
  const baseURL = `http://${req.headers.host || 'localhost'}`;
  const parsed = new URL(req.url, baseURL);
  const path = parsed.pathname;
  const query = Object.fromEntries(parsed.searchParams.entries());
  const segments = path.split("/").filter(Boolean); // no empty

  try {
    // ===========================
    // AUTH
    // ===========================
 if (req.method === "POST" && path === "/api/visits/track"){
  const clientIp = req.ip || req.headers['x-forwarded-for'] || "unknown";
  const userAgent = req.headers['user-agent'] || "unknown";
  const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");
  await Visit.create({ ipHash, userAgent });
  return sendJson(res, 200, { message: "Visit tracked" });
 }
  if (req.method === "GET" && path === "/api/visits/stats"){
    const totalVisits = await Visit.countDocuments();
    const uniqueIps = await Visit.distinct("ipHash");
    return sendJson(res, 200, { totalVisits, uniqueVisits: uniqueIps.length });
  }
    // ===========================
// AUTH LOGIN (ADMIN + USER)
// ===========================
if (req.method === "POST" && path === "/api/auth/login") {

  // const body = await readJsonBody(req);

  // const email = (body.email || "")
  //   .trim()
  //   .toLowerCase();

  // const password = body.password || "";

  // ✅ HARDCODED ADMIN LOGIN
  // if (
  //   email === "admin@mdh.com" &&
  //   password === "admin123"
  // ) {
  //   return sendJson(res, 200, {
  //     token: "demo-token-123",
  //     user: {
  //       email,
  //       role: "admin",
  //     },
  //   });
  // }

  // ✅ OTHERWISE → NORMAL USER LOGIN (MongoDB)
  return authController.login(req, res, readJsonBody, sendJson);
}  // ===========================
    // AUTH REGISTER
    // ===========================
    if (req.method === "POST" && path === "/api/auth/register") {
  return authController.register(req, res, readJsonBody, sendJson);
}
// USER PROFILE (MANUAL ROUTE)
    // ===========================

    if (req.method === "GET" && path === "/api/user-profile/me") {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return sendJson(res, 401, { message: "No token provided" });

      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const profile = await UserProfile.findOne({ userId: decoded.id });

        if (!profile)
          return sendJson(res, 404, { message: "Profile not found" });

        return sendJson(res, 200, profile);
      } catch (err) {
        return sendJson(res, 401, { message: "Invalid token" });
      }
    }

    if (req.method === "PUT" && path === "/api/user-profile/me") {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return sendJson(res, 401, { message: "No token provided" });

      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const body = await readJsonBody(req);

        const update = { ...body };

        if (typeof update.socialAccounts === "string") {
          update.socialAccounts = update.socialAccounts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }

        if (update.dob === "") update.dob = null;

        const updated = await UserProfile.findOneAndUpdate(
          { userId: decoded.id },
          update,
          { new: true }
        );

        if (!updated)
          return sendJson(res, 404, { message: "Profile not found" });

        return sendJson(res, 200, updated);
      } catch (err) {
        return sendJson(res, 401, { message: "Invalid token" });
      }
    }
    if (req.method === "POST" && path === "/api/visits/track"){
      const clientIp = req.ip || req.headers['x-forwarded-for'] || "unknown";
      const userAgent = req.headers['user-agent'] || "unknown";
      const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");
      await Visit.create({ ipHash, userAgent });
      return sendJson(res, 200, { message: "Visit tracked" });
    }
    
    if (req.method === "GET" && path === "/api/visits/stats"){
      const totalVisits = await Visit.countDocuments();
      const uniqueIps = await Visit.distinct("ipHash");
      return sendJson(res, 200, { totalVisits, uniqueVisits: uniqueIps.length });
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

// ===========================
// LEADS
// ===========================
if (req.method === "GET" && path.startsWith("/api/leads/track/")) {
  const platform = decodeURIComponent(path.split("/").pop() || "").toLowerCase();
  await Lead.create({ platform });
  return sendJson(res, 200, { success: true, message: "Lead tracked successfully" });
}

if (req.method === "GET" && path === "/api/leads/stats") {
  const stats = await Lead.aggregate([
    { $group: { _id: "$platform", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return sendJson(res, 200, stats);
}

    //API VISIT TRACKING
{
  const clientIp = req.ip || req.headers['x-forwarded-for'] || "unknown";
  const userAgent = req.headers['user-agent'] || "unknown";
  const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");
  await Visit.create({ ipHash, userAgent });
  return sendJson(res, 200, { message: "Visit tracked" });
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
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
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
    // TRAININGS ✅ NEW
    // ===========================
    const trainingController = require("./controllers/trainingController");
    if (path.startsWith("/api/trainings")) {
      const id = segments[2];
      if (req.method === "GET") {
        if (id) {
          return trainingController.getTrainingById({ params: { id } }, res);
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


// CERTIFICATES 
// Base: /api/certificates
// ===========================
if (segments[0] === "api" && segments[1] === "certificates") {
  // GET /api/certificates
  if (req.method === "GET" && segments.length === 2) {
    const items = await Certificate.find().sort({ createdAt: -1 }).lean();
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
      return sendJson(res, 400, { message: "Issue date must be YYYY-MM-DD" });
    }

    const created = await Certificate.create({
      title,
      issueDate,
      issuer,
      issuedTo,
      type,
    });

    // ✅ Update leaderboard (certificate affects growth)
try {
  const month = yyyymmFromIssueDate(issueDate);
  const creatorName = issuedTo;

  await LeaderboardEntry.findOneAndUpdate(
    { creatorName, month, platform: "Unknown", location: "Unknown" },
    { $inc: { certificates: 1 }, $setOnInsert: { creatorName, month, platform: "Unknown", location: "Unknown" } },
    { upsert: true, new: true }
  );
} catch (e) {
  console.error("[Leaderboard] certificate increment failed:", e);
}

return sendJson(res, 201, created);
  }

  // PUT /api/certificates/:id  (EDIT)
  if (req.method === "PUT" && segments.length === 3) {
    const id = segments[2];
    if (!isValidObjectId(id)) return sendJson(res, 400, { message: "Invalid id" });

    const body = await readJsonBody(req);

    const updates = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.issueDate !== undefined) updates.issueDate = String(body.issueDate).trim();
    if (body.issuer !== undefined) updates.issuer = String(body.issuer).trim();
    if (body.issuedTo !== undefined) updates.issuedTo = String(body.issuedTo).trim();
    if (body.type !== undefined) updates.type = String(body.type).trim();

    // validation
    if (updates.title !== undefined && !updates.title) return sendJson(res, 400, { message: "Title is required." });
    if (updates.issuer !== undefined && !updates.issuer) return sendJson(res, 400, { message: "Issuer is required." });
    if (updates.issuedTo !== undefined && !updates.issuedTo) return sendJson(res, 400, { message: "IssuedTo is required." });
    if (updates.type !== undefined && !updates.type) return sendJson(res, 400, { message: "Type is required." });

    if (updates.issueDate !== undefined) {
      if (!updates.issueDate) return sendJson(res, 400, { message: "Issue date is required." });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.issueDate)) {
        return sendJson(res, 400, { message: "Issue date must be YYYY-MM-DD" });
      }
    }

    const updated = await Certificate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return sendJson(res, 404, { message: "Certificate not found" });

    return sendJson(res, 200, { message: "Certificate updated", certificate: updated });
  }

  // DELETE /api/certificates/:id
  if (req.method === "DELETE" && segments.length === 3) {
    const id = segments[2];
    if (!isValidObjectId(id)) return sendJson(res, 400, { message: "Invalid id" });

    const deleted = await Certificate.findByIdAndDelete(id).lean();
    if (!deleted) return sendJson(res, 404, { message: "Certificate not found" });

    return sendJson(res, 200, { message: "Certificate deleted", certificate: deleted });
  }

  return sendJson(res, 404, { message: "Route not found" });
}  // ===========================
    // EVENTS ✅ NEW
    // ===========================
    if (req.method === "GET" && path === "/api/events") {
      const items = await Event.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, items);
    }

    // ===========================
    // REWARDS ✅ NEW
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
      const type = (body.type || "").trim(); // do/dont
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
      const id = segments[2]; // ["api","guidelines",":id"]
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

  if (!body.name) return sendJson(res, 400, { message: "name is required" });
  if (!body.startDate) return sendJson(res, 400, { message: "startDate is required" });
  if (!body.endDate) return sendJson(res, 400, { message: "endDate is required" });
  if (!body.utmCampaign) return sendJson(res, 400, { message: "utmCampaign is required" });

  const created = await Campaign.create({
    name: String(body.name).trim(),
    description: String(body.description || "").trim(),
    platform: String(body.platform || "Instagram").trim(),
    targetAudience: String(body.targetAudience || "").trim(),
    goals: String(body.goals || "").trim(),

    // ✅ SAVE budget/spent
    budget: Number(body.budget || 0),
    spent: Number(body.spent || 0),

    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),

    assignedCreators: Array.isArray(body.assignedCreators) ? body.assignedCreators : [],

    utmCampaign: String(body.utmCampaign).trim().toLowerCase(),
    status: "active",
  });

  return sendJson(res, 201, created);
}

      // /api/campaigns/:id
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id)) return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/campaigns/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await Campaign.findById(id).lean();
        if (!doc) return sendJson(res, 404, { message: "Campaign not found" });
        return sendJson(res, 200, doc);
      }

      // PUT /api/campaigns/:id
if (req.method === "PUT" && segments.length === 3) {
  const body = await readJsonBody(req);

  const updates = {};

  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.description !== undefined) updates.description = String(body.description).trim();

  if (body.platform !== undefined) updates.platform = String(body.platform).trim();

  if (body.targetAudience !== undefined)
    updates.targetAudience = String(body.targetAudience).trim();

  if (body.goals !== undefined) updates.goals = String(body.goals).trim();

  // ✅ FIXED: budget & spent
  if (body.budget !== undefined)
    updates.budget = Number(body.budget);

  if (body.spent !== undefined)
    updates.spent = Number(body.spent);

  if (body.startDate !== undefined)
    updates.startDate = new Date(body.startDate);

  if (body.endDate !== undefined)
    updates.endDate = new Date(body.endDate);

  if (body.assignedCreators !== undefined)
    updates.assignedCreators = Array.isArray(body.assignedCreators)
      ? body.assignedCreators
      : [];

  if (body.utmCampaign !== undefined)
    updates.utmCampaign = String(body.utmCampaign).trim().toLowerCase();

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

        if (!updated) return sendJson(res, 404, { message: "Campaign not found" });

        return sendJson(res, 200, {
          message: "Campaign archived successfully",
          campaign: updated,
        });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

// =========================================================
// LEADERBOARD ROUTES (NO EXPRESS)
// Base: /api/leaderboard
// =========================================================
if (segments[0] === "api" && segments[1] === "leaderboard") {
  // GET /api/leaderboard?month=2026-02&platform=All&location=All
  if (req.method === "GET" && segments.length === 2) {
    const monthQ = String(query.month || "All").trim();
    const platformQ = String(query.platform || "All").trim();
    const locationQ = String(query.location || "All").trim();

    const filter = {};
    if (monthQ !== "All") filter.month = monthQ;
    if (platformQ !== "All") filter.platform = platformQ;
    if (locationQ !== "All") filter.location = locationQ;

    const rows = await LeaderboardEntry.find(filter).lean();

    const maxes = {
      views: maxOf(rows, "views"),
      likes: maxOf(rows, "likes"),
      comments: maxOf(rows, "comments"),
      shares: maxOf(rows, "shares"),
      leads: maxOf(rows, "leads"),
      conversions: maxOf(rows, "conversions"),
      revenue: maxOf(rows, "revenue"),
      certificates: maxOf(rows, "certificates"),
      milestones: maxOf(rows, "milestones"),
      rewards: maxOf(rows, "rewards"),
    };

    const scored = rows.map((r) => ({ ...r, ...computeEnterpriseScore(r, maxes) }));
    scored.sort((a, b) => b.score - a.score);

    const ranked = scored.map((x, idx) => ({ ...x, rank: idx + 1 }));

    const top3 = ranked.slice(0, 3);

    const leaderBerlin =
      ranked.filter((x) => x.location === "Berlin").sort((a, b) => b.score - a.score)[0] || null;

    const leaderDusseldorf =
      ranked.filter((x) => x.location === "Düsseldorf").sort((a, b) => b.score - a.score)[0] || null;

    return sendJson(res, 200, {
      filters: { month: monthQ, platform: platformQ, location: locationQ },
      top3,
      locationLeaders: { Berlin: leaderBerlin, Düsseldorf: leaderDusseldorf },
      ranked,
    });
  }

  // POST /api/leaderboard/ingest (for testing)
  if (req.method === "POST" && segments.length === 3 && segments[2] === "ingest") {
    const body = await readJsonBody(req);

    const creatorName = String(body.creatorName || "").trim();
    const month = String(body.month || "").trim();
    const platform = String(body.platform || "Unknown").trim();
    const location = String(body.location || "Unknown").trim();
    const inc = body.inc && typeof body.inc === "object" ? body.inc : {};

    if (!creatorName || !month) {
      return sendJson(res, 400, { message: "creatorName and month are required." });
    }

    const allowed = [
      "views",
      "likes",
      "comments",
      "shares",
      "leads",
      "conversions",
      "revenue",
      "certificates",
      "milestones",
      "rewards",
    ];

    const $inc = {};
    for (const k of allowed) {
      if (inc[k] !== undefined) $inc[k] = safeNumber(inc[k], 0);
    }

    const doc = await LeaderboardEntry.findOneAndUpdate(
      { creatorName, month, platform, location },
      { $inc, $setOnInsert: { creatorName, month, platform, location } },
      { upsert: true, new: true }
    ).lean();

    return sendJson(res, 201, { message: "Ingested", entry: doc });
  }

  return sendJson(res, 404, { message: "Route not found" });
}

    // =========================================================
    // ROI ROUTES (Sub-issue #158) - NO EXPRESS
    // Base: /api/roi/...
    // =========================================================
    if (segments[0] === "api" && segments[1] === "roi") {
      const campaignId = segments[2]; // /api/roi/:campaignId
      if (!campaignId) return sendJson(res, 404, { message: "Route not found" });
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

        const totals = rows[0] || { spend: 0, revenue: 0, clicks: 0, conversions: 0 };
        const profit = totals.revenue - totals.spend;
        //formula
        const roiPct = totals.spend === 0 ? 0 : (profit / totals.spend) * 100;

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
      if (req.method === "GET" && segments.length === 4 && segments[3] === "timeseries") {
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
      if (req.method === "POST" && segments.length === 4 && segments[3] === "ingest") {
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
    // REFERRALS CRUD (your ReferralList uses /api/referrals)
    // =========================================================
    if (segments[0] === "api" && segments[1] === "referrals") {
      // GET /api/referrals
      if (req.method === "GET" && segments.length === 2) {
        const referrals = await Referral.find()
          .populate({
            path: "referralCodeId",
            populate: {
              path: "userId",
              model: "UserProfile",
              
            },
          })
          .populate("refereeUUID") // Populate RefereeUu details
          .populate("referrerUUID") // Populate ReferralUu details
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

      // /api/referrals/:id
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/referrals/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await Referral.findById(id)
          .populate({
            path: "referralCodeId",
            populate: {
              path: "userId",
              model: "UserProfile",
              
            },
          })
          .populate('refereeUUID') // Populate RefereeUu details
          .populate('referrerUUID') // Populate ReferralUu details
          .lean();
        if (!doc) return sendJson(res, 404, { message: "Referral not found" });
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
    // REFERRAL CODE CRUD (your ReferralCodeList uses /api/referral-codes)
    // =========================================================
    if (segments[0] === "api" && segments[1] === "referral-codes") {
      // GET /api/referral-codes
      if (req.method === "GET" && segments.length === 2) {
        const referralCodes = await ReferralCode.find().sort({ createdAt: -1 }).lean();
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

      // /api/referral-codes/:id
      const id = segments[2];
      if (!id) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(id))
        return sendJson(res, 400, { message: "Invalid id" });

      // GET /api/referral-codes/:id
      if (req.method === "GET" && segments.length === 3) {
        const doc = await ReferralCode.findById(id).lean();
        if (!doc) return sendJson(res, 404, { message: "Referral Code not found" });
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
    // UU ROUTES (NO EXPRESS)
    // Base: /api/uu/...
    // =========================================================
    if (segments[0] === "api" && segments[1] === "uu") {
      const group = segments[2]; // "referee" | "referral"
      const action = segments[3]; // "overview" | "members" | ":id"

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
          return sendJson(res, 200, {
            count: members.length,
            members,
            from,
            to,
          });
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

          return sendJson(res, 200, {
            id: refereeId,
            summary,
            series,
            from,
            to,
          });
        }
      }

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

          return sendJson(res, 200, {
            count: members.length,
            members,
            from,
            to,
          });
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
      return sendJson(res, 400, { message: "title and message are required" });
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
    if (!isValidObjectId(id)) {
      return sendJson(res, 400, { message: "Invalid id" });
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).lean();

    if (!updated) return sendJson(res, 404, { message: "Notification not found" });
    return sendJson(res, 200, updated);
  }

  if (req.method === "DELETE" && segments.length === 3 && id) {
    if (!isValidObjectId(id)) {
      return sendJson(res, 400, { message: "Invalid id" });
    }

    const deleted = await Notification.findByIdAndDelete(id).lean();
    if (!deleted) return sendJson(res, 404, { message: "Notification not found" });
    return sendJson(res, 200, { message: "Deleted successfully" });
  }

  return sendJson(res, 404, { message: "Route not found" });
} 

    // =========================================================
    // COMMUNITY FEED / POSTS
    // Base: /api/posts
    // =========================================================
    if (segments[0] === "api" && segments[1] === "posts") {
      
      // GET /api/posts (Fetch feed with Pagination)
      if (req.method === "GET" && segments.length === 2) {
        const sort = query.sort || "newest";
        const page = parseInt(query.page) || 1;
        const limit = 5; // Load 5 posts at a time
        const skip = (page - 1) * limit;

        let sortQuery = { createdAt: -1 };
        if (sort === "popular") sortQuery = { likes: -1, createdAt: -1 };

        const posts = await Post.find().sort(sortQuery).skip(skip).limit(limit);
        const totalPosts = await Post.countDocuments();
        const hasMore = totalPosts > skip + posts.length; // Check if there are more posts left

        return sendJson(res, 200, { success: true, posts, hasMore });
      }

      // POST /api/posts (Create a post)
      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        
        // Using a dummy user ID for now
        const newPost = await Post.create({
          user: "650000000000000000000000", 
          caption: body.caption,
          mediaType: body.mediaType || "none",
          mediaUrl: body.mediaUrl || null, // Ensure we save the mock URL!
          hashtags: body.hashtags || [],
        });
        return sendJson(res, 201, { success: true, post: newPost });
      }

      const postId = segments[2];
      if (!postId) return sendJson(res, 404, { message: "Route not found" });
      if (!isValidObjectId(postId)) return sendJson(res, 400, { message: "Invalid post id" });

      // ✅ NEW: DELETE /api/posts/:id (Delete a post)
      if (req.method === "DELETE" && segments.length === 3) {
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) return sendJson(res, 404, { message: "Post not found" });
        
        // Cleanup: Delete all comments associated with this post
        await Comment.deleteMany({ post: postId });
        
        return sendJson(res, 200, { success: true, message: "Post deleted successfully" });
      }

      // POST /api/posts/:id/like
      if (req.method === "POST" && segments.length === 4 && segments[3] === "like") {
        const post = await Post.findById(postId);
        if (!post) return sendJson(res, 404, { message: "Post not found" });

        const userId = "650000000000000000000000"; // Dummy user ID
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
          post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
          post.likes.push(userId);
        }
        await post.save();
        return sendJson(res, 200, { success: true, likes: post.likes.length, hasLiked: !hasLiked });
      }

      // POST /api/posts/:id/comment
      if (req.method === "POST" && segments.length === 4 && segments[3] === "comment") {
        const body = await readJsonBody(req);
        const newComment = await Comment.create({
          post: postId,
          user: "650000000000000000000000", // Dummy user ID
          text: body.text
        });
        return sendJson(res, 201, { success: true, comment: newComment });
      }

      // GET /api/posts/:id/comment
      if (req.method === "GET" && segments.length === 4 && segments[3] === "comment") {
        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 });
        return sendJson(res, 200, { success: true, comments });
      }

      // POST /api/posts/:id/report
      if (req.method === "POST" && segments.length === 4 && segments[3] === "report") {
        await Post.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } });
        return sendJson(res, 200, { success: true, message: "Post reported" });
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

  // =========================
  // GET /api/milestone-types
  // Returns all milestone types
  // =========================
  if (req.method === "GET" && segments.length === 2) {
    const items = await MilestoneType.find()
      .sort({ createdAt: -1 })
      .lean();

    return sendJson(res, 200, items);
  }

  // =========================
  //  POST /api/milestone-types
  // Creates a new milestone type
  // =========================
  if (req.method === "POST" && segments.length === 2) {
    const body = await readJsonBody(req);

    // Validation
    if (!body.title || !body.metric || !body.computeMethod) {
      return sendJson(res, 400, {
        message: "title, metric, computeMethod are required",
      });
    }
    // ===========================
    // // USER PROFILE (MANUAL ROUTE)
    // // ===========================

    // if (req.method === "GET" && path === "/api/user-profile/me") {
    //   const authHeader = req.headers.authorization;

    //   if (!authHeader)
    //     return sendJson(res, 401, { message: "No token provided" });

    //   try {
    //     const token = authHeader.split(" ")[1];
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //     const profile = await UserProfile.findOne({ userId: decoded.id });

    //     if (!profile)
    //       return sendJson(res, 404, { message: "Profile not found" });

    //     return sendJson(res, 200, profile);
    //   } catch (err) {
    //     return sendJson(res, 401, { message: "Invalid token" });
    //   }
    // }

    // if (req.method === "PUT" && path === "/api/user-profile/me") {
    //   const authHeader = req.headers.authorization;

    //   if (!authHeader)
    //     return sendJson(res, 401, { message: "No token provided" });

    //   try {
    //     const token = authHeader.split(" ")[1];
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //     const body = await readJsonBody(req);

    //     const update = { ...body };

    //     if (typeof update.socialAccounts === "string") {
    //       update.socialAccounts = update.socialAccounts
    //         .split(",")
    //         .map((s) => s.trim())
    //         .filter(Boolean);
    //     }

    //     if (update.dob === "") update.dob = null;

    //     const updated = await UserProfile.findOneAndUpdate(
    //       { userId: decoded.id },
    //       update,
    //       { new: true }
    //     );

    //     if (!updated)
    //       return sendJson(res, 404, { message: "Profile not found" });

    //     return sendJson(res, 200, updated);
    //   } catch (err) {
    //     return sendJson(res, 401, { message: "Invalid token" });
    //   }
    // }

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

  // =========================
  // GET /api/user-milestones/:creatorId
  // Returns milestones for a specific user
  // =========================
  if (req.method === "GET" && segments.length === 3 && creatorId) {
    const items = await UserMilestone.find({ creatorId })
      .populate("milestoneTypeId")
      .sort({ createdAt: -1 })
      .lean();

    return sendJson(res, 200, items);
  }

  // No POST here yet
  // (User milestones are not being created via API yet)

  return sendJson(res, 404, { message: "Route not found" });
}
// =========================================================
// LEADERBOARDS API (DEMO DATA)
// Base: /api/leaderboards
// =========================================================
if (segments[0] === "api" && segments[1] === "leaderboards") {

  // GET /api/leaderboards/best-creators-month
  if (req.method === "GET" && segments[2] === "best-creators-month") {
    return sendJson(res, 200, [
      { creatorId: "u1", name: "Creator A", points: 1000, clicks: 120, leads: 12 },
      { creatorId: "u2", name: "Creator B", points: 850, clicks: 95, leads: 8 },
      { creatorId: "u3", name: "Creator C", points: 700, clicks: 70, leads: 5 },
    ]);
  }

  // GET /api/leaderboards/best-creator-by-city?cities=Berlin,Düsseldorf
  if (req.method === "GET" && segments[2] === "best-creator-by-city") {
    return sendJson(res, 200, {
      Berlin: { creatorId: "u10", name: "Berlin Winner", points: 800, clicks: 50, leads: 6 },
      Düsseldorf: { creatorId: "u20", name: "Düsseldorf Winner", points: 750, clicks: 45, leads: 5 },
    });
  }

  return sendJson(res, 404, { message: "Route not found" });
}
    // FINAL CATCH-ALL 404 (This MUST be at the end, not above the posts block!)
    return sendJson(res, 404, { message: "Route not found" });

  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: "Server error" });
  }
});

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
    // Later replace with real Meta/Shopify/API ingestion
    // =========================================================
    setInterval(async () => {
      try {
        const day = yyyyMmDd(new Date());

        // Only active campaigns
        const campaigns = await Campaign.find({ status: "active" })
          .select("_id platforms")
          .lean();

        for (const c of campaigns) {
          // pick a platform name (your campaigns use "platforms" array)
          const platform =
            Array.isArray(c.platforms) && c.platforms.length
              ? String(c.platforms[0])
              : "unknown";

          // random demo increments (dynamic)
          const spend = Math.round(Math.random() * 200); // 0..200
          const revenue = Math.round(Math.random() * 500); // 0..500
          const clicks = Math.round(Math.random() * 120); // 0..120
          const conversions = Math.round(Math.random() * 10); // 0..10

          await CampaignMetric.findOneAndUpdate(
            { campaignId: c._id, day, platform },
            { $inc: { spend, revenue, clicks, conversions } },
            { upsert: true, new: true }
          );
        }

        console.log(`[ROI] metrics updated for ${campaigns.length} campaigns (${day})`);
      } catch (e) {
        console.error("[ROI] metric job failed:", e);
      }
    }, 2 * 60 * 1000); // every 2 minutes
  })
  .catch((err) => console.error("MongoDB connection error:", err));
