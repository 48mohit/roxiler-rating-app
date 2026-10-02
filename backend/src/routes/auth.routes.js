const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Any logged-in user
router.get('/me', authenticateToken, authController.me);
router.post(
  '/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;