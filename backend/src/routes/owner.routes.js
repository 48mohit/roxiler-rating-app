const express = require('express');
const ownerController = require('../controllers/owner.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ROLES = require('../utils/roles');

const router = express.Router();

// Only store owners can use these routes.
router.use(authenticateToken, authorizeRoles(ROLES.STORE_OWNER));

router.get('/dashboard', ownerController.getDashboard);

module.exports = router;