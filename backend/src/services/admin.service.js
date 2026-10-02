const bcrypt = require('bcrypt');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getDashboardStats() {
  // One query, three counts. The database does the counting, not JavaScript.
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)   AS totalUsers,
      (SELECT COUNT(*) FROM stores)  AS totalStores,
      (SELECT COUNT(*) FROM ratings) AS totalRatings
  `);
  return rows[0];
}

async function createUser({ name, email, address, password, role }) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, address, role]
  );

  return { id: result.insertId, name, email, address, role };
}

async function createStore({ name, email, address, ownerId }) {
  // 1. The owner must exist and must have the STORE_OWNER role
  const [owners] = await pool.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
  if (owners.length === 0) {
    throw new ApiError(404, 'Owner not found');
  }
  if (owners[0].role !== 'STORE_OWNER') {
    throw new ApiError(400, 'The selected user is not a STORE_OWNER');
  }

  // 2. One owner can have only one store
  const [ownerStore] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
  if (ownerStore.length > 0) {
    throw new ApiError(409, 'This owner already has a store');
  }

  // 3. Store email must be unique
  const [sameEmail] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
  if (sameEmail.length > 0) {
    throw new ApiError(409, 'Store email already registered');
  }

  const [result] = await pool.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address, ownerId]
  );

  return { id: result.insertId, name, email, address, ownerId };
}

module.exports = { getDashboardStats, createUser, createStore };