const UserService = require('../services/user.service');

exports.getAllUsers = async (req, res) => {
  const users = await UserService.getAllUsers();
  res.json(users);
};
