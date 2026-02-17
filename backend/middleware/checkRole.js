// backend/middleware/checkRole.js
const checkRole = (req, res, next) => {
  // We check the custom header we sent from the frontend
  const userRole = req.headers['x-user-role'];

  if (userRole === 'Marketing Manager') {
    next(); // Access granted
  } else {
    res.status(403).json({ message: "Access denied. Marketing Manager role required." });
  }
};

module.exports = checkRole;