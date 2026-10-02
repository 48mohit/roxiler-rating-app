const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function ensureStoreExists(storeId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
  if (rows.length === 0) {
    throw new ApiError(404, 'Store not found');
  }
}

// Fresh numbers for a store after a rating changes.
async function getStoreRatingSummary(storeId, userId) {
  const [rows] = await pool.query(
    `SELECT ROUND(AVG(rating), 1) AS overallRating,
            COUNT(*) AS totalRatings,
            MAX(CASE WHEN user_id = ? THEN rating END) AS myRating
     FROM ratings
     WHERE store_id = ?`,
    [userId, storeId]
  );
  const row = rows[0];
  return {
    storeId,
    overallRating: row.overallRating === null ? null : Number(row.overallRating),
    totalRatings: row.totalRatings,
    myRating: row.myRating,
  };
}

async function createRating(userId, storeId, rating) {
  await ensureStoreExists(storeId);

  const [existing] = await pool.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId]
  );
  if (existing.length > 0) {
    throw new ApiError(409, 'You have already rated this store. Use modify instead.');
  }

  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [
    userId,
    storeId,
    rating,
  ]);
  return getStoreRatingSummary(storeId, userId);
}

async function updateRating(userId, storeId, rating) {
  await ensureStoreExists(storeId);

  const [existing] = await pool.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId]
  );
  if (existing.length === 0) {
    throw new ApiError(404, 'You have not rated this store yet');
  }

  await pool.query('UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?', [
    rating,
    userId,
    storeId,
  ]);
  return getStoreRatingSummary(storeId, userId);
}

module.exports = { createRating, updateRating };