const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Single image upload
router.post('/single',
  auth,
  upload.single('file'), // Changed from 'image' to 'file'
  uploadController.uploadImage
);

// Multiple images upload
router.post('/multiple',
  auth,
  upload.array('files', 10), // Changed from 'images' to 'files'
  uploadController.uploadMultipleImages
);

module.exports = router;