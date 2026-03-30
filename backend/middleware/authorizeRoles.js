export const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied: insufficient role permissions",
      });
    }

    next();
  };
};
