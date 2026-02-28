// backend/middleware/checkRole.js
<<<<<<< HEAD

const checkRole = (req, res, next) => {
  // Expect frontend header: user-role
  const userRole = req.headers["user-role"];

  if (userRole !== "Marketing Manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Marketing Managers only." });
  }

  next();
};

export default checkRole;
=======
module.exports = (req, res, next) => {
  // We will expect the frontend to send a custom header 'user-role'
  const userRole = req.headers['user-role'];

  if (userRole !== 'Marketing Manager') {
    return res.status(403).json({ message: "Access denied. Marketing Managers only." });
  }
  
  next();
};
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
