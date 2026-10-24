export class ApiError extends Error {
  constructor({ status, code, message, errors }) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}
