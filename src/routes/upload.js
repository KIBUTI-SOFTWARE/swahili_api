const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/v1/upload/single:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload single file
 *     security:
 *       - bearerAuth: []
 *     description: Upload a single image file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Cloudinary folder name
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *                     size:
 *                       type: number
 *
 * /api/v1/upload/multiple:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload multiple files
 *     security:
 *       - bearerAuth: []
 *     description: Upload multiple image files (max 10)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Cloudinary folder name
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           imageUrl:
 *                             type: string
 *                           originalName:
 *                             type: string
 *                           mimeType:
 *                             type: string
 *                           size:
 *                             type: number
 */
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