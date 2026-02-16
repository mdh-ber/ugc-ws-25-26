// backend/middleware/checkRole.js
module.exports = (req, res, next) => {
  // We will expect the frontend to send a custom header 'user-role'
  const userRole = req.headers['user-role'];

  if (userRole !== 'Marketing Manager') {
    return res.status(403).json({ message: "Access denied. Marketing Managers only." });
  }
  
  next();
};