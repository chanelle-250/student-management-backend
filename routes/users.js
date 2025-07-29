const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile - Get user profile
router.get('/profile', auth, getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', auth, updateProfile);

module.exports = router;