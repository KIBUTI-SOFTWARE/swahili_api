const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Message ID
 *         sender:
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
 *         content:
 *           type: string
 *         readAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Chat ID
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               username:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   avatar:
 *                     type: string
 *         product:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
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
 *   name: Chat
 *   description: Chat management endpoints
 */

/**
 * @swagger
 * /api/v1/chat/initiate:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Initiate a new chat
 *     description: Start a new chat conversation about a product
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
 *               - message
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "60d3b41f0f72e75d8c25c2d0"
 *               message:
 *                 type: string
 *                 example: "Hi, is this product still available?"
 *     responses:
 *       201:
 *         description: Chat initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       $ref: '#/components/schemas/Chat'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: true
 *               data:
 *                 chat:
 *                   _id: "60d3b41f0f72e75d8c25c2d5"
 *                   participants: [
 *                     {
 *                       _id: "60d3b41f0f72e75d8c25c2d3",
 *                       username: "johndoe",
 *                       profile: {
 *                         avatar: "https://example.com/avatar1.jpg"
 *                       }
 *                     },
 *                     {
 *                       _id: "60d3b41f0f72e75d8c25c2d4",
 *                       username: "seller123",
 *                       profile: {
 *                         avatar: "https://example.com/avatar2.jpg"
 *                       }
 *                     }
 *                   ]
 *                   product: {
 *                     _id: "60d3b41f0f72e75d8c25c2d0",
 *                     name: "Wireless Headphones",
 *                     images: ["https://example.com/product1.jpg"]
 *                   }
 *                   messages: [
 *                     {
 *                       _id: "60d3b41f0f72e75d8c25c2d6",
 *                       sender: {
 *                         _id: "60d3b41f0f72e75d8c25c2d3",
 *                         username: "johndoe"
 *                       },
 *                       content: "Hi, is this product still available?",
 *                       createdAt: "2023-08-15T10:30:00Z"
 *                     }
 *                   ]
 *               errors: []
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/initiate', auth, chatController.initiateChat);

/**
 * @swagger
 * /api/v1/chat:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get user's chats
 *     description: Retrieve all chat conversations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chat'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: true
 *               data:
 *                 chats: [
 *                   {
 *                     _id: "60d3b41f0f72e75d8c25c2d5",
 *                     participants: [
 *                       {
 *                         _id: "60d3b41f0f72e75d8c25c2d3",
 *                         username: "johndoe",
 *                         profile: {
 *                           avatar: "https://example.com/avatar1.jpg"
 *                         }
 *                       },
 *                       {
 *                         _id: "60d3b41f0f72e75d8c25c2d4",
 *                         username: "seller123",
 *                         profile: {
 *                           avatar: "https://example.com/avatar2.jpg"
 *                         }
 *                       }
 *                     ],
 *                     product: {
 *                       _id: "60d3b41f0f72e75d8c25c2d0",
 *                       name: "Wireless Headphones",
 *                       images: ["https://example.com/product1.jpg"]
 *                     },
 *                     lastMessage: {
 *                       sender: {
 *                         _id: "60d3b41f0f72e75d8c25c2d3",
 *                         username: "johndoe"
 *                       },
 *                       content: "Hi, is this product still available?",
 *                       createdAt: "2023-08-15T10:30:00Z"
 *                     },
 *                     updatedAt: "2023-08-15T10:30:00Z"
 *                   }
 *                 ]
 *               errors: []
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, chatController.getChats);

/**
 * @swagger
 * /api/v1/chat/{chatId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get chat messages
 *     description: Retrieve all messages from a specific chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       $ref: '#/components/schemas/Chat'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a chat participant
 *       404:
 *         description: Chat not found
 */
router.get('/:chatId', auth, chatController.getChatMessages);

/**
 * @swagger
 * /api/v1/chat/{chatId}/messages:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a message
 *     description: Send a new message in a chat conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Yes, it's still available!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: true
 *               data:
 *                 message:
 *                   _id: "60d3b41f0f72e75d8c25c2d7"
 *                   sender:
 *                     _id: "60d3b41f0f72e75d8c25c2d4"
 *                     username: "seller123"
 *                   content: "Yes, it's still available!"
 *                   createdAt: "2023-08-15T10:35:00Z"
 *               errors: []
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a chat participant
 *       404:
 *         description: Chat not found
 */
router.post('/:chatId/messages', auth, chatController.sendMessage);

module.exports = router;