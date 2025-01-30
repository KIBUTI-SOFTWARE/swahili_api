const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Multer configuration for shop images
const shopImageUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

/**
 * @swagger
 * /api/v1/shops/own:
 *   get:
 *     tags:
 *       - Shops
 *     summary: Get authenticated user's shop
 *     description: Retrieve the shop owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 data:
 *                   type: object
 *                   properties:
 *                     shop:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d5ecb8b5c9c62b3c7c1b5e"
 *                         name:
 *                           type: string
 *                           example: "My Shop"
 *                         description:
 *                           type: string
 *                           example: "A great shop with amazing products"
 *                         logo:
 *                           type: string
 *                           example: "https://example.com/logo.jpg"
 *                         coverImage:
 *                           type: string
 *                           example: "https://example.com/cover.jpg"
 *                         status:
 *                           type: string
 *                           enum: [pending, active, suspended, closed]
 *                           example: "active"
 *                         address:
 *                           type: object
 *                           properties:
 *                             street:
 *                               type: string
 *                             city:
 *                               type: string
 *                             state:
 *                               type: string
 *                             country:
 *                               type: string
 *                             zipCode:
 *                               type: string
 *                             coordinates:
 *                               type: object
 *                               properties:
 *                                 lat:
 *                                   type: number
 *                                 lng:
 *                                   type: number
 *                         contactInfo:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *                             website:
 *                               type: string
 *                             socialMedia:
 *                               type: object
 *                               properties:
 *                                 facebook:
 *                                   type: string
 *                                 instagram:
 *                                   type: string
 *                                 twitter:
 *                                   type: string
 *                         categories:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Server error
 */
router.get('/own', auth, shopController.getUserShop);

/**
 * @swagger
 * components:
 *   schemas:
 *     Shop:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - address
 *         - contactInfo
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         logo:
 *           type: string
 *         coverImage:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             zipCode:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         contactInfo:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             website:
 *               type: string
 *             socialMedia:
 *               type: object
 *               properties:
 *                 facebook:
 *                   type: string
 *                 instagram:
 *                   type: string
 *                 twitter:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/shops:
 *   get:
 *     tags:
 *       - Shops
 *     summary: Get all shops
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, suspended, closed]
 *     responses:
 *       200:
 *         description: List of shops
 *
 *   post:
 *     tags:
 *       - Shops
 *     summary: Create new shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       201:
 *         description: Shop created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Sellers only
 */
router.get('/', shopController.getAllShops);

/**
 * @swagger
 * /api/v1/shops/{id}:
 *   get:
 *     tags:
 *       - Shops
 *     summary: Get shop by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shop details
 *       404:
 *         description: Shop not found
 *
 *   put:
 *     tags:
 *       - Shops
 *     summary: Update shop
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
 *             $ref: '#/components/schemas/Shop'
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner only
 *       404:
 *         description: Shop not found
 *
 *   delete:
 *     tags:
 *       - Shops
 *     summary: Delete shop
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
 *         description: Shop deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Shop owner only
 *       404:
 *         description: Shop not found
 */
router.get('/:id', shopController.getShopById);

/**
 * @swagger
 * /api/v1/shops/{id}/products:
 *   get:
 *     tags:
 *       - Shops
 *     summary: Get shop products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shop products
 *       404:
 *         description: Shop not found
 */
router.get('/:id/products', shopController.getShopProducts);


// Seller routes
router.post('/', 
  auth, 
  shopImageUpload,
  shopController.createShop
);

router.put('/:id', 
  auth, 
  shopImageUpload,
  shopController.updateShop
);

router.delete('/:id', 
  auth, 
  shopController.deleteShop
);

// Admin routes
/**
 * @swagger
 * /api/v1/shops/{id}/status:
 *   patch:
 *     tags:
 *       - Shops
 *     summary: Update shop status
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
 *                 enum: [pending, active, suspended, closed]
 *     responses:
 *       200:
 *         description: Shop status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Shop not found
 */
router.patch('/:id/status',
  auth,
  auth.isAdmin,
  shopController.updateShopStatus
);

router.patch('/:id/verify',
  auth,
  auth.isAdmin,
  shopController.updateShopVerification
);

module.exports = router;