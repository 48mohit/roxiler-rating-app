const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function registerUser({ name, email, address, password }) {
  // 1. Is the email already used?
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(409, 'Email already registered');
  }

  // 2. Hash the password. Never store the plain password.
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Save. Public signup always creates a USER (never ADMIN).
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, address, 'USER']
  );

  // 4. Return the user WITHOUT the password
  return { id: result.insertId, name, email, address, role: 'USER' };
}

async function loginUser({ email, password }) {
  // 1. Find the user by email
  const [rows] = await pool.query(
    'SELECT id, name, email, address, role, password_hash FROM users WHERE email = ?',
    [email]
  );

  // 2. Same message for "no user" and "wrong password", so attackers learn nothing
  if (rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Create the token. The payload has only id and role.
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 4. Send the token and the user WITHOUT password_hash
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    },
  };
}

async function changePassword(userId, currentPassword, newPassword) {
  // 1. Get the saved hash of this user
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }

  // 2. The current password must be correct
  const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!matches) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  // 3. The new password must be different
  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from the current password');
  }

  // 4. Hash and save the new password
  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
}

module.exports = { registerUser, loginUser, changePassword };