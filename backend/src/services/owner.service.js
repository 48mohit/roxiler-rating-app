const pool = require('../config/db');
const { parseSort } = require('../utils/listQuery');

// Left side = what the frontend sends. Right side = the real SQL column.
const RATING_SORT_COLUMNS = {
  name: 'u.name',
  email: 'u.email',
  rating: 'r.rating',
  date: 'r.updated_at',
};

async function getOwnerDashboard(ownerId, query) {
  // 1. Find the store of THIS owner, with its average rating (calculated by SQL)
  const [stores] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 1) AS averageRating,
            COUNT(r.id) AS totalRatings
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [ownerId]
  );

  // An owner whose store is not created yet gets an empty dashboard, not an error.
  if (stores.length === 0) {
    return { store: null, ratings: [] };
  }

  const store = stores[0];
  const { column, direction } = parseSort(query.sortBy, query.order, RATING_SORT_COLUMNS, 'date');

  // 2. The users who rated this store
  const [ratings] = await pool.query(
    `SELECT u.id AS userId, u.name, u.email, r.rating,
            r.created_at AS submittedAt, r.updated_at AS updatedAt
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY ${column} ${direction}, r.id ASC`,
    [store.id]
  );

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: store.averageRating === null ? null : Number(store.averageRating),
      totalRatings: store.totalRatings,
    },
    ratings,
  };
}

module.exports = { getOwnerDashboard };