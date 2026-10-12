const isProd = process.env.NODE_ENV === "production";

const jwtSecret =
  process.env.JWT_SECRET ||
  (isProd ? null : "dev-only-access-secret-min-32-chars-long!!");

const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET ||
  (isProd ? null : "dev-only-refresh-secret-min-32-chars-long!!");

if (isProd && (!jwtSecret || !jwtRefreshSecret)) {
  console.error("Set JWT_SECRET and JWT_REFRESH_SECRET in production.");
  process.exit(1);
}

if (!isProd && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  console.warn("⚠️  Using dev JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET for production.");
}

module.exports = { jwtSecret, jwtRefreshSecret };
