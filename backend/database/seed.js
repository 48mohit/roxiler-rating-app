require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

// All names are 20+ characters, so the demo data follows our own validation rules.
const ADMIN = {
  name: 'System Administrator Account',
  email: 'admin@roxiler.com',
  address: 'Roxiler Systems Head Office, Pune',
  password: 'Admin@1234',
  role: 'ADMIN',
};

const NORMAL_USERS = [
  { name: 'Rahul Sharma Demo Normal User', email: 'rahul@example.com', address: 'Arera Colony, Bhopal' },
  { name: 'Priya Verma Demo Normal User', email: 'priya@example.com', address: 'Kolar Road, Bhopal' },
  { name: 'Amit Patel Demo Normal User', email: 'amit@example.com', address: 'Indrapuri, Bhopal' },
].map((u) => ({ ...u, password: 'Demo@1234', role: 'USER' }));

const OWNERS = [
  { name: 'Green Valley Store Owner Account', email: 'owner.green@example.com', address: 'Shahpura, Bhopal' },
  { name: 'City Mart Store Owner Account', email: 'owner.city@example.com', address: 'Indore Road, Bhopal' },
  { name: 'Fresh Basket Store Owner Account', email: 'owner.fresh@example.com', address: 'MP Nagar, Bhopal' },
].map((u) => ({ ...u, password: 'Owner@1234', role: 'STORE_OWNER' }));

const STORES = [
  { name: 'Green Valley Grocery Store Bhopal', email: 'green.store@example.com', address: 'Shahpura Lake Road, Bhopal', ownerEmail: 'owner.green@example.com' },
  { name: 'City Mart Supermarket Indore Road', email: 'city.store@example.com', address: 'Indore Road, Bhopal', ownerEmail: 'owner.city@example.com' },
  { name: 'Fresh Basket Fruits And Vegetables', email: 'fresh.store@example.com', address: 'Zone 1, MP Nagar, Bhopal', ownerEmail: 'owner.fresh@example.com' },
];

// [user email, store email, rating]
const RATINGS = [
  ['rahul@example.com', 'green.store@example.com', 5],
  ['rahul@example.com', 'city.store@example.com', 4],
  ['rahul@example.com', 'fresh.store@example.com', 3],
  ['priya@example.com', 'green.store@example.com', 4],
  ['priya@example.com', 'city.store@example.com', 2],
  ['amit@example.com', 'green.store@example.com', 5],
  ['amit@example.com', 'fresh.store@example.com', 4],
];

async function getOrCreateUser(user) {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [user.email]);
  if (existing.length > 0) return existing[0].id;

  const hash = await bcrypt.hash(user.password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
    [user.name, user.email, hash, user.address, user.role]
  );
  console.log('Created user :', user.email, `(${user.role})`);
  return result.insertId;
}

async function getOrCreateStore(store, ownerId) {
  const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [store.email]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await pool.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [store.name, store.email, store.address, ownerId]
  );
  console.log('Created store:', store.email);
  return result.insertId;
}

async function seed() {
  const userIds = {};
  const storeIds = {};

  for (const u of [ADMIN, ...NORMAL_USERS, ...OWNERS]) {
    userIds[u.email] = await getOrCreateUser(u);
  }

  for (const s of STORES) {
    storeIds[s.email] = await getOrCreateStore(s, userIds[s.ownerEmail]);
  }

  // If a rating already exists, it is updated, so running the script twice is safe.
  for (const [userEmail, storeEmail, rating] of RATINGS) {
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?`,
      [userIds[userEmail], storeIds[storeEmail], rating, rating]
    );
  }

  console.log('Seed finished.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});