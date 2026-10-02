const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const { asText, parseSort } = require('../utils/listQuery');

const ROLE_VALUES = ['ADMIN', 'USER', 'STORE_OWNER'];

// Left side = what the frontend sends. Right side = the real SQL column.
const USER_SORT_COLUMNS = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  rating: 'rating',
};

const toRating = (value) => (value === null ? null : Number(value));

async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, address, role FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }
  return rows[0];
}

async function listUsers(query) {
  const name = asText(query.name);
  const email = asText(query.email);
  const address = asText(query.address);
  const role = asText(query.role);

  const conditions = [];
  const params = [];

  if (name) {
    conditions.push('u.name LIKE ?');
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push('u.email LIKE ?');
    params.push(`%${email}%`);
  }
  if (address) {
    conditions.push('u.address LIKE ?');
    params.push(`%${address}%`);
  }
  if (role) {
    if (!ROLE_VALUES.includes(role)) {
      throw new ApiError(400, 'Role filter must be ADMIN, USER or STORE_OWNER');
    }
    conditions.push('u.role = ?');
    params.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { column, direction } = parseSort(query.sortBy, query.order, USER_SORT_COLUMNS, 'name');

  // Only store owners have a store, so only they get a rating (others stay NULL).
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            ROUND(AVG(r.rating), 1) AS rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${where}
     GROUP BY u.id
     ORDER BY ${column} ${direction}, u.id ASC`,
    params
  );

  return rows.map((row) => ({ ...row, rating: toRating(row.rating) }));
}

async function getUserDetails(id) {
  const user = await getUserById(id);

  if (user.role === 'STORE_OWNER') {
    const [stores] = await pool.query(
      `SELECT s.id, s.name, ROUND(AVG(r.rating), 1) AS rating, COUNT(r.id) AS totalRatings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [id]
    );

    user.store = stores.length
      ? {
          id: stores[0].id,
          name: stores[0].name,
          rating: toRating(stores[0].rating),
          totalRatings: stores[0].totalRatings,
        }
      : null;
    user.rating = user.store ? user.store.rating : null;
  }

  return user;
}

module.exports = { getUserById, listUsers, getUserDetails };