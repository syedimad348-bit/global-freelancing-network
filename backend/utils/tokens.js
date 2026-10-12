const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtRefreshSecret } = require("../config/secrets");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "30d";

function createAccessToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, jwtSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function createRefreshToken(userId) {
  return jwt.sign({ id: userId, type: "refresh", nonce: crypto.randomUUID() }, jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashToken,
};
