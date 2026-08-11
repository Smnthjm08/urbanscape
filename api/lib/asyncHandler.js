/**
 * Wraps an async Express route handler so that any rejected promise
 * is automatically forwarded to the next error-handling middleware.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function}
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
