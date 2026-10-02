const pool = require('../config/db');
const { asText, parseSort } = require('../utils/listQuery');

const STORE_SORT_COLUMNS = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'rating',
};

// Normal users can sort by these only (they do not see the store email).
const USER_STORE_SORT_COLUMNS = {
  name: 's.name',
  address: 's.address',
  rating: 'rating',
};

const toNumberOrNull = (value) => (value === null ? null : Number(value));

// ADMIN view
async function listStores(query) {
  const name = asText(query.name);
  const email = asText(query.email);
  const address = asText(query.address);

  const conditions = [];
  const params = [];

  if (name) {
    conditions.push('s.name LIKE ?');
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push('s.email LIKE ?');
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push('s.address LIKE ?');
    params.push(`%${address}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { column, direction } = parseSort(query.sortBy, query.order, STORE_SORT_COLUMNS, 'name');

  // The average comes from SQL (AVG), so it is always up to date.
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 1) AS rating,
            COUNT(r.id) AS totalRatings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY ${column} ${direction}, s.id ASC`,
    params
  );

  return rows.map((row) => ({ ...row, rating: toNumberOrNull(row.rating) }));
}

// NORMAL USER view: overall rating + this user's own rating
async function listStoresForUser(userId, query) {
  const name = asText(query.name);
  const address = asText(query.address);

  const conditions = [];
  const params = [userId]; // the first ? is inside the SELECT part

  if (name) {
    conditions.push('s.name LIKE ?');
    params.push(`%${name}%`);
  }
  if (address) {
    conditions.push('s.address LIKE ?');
    params.push(`%${address}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { column, direction } = parseSort(
    query.sortBy,
    query.order,
    USER_STORE_SORT_COLUMNS,
    'name'
  );

  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 1) AS rating,
            COUNT(r.id) AS totalRatings,
            MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS myRating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY ${column} ${direction}, s.id ASC`,
    params
  );

  return rows.map((row) => ({ ...row, rating: toNumberOrNull(row.rating) }));
}

module.exports = { listStores, listStoresForUser };