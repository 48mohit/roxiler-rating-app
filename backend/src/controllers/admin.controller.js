const adminService = require('../services/admin.service');
const userService = require('../services/user.service');
const storeService = require('../services/store.service');
const ApiError = require('../utils/ApiError');

const getDashboard = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({
    success: true,
    message: 'Dashboard statistics',
    data: stats,
  });
};

const createUser = async (req, res) => {
  const user = await adminService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
};

const createStore = async (req, res) => {
  const store = await adminService.createStore(req.body);
  res.status(201).json({
    success: true,
    message: 'Store created successfully',
    data: store,
  });
};

const getUsers = async (req, res) => {
  const users = await userService.listUsers(req.query);
  res.status(200).json({
    success: true,
    message: 'Users list',
    data: users,
  });
};

const getUserDetails = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'Invalid user id');
  }
  const user = await userService.getUserDetails(id);
  res.status(200).json({
    success: true,
    message: 'User details',
    data: user,
  });
};

const getStores = async (req, res) => {
  const stores = await storeService.listStores(req.query);
  res.status(200).json({
    success: true,
    message: 'Stores list',
    data: stores,
  });
};

module.exports = {
  getDashboard,
  createUser,
  createStore,
  getUsers,
  getUserDetails,
  getStores,
};