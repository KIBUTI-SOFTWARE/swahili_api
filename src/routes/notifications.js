const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    }).sort('-createdAt');

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {

    res.status(500).send('Server error');
  }
});

module.exports = router;