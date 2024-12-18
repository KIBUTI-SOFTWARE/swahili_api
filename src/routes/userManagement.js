const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const twoFactorAuthController= require('../controllers/twoFactorAuthController');

const upload = require('../middleware/upload');


/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         avatar:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *         language:
 *           type: string
 *         timezone:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         userType:
 *           type: string
 *           enum: [ADMIN, SELLER, BUYER, MODERATOR, SUPPORT]
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *         profile:
 *           $ref: '#/components/schemas/UserProfile'
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get users list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [ADMIN, SELLER, BUYER, MODERATOR, SUPPORT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in username, email, firstName, lastName
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalRecords:
 *                           type: integer
 */

/**
 * @swagger
 * /api/v1/users/{id}/status:
 *   patch:
 *     tags:
 *       - User Management
 *     summary: Update user status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended, pending]
 *     responses:
 *       200:
 *         description: User status updated
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/v1/users/{id}/2fa:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Enable 2FA for user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 2FA setup information
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
 *                     secret:
 *                       type: string
 *                     qrCode:
 *                       type: string
 *                     otpAuthUrl:
 *                       type: string
 *
 *   put:
 *     tags:
 *       - User Management
 *     summary: Verify and enable 2FA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *
 *   delete:
 *     tags:
 *       - User Management
 *     summary: Disable 2FA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */

// Get users (admin and moderators)
router.get('/',
  auth,
  checkPermission('users', 'read'),
  userManagementController.getUsers
);

// Update user status (admin only)
router.patch('/:id/status',
  auth,
  checkPermission('users', 'manage'),
  userManagementController.updateUserStatus
);

// Assign role to user (admin only)
router.post('/:id/roles',
  auth,
  checkPermission('users', 'manage'),
  userManagementController.assignRole
);

// Remove role from user (admin only)
router.delete('/:id/roles/:roleId',
  auth,
  checkPermission('users', 'manage'),
  userManagementController.removeRole
);

// Update user profile
// router.put('/:id/profile',
//   auth,
//   upload.single('avatar'),
//   userManagementController.updateUserProfile
// );

// router.post('/:id/2fa',
//     auth,
//     twoFactorAuthController.setup2FA
//   );
  
//   router.put('/:id/2fa',
//     auth,
//     twoFactorAuthController.verify2FA
//   );
  
//   router.delete('/:id/2fa',
//     auth,
//     twoFactorAuthController.disable2FA
//   );

module.exports = router;