const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, UserController.getAllUsers);

module.exports = router;
