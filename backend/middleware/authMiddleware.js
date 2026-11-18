const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { jwtSecret } = require("../config/secrets");
const OWNER_EMAIL = "syedimad348@gmail.com";

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  // Accept local demo/offline tokens without DB verification
  if (token.startsWith("demo.") || token.startsWith("demo-jwt-token") || token.startsWith("offline-")) {
    req.user = { id: "demo-user-id", type: "access", degradedMode: true };
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.type !== "access") {
      return next(new AppError("Invalid access token", 401, "INVALID_TOKEN"));
    }
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Token invalid or expired", 401, "TOKEN_EXPIRED"));
  }
};

function ownerOnly(req, res, next) {
  if (!req.user || req.user.degradedMode) {
    return next(new AppError("Owner access required", 403, "OWNER_ONLY"));
  }
  if (req.user.email?.toLowerCase() !== OWNER_EMAIL) {
    return next(new AppError("Owner only", 403, "OWNER_ONLY"));
  }
  next();
}

module.exports = { protect, ownerOnly };