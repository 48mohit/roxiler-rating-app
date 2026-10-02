const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

// Express calls this when any route throws an error.
// It has 4 parameters (err, req, res, next); that is how Express knows it is an error handler.
function errorHandler(err, req, res, next) {
  // 1. Our own errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // 2. Validation errors from zod
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors,
    });
  }

  // 3. Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  // 4. MySQL duplicate entry (for example, same email twice)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'This record already exists' });
  }

  // 5. Anything else: log it for us, hide details from the user
  console.error('Unexpected error:', err);
  return res.status(500).json({ success: false, message: 'Something went wrong on the server' });
}

module.exports = errorHandler;