import { env } from '../config/env.js';
import { AppError } from '../lib/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Browsers send an Origin header on cross-site POST/PATCH/DELETE. Reject any we do not know.
export function originCheck(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !env.appOrigins.includes(origin)) {
    throw new AppError(403, 'BAD_ORIGIN', 'Request origin not allowed');
  }
  next();
}