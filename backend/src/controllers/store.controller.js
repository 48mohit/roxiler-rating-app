const storeService = require('../services/store.service');
const ratingService = require('../services/rating.service');
const ApiError = require('../utils/ApiError');

const parseStoreId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'Invalid store id');
  }
  return id;
};

const getStores = async (req, res) => {
  const stores = await storeService.listStoresForUser(req.user.id, req.query);
  res.status(200).json({
    success: true,
    message: 'Stores list',
    data: stores,
  });
};

const submitRating = async (req, res) => {
  const storeId = parseStoreId(req.params.storeId);
  const result = await ratingService.createRating(req.user.id, storeId, req.body.rating);
  res.status(201).json({
    success: true,
    message: 'Rating submitted successfully',
    data: result,
  });
};

const modifyRating = async (req, res) => {
  const storeId = parseStoreId(req.params.storeId);
  const result = await ratingService.updateRating(req.user.id, storeId, req.body.rating);
  res.status(200).json({
    success: true,
    message: 'Rating updated successfully',
    data: result,
  });
};

module.exports = { getStores, submitRating, modifyRating };