const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - product
 *         - order
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: Rating ID
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             profile:
 *               type: object
 *               properties:
 *                 avatar:
 *                   type: string
 *         product:
 *           type: string
 *           description: Product ID
 *         order:
 *           type: string
 *           description: Order ID
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value between 1 and 5
 *         review:
 *           type: string
 *           description: Review text
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         helpful:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who found this review helpful
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     RatingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             rating:
 *               $ref: '#/components/schemas/Rating'
 *         errors:
 *           type: array
 *           items:
 *             type: string
 * 
 *     RatingsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             ratings:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *             pagination:
 *               type: object
 *               properties:
 *                 current:
 *                   type: number
 *                 total:
 *                   type: number
 *                 totalRatings:
 *                   type: number
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Product ratings management
 */

/**
 * @swagger
 * /api/v1/ratings:
 *   post:
 *     tags:
 *       - Ratings
 *     summary: Create a new product rating
 *     description: Create a rating for a purchased product (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - orderId
 *               - rating
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60d3b41f0f72e75d8c25c2d0"
 *               orderId:
 *                 type: string
 *                 example: "60d3b41f0f72e75d8c25c2d1"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: "Great product, very satisfied with the quality!"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingResponse'
 *             example:
 *               success: true
 *               data:
 *                 rating:
 *                   _id: "60d3b41f0f72e75d8c25c2d2"
 *                   user:
 *                     _id: "60d3b41f0f72e75d8c25c2d3"
 *                     username: "johndoe"
 *                     profile:
 *                       avatar: "https://example.com/avatar.jpg"
 *                   product: "60d3b41f0f72e75d8c25c2d0"
 *                   order: "60d3b41f0f72e75d8c25c2d1"
 *                   rating: 4
 *                   review: "Great product, very satisfied with the quality!"
 *                   images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *                   helpful: []
 *                   createdAt: "2023-08-15T10:30:00Z"
 *                   updatedAt: "2023-08-15T10:30:00Z"
 *               errors: []
 *       400:
 *         description: Invalid input or already rated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', auth, ratingController.createRating);

/**
 * @swagger
 * /api/v1/ratings/product/{productId}:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: Get product ratings
 *     description: Retrieve all ratings for a specific product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of product ratings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingsListResponse'
 *             example:
 *               success: true
 *               data:
 *                 ratings:
 *                   - _id: "60d3b41f0f72e75d8c25c2d2"
 *                     user:
 *                       _id: "60d3b41f0f72e75d8c25c2d3"
 *                       username: "johndoe"
 *                       profile:
 *                         avatar: "https://example.com/avatar.jpg"
 *                     product: "60d3b41f0f72e75d8c25c2d0"
 *                     order: "60d3b41f0f72e75d8c25c2d1"
 *                     rating: 4
 *                     review: "Great product, very satisfied with the quality!"
 *                     images: ["https://example.com/image1.jpg"]
 *                     helpful: []
 *                     createdAt: "2023-08-15T10:30:00Z"
 *                     updatedAt: "2023-08-15T10:30:00Z"
 *                 pagination:
 *                   current: 1
 *                   total: 5
 *                   totalRatings: 42
 *               errors: []
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/product/:productId', ratingController.getProductRatings);

/**
 * @swagger
 * /api/v1/ratings/{ratingId}:
 *   put:
 *     tags:
 *       - Ratings
 *     summary: Update a rating
 *     description: Update an existing rating (only by the rating owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Updated review: Even better after long-term use!"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/new-image1.jpg"]
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingResponse'
 *             example:
 *               success: true
 *               data:
 *                 rating:
 *                   _id: "60d3b41f0f72e75d8c25c2d2"
 *                   user:
 *                     _id: "60d3b41f0f72e75d8c25c2d3"
 *                     username: "johndoe"
 *                     profile:
 *                       avatar: "https://example.com/avatar.jpg"
 *                   product: "60d3b41f0f72e75d8c25c2d0"
 *                   order: "60d3b41f0f72e75d8c25c2d1"
 *                   rating: 5
 *                   review: "Updated review: Even better after long-term use!"
 *                   images: ["https://example.com/new-image1.jpg"]
 *                   helpful: []
 *                   createdAt: "2023-08-15T10:30:00Z"
 *                   updatedAt: "2023-08-15T11:45:00Z"
 *               errors: []
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the rating owner
 *       404:
 *         description: Rating not found
 *       500:
 *         description: Server error
 */
router.put('/:ratingId', auth, ratingController.updateRating);

module.exports = router;