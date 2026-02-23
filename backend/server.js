const http = require("http");
const url = require("url");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

// ===== Models used in routes =====
const Campaign = require("./models/Campaign");
const CampaignMetric = require("./models/CampaignMetric");

// ===== OPTIONAL models (keep if exist) =====
const Training = require("./models/Training");
const Event = require("./models/Event");
const Feedback = require("./models/feedback.model");
const Guideline = require("./models/guideline.model");
const Referral = require("./models/Referral");
const RefereeUu = require("./models/RefereeUu");
const ReferralUu = require("./models/ReferralUu");

const PORT = process.env.PORT || 5000;

/* =====================================================
   DEFAULT ADMIN
===================================================== */
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@mdh.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({ email: adminEmail });
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log("✅ Default admin password RESET");
      return;
    }

    await User.create({
      email: adminEmail,
      passwordHash,
      role: "admin",
    });

    console.log("✅ Default admin created");
  } catch (err) {
    console.error("Failed to create/reset default admin:", err);
  }
};

/* =====================================================
   HELPERS
===================================================== */
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
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function yyyyMmDd(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/* =====================================================
   HTTP SERVER
===================================================== */
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
    /* ================= AUTH ================= */
    if (req.method === "POST" && path === "/api/auth/login") {
      const body = await readJsonBody(req);
      const email = (body.email || "").toLowerCase();
      const password = body.password || "";

      if (email === "admin@mdh.com" && password === "admin123") {
        return sendJson(res, 200, {
          token: "demo-token",
          user: { email, role: "admin" },
        });
      }

      return sendJson(res, 401, { message: "Invalid credentials" });
    }

    /* ================= CAMPAIGNS ================= */
    if (segments[0] === "api" && segments[1] === "campaigns") {
      if (req.method === "GET" && segments.length === 2) {
        const items = await Campaign.find().lean();
        return sendJson(res, 200, items);
      }

      if (req.method === "POST" && segments.length === 2) {
        const body = await readJsonBody(req);
        const created = await Campaign.create(body);
        return sendJson(res, 201, created);
      }
    }

    /* ================= ANALYTICS (CLICKS PER CREATOR) ================= */
    if (req.method === "GET" && path === "/api/analytics/clicks-per-creator") {
      const data = await CampaignMetric.aggregate([
        {
          $group: {
            _id: "$creatorId",
            totalClicks: { $sum: "$clicks" },
          },
        },
        {
          $project: {
            _id: 0,
            creatorId: "$_id",
            totalClicks: 1,
          },
        },
        { $sort: { totalClicks: -1 } },
      ]);

      return sendJson(res, 200, data);
    }

    return sendJson(res, 404, { message: "Route not found" });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: "Server error" });
  }
});

/* =====================================================
   DB CONNECT + START SERVER
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    await createDefaultAdmin();

    server.listen(PORT, () =>
      console.log(`🚀 Node server running on port ${PORT}`)
    );

    /* ===== ROI AUTO DATA GENERATOR ===== */
    setInterval(async () => {
      try {
        const day = yyyyMmDd();

        const campaigns = await Campaign.find({ status: "active" })
          .select("_id platforms")
          .lean();

        for (const c of campaigns) {
          const platform =
            Array.isArray(c.platforms) && c.platforms.length
              ? String(c.platforms[0])
              : "unknown";

          await CampaignMetric.findOneAndUpdate(
            { campaignId: c._id, day, platform },
            {
              $inc: {
                spend: Math.round(Math.random() * 200),
                revenue: Math.round(Math.random() * 500),
                clicks: Math.round(Math.random() * 120),
                conversions: Math.round(Math.random() * 10),
              },
            },
            { upsert: true, new: true }
          );
        }

        console.log("📊 ROI metrics updated");
      } catch (e) {
        console.error("ROI job failed:", e);
      }
    }, 120000);
  })
  .catch((err) => console.error("MongoDB connection error:", err));