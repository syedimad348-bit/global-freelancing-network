const AppError = require("../utils/appError");

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Unexpected server error";
  const code = err.code || "INTERNAL_ERROR";

  if (!err.isOperational) {
    // Keep stack logging server-side while returning safe payload to client.
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    ok: false,
    error: {
      message,
      code,
      details: err.details || null,
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
