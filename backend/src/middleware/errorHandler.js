import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';

const send = (res, status, code, message, fields) =>
  res.status(status).json({ error: { code, message, fields } });

export function notFoundHandler(req, res) {
  send(res, 404, 'NOT_FOUND', 'Route not found');
}

// Four arguments tell Express this is the error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) return send(res, err.status, err.code, err.message, err.fields);

  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }
    return send(res, 422, 'VALIDATION_ERROR', 'Some fields are invalid', fields);
  }

  if (err.type === 'entity.parse.failed') return send(res, 400, 'BAD_REQUEST', 'Request body is not valid JSON');
  if (err.code === 'LIMIT_FILE_SIZE') return send(res, 413, 'FILE_TOO_LARGE', 'File is too large');

  // PostgreSQL error codes
  if (err.code === '23505') return send(res, 409, 'CONFLICT', 'That already exists');
  if (err.code === '23503') return send(res, 409, 'IN_USE', 'This item is still in use');
  if (err.code === '22P02' || err.code === '22003') return send(res, 400, 'BAD_REQUEST', 'Invalid value');

  console.error(err);
  send(res, 500, 'INTERNAL', 'Something went wrong');
}