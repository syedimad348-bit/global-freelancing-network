const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { jwtSecret } = require("../config/secrets");

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
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

module.exports = { protect };