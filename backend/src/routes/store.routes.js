const express = require('express');
const storeController = require('../controllers/store.controller');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingSchema } = require('../validators/rating.validator');
const ROLES = require('../utils/roles');

const router = express.Router();

// Only normal users browse and rate stores.
router.use(authenticateToken, authorizeRoles(ROLES.USER));

router.get('/', storeController.getStores);
router.post('/:storeId/ratings', validate(ratingSchema), storeController.submitRating);
router.put('/:storeId/ratings', validate(ratingSchema), storeController.modifyRating);

module.exports = router;