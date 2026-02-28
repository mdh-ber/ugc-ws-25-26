// backend/middleware/checkRole.js

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