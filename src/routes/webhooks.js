const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { User } = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Helper function to log webhook data
async function logWebhookData(data) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] WebHook Data: ${JSON.stringify(data)}\n`;

    try {
        await fs.appendFile(
            path.join(__dirname, '../logs/webhook_logs.txt'),
            logEntry
        );
    } catch (error) {
        console.error('Error writing to webhook log:', error);
    }
}

router.post('/zenopay', async (req, res) => {
    try {
        const webhookData = req.body;

        // Log the webhook data
        await logWebhookData(webhookData);
        console.log('Received webhook:', webhookData);

        // Find order by zenopay order_id stored in transactionId
        const order = await Order.findOne({
            'paymentDetails.transactionId': webhookData.order_id
        });

        if (!order) {
            console.error('Order not found:', webhookData.order_id);
            await logWebhookData({
                error: 'Order not found',
                order_id: webhookData.order_id
            });
            return res.status(404).json({ error: 'Order not found' });
        }

        // Map Zenopay status to our internal status
        const statusMapping = {
            'COMPLETED': 'success',
            'FAILED': 'failed',
            'CANCELLED': 'cancelled'
        };

        const paymentStatus = statusMapping[webhookData.payment_status] || webhookData.status;

        switch (paymentStatus) {
            case 'success':
                // Update order status to paid/pending
                order.status = 'pending';
                order.paymentStatus = 'completed';
                order.paymentDetails = {
                    ...order.paymentDetails,
                    status: 'completed',
                    paidAt: new Date(),
                    paymentReference: webhookData.reference,
                };
                await order.save();

                // Now update product stock and other related data
                await Product.findByIdAndUpdate(
                    order.items[0].product,
                    {
                        $inc: { stock: -order.items[0].quantity },
                        $push: { orders: order._id }
                    }
                );

                // Update user's orders
                await User.findByIdAndUpdate(
                    order.user,
                    { $push: { orders: order._id } }
                );

                break;

            case 'failed':
                order.status = 'cancelled';
                order.paymentStatus = 'failed';
                order.paymentDetails = {
                    ...order.paymentDetails,
                    status: 'failed',
                    failureReason: webhookData.reason || 'Payment failed',
                    failedAt: new Date()
                };
                await order.save();
                break;

            case 'cancelled':
                order.status = 'cancelled';
                order.paymentStatus = 'cancelled';
                order.paymentDetails = {
                    ...order.paymentDetails,
                    status: 'cancelled',
                    cancelledAt: new Date()
                };
                await order.save();
                break;

            default:
                const message = `Unhandled webhook event status: ${webhookData.payment_status}`;
                console.log(message);
                await logWebhookData({
                    error: message,
                    webhook_data: webhookData
                });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handling error:', error);
        await logWebhookData({
            error: error.message,
            stack: error.stack
        });
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

router.get('/zenopay', (req, res) => {
    res.json({ message: 'Zenopay webhook endpoint is working' });
});

module.exports = router;