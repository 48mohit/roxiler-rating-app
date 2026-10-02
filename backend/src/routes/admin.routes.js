const express = require('express');
const adminController = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createUserSchema, createStoreSchema } = require('../validators/admin.validator');
const ROLES = require('../utils/roles');

const router = express.Router();

// Every route in this file needs a valid token AND the ADMIN role.
router.use(authenticateToken, authorizeRoles(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.post('/users', validate(createUserSchema), adminController.createUser);

router.get('/stores', adminController.getStores);
router.post('/stores', validate(createStoreSchema), adminController.createStore);

module.exports = router;