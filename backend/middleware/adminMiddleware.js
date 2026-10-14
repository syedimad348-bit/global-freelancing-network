const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const { jwtSecret } = require("../config/secrets");

const ADMIN_EMAIL = "syedimad348@gmail.com";

const adminProtect = (req, res, next) => {
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

    // Check if the user email matches admin email
    if (mongoose.connection.readyState === 1) {
      // Look up user to get email
      const User = require("../models/User");
      User.findById(decoded.id, "email").exec((err, user) => {
        if (err) return next(new AppError("User lookup failed", 500, "DB_ERROR"));
        if (!user || user.email.toLowerCase() !== ADMIN_EMAIL) {
          return next(new AppError("Admin access required", 403, "ADMIN_REQUIRED"));
        }
        next();
      });
    } else {
      // Offline mode - check token payload for admin email if present
      if (decoded.email && decoded.email.toLowerCase() === ADMIN_EMAIL) {
        next();
      } else {
        return next(new AppError("Admin access required", 403, "ADMIN_REQUIRED"));
      }
    }
  } catch (err) {
    return next(new AppError("Token invalid or expired", 401, "TOKEN_EXPIRED"));
  }
};

module.exports = { adminProtect, ADMIN_EMAIL };