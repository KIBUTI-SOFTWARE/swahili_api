const { User } = require('../models/User');
const Shop = require('../models/Shop');
const { logger } = require('../middleware/logger');

exports.requestAccountDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if user has an active shop
    const shop = await Shop.findOne({ owner: user._id, status: 'active' });
    if (shop) {
      return res.status(400).json({
        success: false,
        errors: ['Cannot delete account: You have an active shop. Please close or transfer ownership of your shop first.'],
        data: null
      });
    }

    // Check for other dependencies like active orders, etc.
    const hasActiveOrders = await checkActiveOrders(user._id);
    if (hasActiveOrders) {
      return res.status(400).json({
        success: false,
        errors: ['Cannot delete account: You have pending orders. Please complete or cancel them first.'],
        data: null
      });
    }

    // Set account for deletion
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // Set deletion date to 30 days from now

    user.status = 'deactivated';
    user.metadata.deletedAt = deletionDate;
    await user.save();

    // Log the account deletion request
    logger.info({
      event: 'account_deletion_requested',
      userId: user._id,
      scheduledDeletionDate: deletionDate,
      userEmail: user.email
    });

    res.json({
      success: true,
      errors: [],
      data: {
        message: 'Account scheduled for deletion. Will be permanently deleted after 30 days.',
        scheduledDeletionDate: deletionDate
      }
    });

  } catch (error) {
    logger.error({
      event: 'account_deletion_request_failed',
      userId: req.user._id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.cancelAccountDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.status !== 'deactivated' || !user.metadata.deletedAt) {
      return res.status(400).json({
        success: false,
        errors: ['No pending account deletion found'],
        data: null
      });
    }

    user.status = 'active';
    user.metadata.deletedAt = null;
    await user.save();

    logger.info({
      event: 'account_deletion_cancelled',
      userId: user._id,
      userEmail: user.email
    });

    res.json({
      success: true,
      errors: [],
      data: {
        message: 'Account deletion cancelled successfully'
      }
    });

  } catch (error) {
    logger.error({
      event: 'account_deletion_cancellation_failed',
      userId: req.user._id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

// Helper function to check for active orders
async function checkActiveOrders(userId) {
  // Implement check for active orders
  // Return true if user has active orders, false otherwise
  return false; // Placeholder - implement based on your Order model
}