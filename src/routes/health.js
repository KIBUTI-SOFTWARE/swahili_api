const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Check system health
 *     description: Get system health status and metrics
 *     responses:
 *       200:
 *         description: System health information
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
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     environment:
 *                       type: string
 *                       example: development
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         name:
 *                           type: string
 *                           example: swahili-api
 *                     system:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                         timestamp:
 *                           type: number
 *                         platform:
 *                           type: string
 *                         nodeVersion:
 *                           type: string
 *                         memoryUsage:
 *                           type: object
 *                         cpuUsage:
 *                           type: object
 *                         totalMemory:
 *                           type: number
 *                         freeMemory:
 *                           type: number
 *                         loadAverage:
 *                           type: array
 *                           items:
 *                             type: number
 */
router.get('/', healthController.checkHealth);

module.exports = router;