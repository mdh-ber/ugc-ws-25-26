const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain: { id, email, role }
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};