const ownerService = require('../services/owner.service');

const getDashboard = async (req, res) => {
  // The owner id comes from the token, never from the URL.
  const data = await ownerService.getOwnerDashboard(req.user.id, req.query);
  res.status(200).json({
    success: true,
    message: 'Owner dashboard',
    data,
  });
};

module.exports = { getDashboard };
