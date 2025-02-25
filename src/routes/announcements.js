const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const announcementController = require('../controllers/announcementController');

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get active announcements
 */
router.get('/', announcementController.getActiveAnnouncements);

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     tags:
 *       - Announcements
 *     summary: Create new announcement (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  auth, 
  checkPermission('announcements', 'create'),
  announcementController.createAnnouncement
);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   patch:
 *     tags:
 *       - Announcements
 *     summary: Update announcement (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id',
  auth,
  checkPermission('announcements', 'update'),
  announcementController.updateAnnouncement
);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     tags:
 *       - Announcements
 *     summary: Delete announcement (Admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id',
  auth,
  checkPermission('announcements', 'delete'),
  announcementController.deleteAnnouncement
);

module.exports = router;