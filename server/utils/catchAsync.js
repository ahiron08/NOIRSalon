/**
 * Wraps async route handlers so rejected promises flow
 * to the Express error handler automatically.
 */
export default function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
