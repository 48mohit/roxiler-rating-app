// Runs a zod schema on req.body. If invalid, zod throws and errorHandler sends a 400.
const validate = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};

module.exports = validate;