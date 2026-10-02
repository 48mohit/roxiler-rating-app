// A custom error that carries an HTTP status code.
// Example: throw new ApiError(409, 'Email already registered');
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;