// server.js (updated)
const http = require("http");
const url = require("url");
const mongoose = require("mongoose");
require("dotenv").config();

const Feedback = require("./models/feedback.model"); // must be CommonJS export

const PORT = process.env.PORT || 5000;

// --- helpers ---
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

// --- server ---
const server = http.createServer(async (req, res) => {
  setCors(res);

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  try {
    // ---------------------------
    // AUTH
    // ---------------------------

    // POST /api/auth/login
    if (req.method === "POST" && path === "/api/auth/login") {
      const body = await readJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      // TEMP: hardcoded demo login (replace with DB + bcrypt + JWT later)
      if (email === "admin@mdh.com" && password === "admin123") {
        return sendJson(res, 200, {
          token: "demo-token-123",
          user: { email, role: "admin" },
        });
      }

      return sendJson(res, 401, { message: "Invalid email or password" });
    }

    // ---------------------------
    // FEEDBACK
    // ---------------------------

    // GET /api/feedback
    if (req.method === "GET" && path === "/api/feedback") {
      const items = await Feedback.find().sort({ createdAt: -1 });
      return sendJson(res, 200, { items });
    }

    // POST /api/feedback
    if (req.method === "POST" && path === "/api/feedback") {
      const body = await readJsonBody(req);
      const text = (body.feedback ?? body.message ?? "").trim();

      if (!text || text.length < 2) {
        return sendJson(res, 400, { message: "Feedback is required" });
      }

      await Feedback.create({ feedback: text });
      return sendJson(res, 201, { message: "Feedback saved" });
    }

    // Not found
    return sendJson(res, 404, { message: "Route not found" });
  } catch (err) {
    return sendJson(res, 500, { message: err.message || "Server error" });
  }
});

// --- connect DB then listen ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () =>
      console.log(`Node server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));