const jwt = require("jsonwebtoken");
const User = require("../models/User");


module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact an administrator." });
    }

    req.user = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};
