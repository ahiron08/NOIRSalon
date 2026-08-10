import { validationResult } from 'express-validator';

/**
 * Express-validator guard. Collects every field error into one response.
 * Expected after a chain of express-validator validators.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path || e.param,
    message: e.msg,
  }));

  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: details,
  });
}

/** Re-usable auth validation chains. */
export { body } from 'express-validator';
