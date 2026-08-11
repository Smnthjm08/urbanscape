/**
 * Custom application error class.
 * Operational errors are expected (bad input, not found, etc.) and
 * are safe to expose to the client. Programming errors are NOT
 * operational and should be logged + masked.
 */
export class AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
