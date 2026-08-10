import { config } from '../config/index.js';

/** Normalise Mongoose / JWT errors into tidy operational errors. */
function normalizeError(err) {
  if (err.name === 'CastError') {
    err.message = `Invalid value for ${err.path}: ${err.value}`;
    err.statusCode = 400;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    err.message = `Duplicate value for ${field}. Please use a unique ${field}.`;
    err.statusCode = 409;
  } else if (err.name === 'ValidationError') {
    err.message = Object.values(err.errors).map((e) => e.message).join(', ');
    err.statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    err.message = 'Invalid token. Please log in again.';
    err.statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    err.message = 'Your session has expired. Please log in again.';
    err.statusCode = 401;
  }
  return err;
}

// 404 handler (registered before the error handler)
export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

// Global error handler (must be the last middleware)
export function errorHandler(err, req, res, _next) {
  err = normalizeError(err);
  const statusCode = err.statusCode || 500;

  if (config.env === 'development') console.error('[Error]', err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.details ? { errors: err.details } : {}),
    ...(config.env === 'development' ? { stack: err.stack } : {}),
  });
}
