// middlewares/verifyAdmin.js

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- ✅ THE FIX IS HERE ---
    // Extract the nested 'user' object from the decoded payload.
    req.user = decoded.user;

    // --- SECURITY IMPROVEMENT ---
    // Also verify that the user has the 'admin' role.
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}; 