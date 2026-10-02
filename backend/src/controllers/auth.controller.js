const authService = require('../services/auth.service');
const userService = require('../services/user.service');

const register = async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: user,
  });
};

const login = async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
};

// Returns the logged-in user (identified by the token)
const me = async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Current user',
    data: user,
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
};

module.exports = { register, login, me, changePassword };