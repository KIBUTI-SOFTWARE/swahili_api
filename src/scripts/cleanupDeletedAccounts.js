require('dotenv').config();
const { User } = require('../models/User');
const { logger } = require('../middleware/logger');
const connectDB = require('../config/db');

async function cleanupDeletedAccounts() {
  try {
    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedUsers = await User.find({
      status: 'deactivated',
      'metadata.deletedAt': { $lt: thirtyDaysAgo }
    });

    for (const user of deletedUsers) {
      // Log deletion
      logger.info({
        event: 'account_permanently_deleted',
        userId: user._id,
        userEmail: user.email,
        deletionRequestDate: user.metadata.deletedAt
      });

      // Perform actual deletion
      await User.deleteOne({ _id: user._id });
    }

    console.log(`Cleaned up ${deletedUsers.length} deleted accounts`);
    process.exit(0);

  } catch (error) {
    logger.error({
      event: 'cleanup_deleted_accounts_failed',
      error: error.message
    });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDeletedAccounts();
}

module.exports = cleanupDeletedAccounts;