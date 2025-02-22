const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, getProfile } = require('../controllers/profileController');

// Get user profile
router.get('/', auth, getProfile);

// Update user profile
router.patch('/', 
  auth, 
  upload.single('avatar'), // Handle avatar file upload
  updateProfile
);

module.exports = router;