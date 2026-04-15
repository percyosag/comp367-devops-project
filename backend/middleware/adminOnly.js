// R2 US12: Middleware to restrict access to admin-only routes.
// Must be used AFTER the auth middleware so req.user is populated.
module.exports = function (req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
