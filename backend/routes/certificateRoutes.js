const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const auth = require("../middleware/auth"); // adjust path if different

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseJsonBody(req) {
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

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * Routes:
 * GET    /api/certificates/me
 * POST   /api/certificates           (admin only)
 * PATCH  /api/certificates/:id       (admin only)
 * DELETE /api/certificates/:id       (admin only)
 */
module.exports = async function certificateRoutes(req, res, segments, query) {
  // auth middleware (manual call)
  await new Promise((resolve) => auth(req, res, resolve)); // sets req.user or returns 401

  const role = req.user?.role;

  // GET /api/certificates/me
  if (req.method === "GET" && segments[2] === "me") {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id, status: "active" };

    const [items, total] = await Promise.all([
      Certificate.find(filter).sort({ issueDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Certificate.countDocuments(filter),
    ]);

    return sendJson(res, 200, { items, page, limit, total });
  }

  // Admin only below
  if (role !== "admin") {
    return sendJson(res, 403, { message: "Admin only" });
  }

  // POST /api/certificates
  if (req.method === "POST" && segments.length === 2) {
    const body = await parseJsonBody(req);

    const userId = String(body.userId || "").trim();
    const title = String(body.title || "").trim();
    const issuer = String(body.issuer || "").trim();
    const issueDate = body.issueDate;
    const domain = String(body.domain || "").trim();
    const certType = String(body.certType || "").trim();

    if (!userId || !isValidObjectId(userId)) {
      return sendJson(res, 400, { message: "Valid userId is required" });
    }
    if (!title) return sendJson(res, 400, { message: "title is required" });
    if (!issuer) return sendJson(res, 400, { message: "issuer is required" });
    if (!issueDate) return sendJson(res, 400, { message: "issueDate is required" });
    if (!domain) return sendJson(res, 400, { message: "domain is required" });
    if (!certType) return sendJson(res, 400, { message: "certType is required" });

    const created = await Certificate.create({
      userId,
      title,
      issuer,
      issueDate: new Date(issueDate),
      domain,
      certType,
      description: String(body.description || ""),
      incomeMade: Number(body.incomeMade || 0),
      certificateUrl: String(body.certificateUrl || ""),
      status: "active",
    });

    return sendJson(res, 201, { message: "Certificate created", certificate: created });
  }

  // /api/certificates/:id
  const id = segments[2];
  if (!id || !isValidObjectId(id)) {
    return sendJson(res, 400, { message: "Invalid certificate id" });
  }

  // PATCH /api/certificates/:id
  if (req.method === "PATCH") {
    const body = await parseJsonBody(req);

    const updates = {};
    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.issuer !== undefined) updates.issuer = String(body.issuer).trim();
    if (body.issueDate !== undefined) updates.issueDate = new Date(body.issueDate);
    if (body.domain !== undefined) updates.domain = String(body.domain).trim();
    if (body.certType !== undefined) updates.certType = String(body.certType).trim();
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.incomeMade !== undefined) updates.incomeMade = Number(body.incomeMade || 0);
    if (body.certificateUrl !== undefined) updates.certificateUrl = String(body.certificateUrl || "");
    if (body.status !== undefined) updates.status = String(body.status);

    const updated = await Certificate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return sendJson(res, 404, { message: "Certificate not found" });
    return sendJson(res, 200, { message: "Certificate updated", certificate: updated });
  }

  // DELETE /api/certificates/:id  (archive)
  if (req.method === "DELETE") {
    const updated = await Certificate.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();

    if (!updated) return sendJson(res, 404, { message: "Certificate not found" });
    return sendJson(res, 200, { message: "Certificate archived", certificate: updated });
  }

  return sendJson(res, 404, { message: "Route not found" });
};