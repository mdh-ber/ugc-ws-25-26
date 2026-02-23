<<<<<<< HEAD
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns"); // 0️⃣ Fix SRV DNS resolution
require("dotenv").config();

const cors = require("cors");
const app = express();

// =====================
// DNS FIX FOR WINDOWS SRV
// =====================
dns.setServers(['8.8.8.8', '1.1.1.1']); // Use Google's DNS servers

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());

// CORS 
app.use(cors());
app.options("*", cors());

// =====================
// DATABASE
// =====================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() =>  console.log('✅ MongoDB connected to database:', mongoose.connection.name))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
=======
// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e

// =====================
// ROUTES
// =====================
<<<<<<< HEAD
app.use("/api/rewards", require("./routes/rewardRoutes"));
app.use("/api/review-requests", require("./routes/reviewRequestRoutes"));
app.use("/api/trainings", require("./routes/trainingRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));
app.use("/api/uu", require("./routes/uuRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/financial-report", require("./routes/financialReportRoutes"));
app.use("/api/guidelines", require("./routes/guidelinesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/analytics", require("./routes/financialReportRoutes"));
=======
import rewardRoutes from "./routes/rewardRoutes.js";
import reviewRequestRoutes from "./routes/reviewRequestRoutes.js";
import trainingRoutes from "./routes/trainingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import uuRoutes from "./routes/uuRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import guidelinesRoutes from "./routes/guidelinesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

// =====================
// MODELS
// =====================
import User from "./models/user.model.js";
>>>>>>> c1d8eb004e3b5ee3df64bd2d5d80b2341121385e

// =====================
// CONFIG
// =====================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

  try {
    // ===========================
    // AUTH
    // ===========================
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
      const id = segments[2]; // api/guidelines/:id => ["api","guidelines",":id"]
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
    // REFERRALS CRUD (your ReferralList uses /api/referrals)
    // =========================================================
    if (segments[0] === "api" && segments[1] === "referrals") {
      // GET /api/referrals
      if (req.method === "GET" && segments.length === 2) {
        const referrals = await Referral.find().sort({ createdAt: -1 }).lean();
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
        const doc = await Referral.findById(id).lean();
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
    // UU ROUTES (NO EXPRESS)
    // Base: /api/uu/...
    // =========================================================
    if (segments[0] === "api" && segments[1] === "uu") {
      const group = segments[2]; // "referee" | "referral"
      const action = segments[3]; // "overview" | "members" | ":id"

      const { from, to } = parseRange(query);

      // ---------- REFEREE ----------
      if (group === "referee") {
        // GET /api/uu/referee/overview
        if (req.method === "GET" && action === "overview") {
          const data = await RefereeUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$date", uu: { $sum: "$uu" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", uu: 1 } },
          ]);
          return sendJson(res, 200, { series: data, from, to });
        }

        // GET /api/uu/referee/members
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

        // GET /api/uu/referee/:refereeId
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

      // ---------- REFERRAL ----------
      if (group === "referral") {
        // GET /api/uu/referral/overview
        if (req.method === "GET" && action === "overview") {
          const data = await ReferralUu.aggregate([
            { $match: { date: { $gte: from, $lte: to } } },
            { $group: { _id: "$date", uu: { $sum: "$uu" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", uu: 1 } },
          ]);
          return sendJson(res, 200, { series: data, from, to });
        }

        // GET /api/uu/referral/members
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

        // GET /api/uu/referral/:referralId
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

    return sendJson(res, 404, { message: "Route not found" });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { message: "Server error" });
  }
};

// =====================
// ROUTES
// =====================
app.use("/api/rewards", rewardRoutes);
app.use("/api/review-requests", reviewRequestRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/uu", uuRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/guidelines", guidelinesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// =====================
// DB + SERVER START
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () =>
      console.log(`Node server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));