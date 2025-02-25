const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get user's wishlist
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, wishlistController.getWishlist);

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add product to wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 */
router.post('/', auth, wishlistController.addToWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove product from wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:productId', auth, wishlistController.removeFromWishlist);

module.exports = router;