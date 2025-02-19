const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *       properties:
 *         street:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City name
 *         state:
 *           type: string
 *           description: State or province
 *         zipCode:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country name
 *     
 *     OrderCreate:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         productId:
 *           type: string
 *           description: ID of the product to order
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Number of items to order
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, stripe]
 *           description: Payment method for the order
 *     
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *         orderNumber:
 *           type: string
 *           description: Unique order number
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         shop:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         amounts:
 *           type: object
 *           properties:
 *             subtotal:
 *               type: number
 *             tax:
 *               type: number
 *             shipping:
 *               type: number
 *             total:
 *               type: number
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreate'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.use(auth);
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/v1/orders/my-orders:
 *   get:
 *     summary: Get authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalRecords:
 *                           type: number
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.get('/my-orders', orderController.getUserOrders);

/**
 * @swagger
 * /api/v1/orders/statuses:
 *   get:
 *     summary: Get order status information
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statuses:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: object
 *                           properties:
 *                             description:
 *                               type: string
 *                               example: Order has been placed but not yet processed
 *                             nextPossibleStatuses:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: [processing, cancelled]
 *                         processing:
 *                           type: object
 *                           properties:
 *                             description:
 *                               type: string
 *                               example: Order is being processed and prepared for shipping
 *                             nextPossibleStatuses:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: [shipped, cancelled]
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.get('/statuses', auth, orderController.getOrderStatuses);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - User not authorized to view this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{orderId}/payment-status:
 *   get:
 *     summary: Check payment status from Zenopay
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to check payment status
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentStatus:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *                     paymentDetails:
 *                       type: object
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 */
router.get('/:orderId/payment-status',auth, orderController.checkPaymentStatus);

/**
 * @swagger
 * /api/v1/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *             example:
 *               status: shipped
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       400:
 *         description: Invalid status value or invalid status transition
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               errors: ["Invalid status transition from pending to shipped"]
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - User not authorized to update this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/:orderId/status', auth, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/v1/orders/{orderId}/payment-status:
 *   patch:
 *     summary: Update order payment status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, cancelled]
 *               transactionId:
 *                 type: string
 *               paymentDetails:
 *                 type: object
 */
router.patch('/:orderId/payment-status', auth, orderController.updatePaymentStatus);

/**
 * @swagger
 * /api/v1/orders/shop:
 *   get:
 *     summary: Get all orders for the authenticated shop owner
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/shop', auth, orderController.getShopOrders);
module.exports = router;