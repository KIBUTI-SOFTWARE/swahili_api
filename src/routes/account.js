const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requestAccountDeletion, cancelAccountDeletion } = require('../controllers/accountController');

/**
 * @swagger
 * /api/v1/account/delete:
 *   post:
 *     tags:
 *       - Account
 *     summary: Request account deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account scheduled for deletion
 *       400:
 *         description: Cannot delete account due to dependencies
 */
router.post('/delete', auth, requestAccountDeletion);

/**
 * @swagger
 * /api/v1/account/delete/cancel:
 *   post:
 *     tags:
 *       - Account
 *     summary: Cancel pending account deletion
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deletion cancelled
 *       400:
 *         description: No pending deletion found
 */
router.post('/delete/cancel', auth, cancelAccountDeletion);

module.exports = router;