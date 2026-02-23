const http = require("http");
const url = require("url");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const Feedback = require("./models/feedback.model");
const Guideline = require("./models/guideline.model");

const Training = require("./models/Training");
const Event = require("./models/Event");

const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/ReferralUu");
const { Referral } = require("./models/Referral");

const Campaign = require("./models/Campaign");
const CampaignMetric = require("./models/CampaignMetric");

const Certificate = require("./models/Certificate");
const Notification = require("./models/Notification");

const PORT = process.env.PORT || 5000;

// ---------------- helpers ----------------
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
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
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ✅ HTTP-auth (since server is NOT Express)
function requireAuth(req, res) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    sendJson(res, 401, { message: "Missing token" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    sendJson(res, 401, { message: "Invalid or expired token" });
    return null;
  }
}

function requireAdmin(user, res) {
  if (!user || user.role !== "admin") {
    sendJson(res, 403, { message: "Forbidden (admin only)" });
    return false;
  }
  return true;
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
  if (!series.length) return { totalUu: 0, avgDailyUu: 0, peakUu: 0, peakDate: null };

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

// ROI helpers
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

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const query = parsed.query || {};
  const segments = path.split("/").filter(Boolean);

  try {
    // ===========================
    // AUTH
    // ===========================
    if (req.method === "POST" && path === "/api/auth/login") {
      const body = await readJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (email === "admin@mdh.com" && password === "admin123") {
        const token = jwt.sign(
          { id: "000000000000000000000001", email, role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return sendJson(res, 200, { token, user: { email, role: "admin" } });
      }

      return sendJson(res, 401, { message: "Invalid email or password" });
    }

    // ===========================
    // NOTIFICATIONS ✅ NEW
    // Base: /api/notifications
    // ===========================
    if (segments[0] === "api" && segments[1] === "notifications") {
      const user = requireAuth(req, res);
      if (!user) return;

      const userObjectId = isValidObjectId(user.id)
        ? new mongoose.Types.ObjectId(user.id)
        : null;

      // GET /api/notifications
      if (req.method === "GET" && segments.length === 2) {
        const page = Math.max(parseInt(query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);

        const filter = userObjectId ? { userId: userObjectId } : {};
        const total = await Notification.countDocuments(filter);

        const items = await Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return sendJson(res, 200, { items, total, page, limit });
      }

      // PATCH /api/notifications/read-all
      if (req.method === "PATCH" && segments.length === 3 && segments[2] === "read-all") {
        if (!userObjectId) return sendJson(res, 400, { message: "Invalid user id in token" });

        await Notification.updateMany({ userId: userObjectId, read: false }, { $set: { read: true } });
        return sendJson(res, 200, { message: "All marked read" });
      }

      // DELETE /api/notifications
      if (req.method === "DELETE" && segments.length === 2) {
        if (!userObjectId) return sendJson(res, 400, { message: "Invalid user id in token" });

        await Notification.deleteMany({ userId: userObjectId });
        return sendJson(res, 200, { message: "Cleared" });
      }

      // PATCH /api/notifications/:id/read
      if (req.method === "PATCH" && segments.length === 4 && segments[3] === "read") {
        const id = segments[2];
        if (!isValidObjectId(id)) return sendJson(res, 400, { message: "Invalid notification id" });
        if (!userObjectId) return sendJson(res, 400, { message: "Invalid user id in token" });

        const updated = await Notification.findOneAndUpdate(
          { _id: id, userId: userObjectId },
          { $set: { read: true } },
          { new: true }
        ).lean();

        if (!updated) return sendJson(res, 404, { message: "Notification not found" });
        return sendJson(res, 200, { item: updated });
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // ===========================
    // CERTIFICATES ✅ FIXED
    // Base: /api/certificates
    // ===========================
    if (segments[0] === "api" && segments[1] === "certificates") {
      const user = requireAuth(req, res);
      if (!user) return;

      const userObjectId = isValidObjectId(user.id)
        ? new mongoose.Types.ObjectId(user.id)
        : null;

      // GET /api/certificates/me
      if (req.method === "GET" && segments.length === 3 && segments[2] === "me") {
        if (!userObjectId) return sendJson(res, 400, { message: "Invalid user id in token" });

        const page = Math.max(parseInt(query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);

        const filter = { userId: userObjectId };
        const total = await Certificate.countDocuments(filter);

        const items = await Certificate.find(filter)
          .sort({ issueDate: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return sendJson(res, 200, { items, total, page, limit });
      }

      // ADMIN: GET /api/certificates
      if (req.method === "GET" && segments.length === 2) {
        if (!requireAdmin(user, res)) return;

        const page = Math.max(parseInt(query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
        const filterUserId = query.userId;

        const filter = filterUserId ? { userId: filterUserId } : {};
        const total = await Certificate.countDocuments(filter);

        const items = await Certificate.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return sendJson(res, 200, { items, total, page, limit });
      }

      // ADMIN: POST /api/certificates
      if (req.method === "POST" && segments.length === 2) {
        if (!requireAdmin(user, res)) return;

        const body = await readJsonBody(req);

        const userId = String(body.userId || "").trim();
        const title = String(body.title || "").trim();
        const issuer = String(body.issuer || "MDH University").trim();
        const domain = String(body.domain || "General").trim();
        const certType = String(body.certType || "Participation").trim();
        const description = String(body.description || "").trim();
        const certificateUrl = String(body.certificateUrl || "").trim();

        if (!userId || !isValidObjectId(userId)) {
          return sendJson(res, 400, { message: "Valid userId is required" });
        }
        if (!title) return sendJson(res, 400, { message: "title is required" });
        if (!body.issueDate) return sendJson(res, 400, { message: "issueDate is required" });

        const doc = await Certificate.create({
          userId,
          title,
          issuer,
          domain,
          certType,
          description,
          issueDate: new Date(body.issueDate),
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          certificateUrl,
          pointsAwarded: Number(body.pointsAwarded || 0),
          incomeMade: Number(body.incomeMade || 0),
          status: body.status === "revoked" ? "revoked" : "active",
        });

        // (Optional) create a notification for that user
        await Notification.create({
          userId,
          type: "milestone",
          title: "New certificate issued",
          message: `You received: ${title}`,
          link: "/certificates",
          read: false,
        });

        return sendJson(res, 201, { item: doc });
      }

      // /api/certificates/:id
      const certId = segments[2];
      if (segments.length === 3 && certId) {
        if (!isValidObjectId(certId)) {
          return sendJson(res, 400, { message: "Invalid certificate id" });
        }

        // ADMIN: PATCH
        if (req.method === "PATCH") {
          if (!requireAdmin(user, res)) return;

          const body = await readJsonBody(req);
          const updates = {};

          if (body.title !== undefined) updates.title = String(body.title).trim();
          if (body.issuer !== undefined) updates.issuer = String(body.issuer).trim();
          if (body.domain !== undefined) updates.domain = String(body.domain).trim();
          if (body.certType !== undefined) updates.certType = String(body.certType).trim();
          if (body.description !== undefined) updates.description = String(body.description).trim();
          if (body.issueDate !== undefined) updates.issueDate = new Date(body.issueDate);
          if (body.expiryDate !== undefined)
            updates.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
          if (body.certificateUrl !== undefined)
            updates.certificateUrl = String(body.certificateUrl).trim();
          if (body.pointsAwarded !== undefined)
            updates.pointsAwarded = Number(body.pointsAwarded || 0);
          if (body.incomeMade !== undefined)
            updates.incomeMade = Number(body.incomeMade || 0);
          if (body.status !== undefined)
            updates.status = body.status === "revoked" ? "revoked" : "active";

          const updated = await Certificate.findByIdAndUpdate(certId, updates, {
            new: true,
            runValidators: true,
          }).lean();

          if (!updated) return sendJson(res, 404, { message: "Certificate not found" });
          return sendJson(res, 200, { item: updated });
        }

        // ADMIN: DELETE
        if (req.method === "DELETE") {
          if (!requireAdmin(user, res)) return;

          const deleted = await Certificate.findByIdAndDelete(certId).lean();
          if (!deleted) return sendJson(res, 404, { message: "Certificate not found" });

          return sendJson(res, 200, { message: "Deleted" });
        }
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    // ===========================
    // FEEDBACK
    // ===========================
    if (req.method === "GET" && path === "/api/feedback") {
      const items = await Feedback.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, { items });
    }

    if (req.method === "POST" && path === "/api/feedback") {
      const body = await readJsonBody(req);
      const text = (body.feedback ?? body.message ?? "").trim();

      if (!text || text.length < 2) return sendJson(res, 400, { message: "Feedback is required" });

      await Feedback.create({ feedback: text });
      return sendJson(res, 201, { message: "Feedback saved" });
    }

    // TRAININGS
    if (req.method === "GET" && path === "/api/trainings") {
      const items = await Training.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, items);
    }

    // EVENTS
    if (req.method === "GET" && path === "/api/events") {
      const items = await Event.find().sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, items);
    }

    // GUIDELINES (unchanged minimal GET)
    if (req.method === "GET" && path === "/api/guidelines") {
      const guidelines = await Guideline.find({ isActive: true }).sort({ createdAt: -1 }).lean();
      return sendJson(res, 200, guidelines);
    }

    // UU ROUTES (kept short here - keep your existing UU code if you want)
    if (segments[0] === "api" && segments[1] === "uu") {
      const group = segments[2];
      const action = segments[3];
      const { from, to } = parseRange(query);

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
      }

      return sendJson(res, 404, { message: "Route not found" });
    }

    return sendJson(res, 404, { message: "Route not found" });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return sendJson(res, 500, { message: "Server error", error: String(err?.message || err) });
  }
});

// ---------------- connect & listen ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, () => console.log(`Node server running on port ${PORT}`));

    // ROI demo generator (kept)
    setInterval(async () => {
      try {
        const day = yyyyMmDd(new Date());
        const campaigns = await Campaign.find({ status: "active" }).select("_id platforms").lean();

        for (const c of campaigns) {
          const platform =
            Array.isArray(c.platforms) && c.platforms.length ? String(c.platforms[0]) : "unknown";

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

        console.log(`[ROI] metrics updated for ${campaigns.length} campaigns (${day})`);
      } catch (e) {
        console.error("[ROI] metric job failed:", e);
      }
    }, 2 * 60 * 1000);
  })
  .catch((err) => console.error("MongoDB connection error:", err));