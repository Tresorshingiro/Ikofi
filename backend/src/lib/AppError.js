export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const notFound = (what = 'Resource') => new AppError(404, 'NOT_FOUND', `${what} not found`);

// A 422 that points at one form field
export const fieldError = (field, message) =>
  new AppError(422, 'VALIDATION_ERROR', 'Some fields are invalid', { [field]: message });