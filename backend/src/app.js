const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const storeRoutes = require('./routes/store.routes');
const ownerRoutes = require('./routes/owner.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check: confirms the server AND the database are working.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is running',
      data: { database: 'connected' },
    });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Any unknown route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler must be the LAST thing added
app.use(errorHandler);

module.exports = app;