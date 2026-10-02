const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Checks the "Authorization: Bearer <token>" header and sets req.user.
const authenticateToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  req.user = { id: payload.id, role: payload.role };
  next();
};

// Allows only the given roles. Use it AFTER authenticateToken.
// Example: authorizeRoles(ROLES.ADMIN)
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to access this resource');
  }
  next();
};

module.exports = { authenticateToken, authorizeRoles };