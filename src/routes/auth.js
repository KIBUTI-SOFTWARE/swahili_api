const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken } = require('../controllers/authController');
const auth = require('../middleware/auth');

// User Registration
router.post('/register', registerUser);

// User Login
router.post('/login', loginUser);

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await require('../models/User')
      .findById(req.user.id)
      .select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/refresh-token',refreshToken);

module.exports = router;