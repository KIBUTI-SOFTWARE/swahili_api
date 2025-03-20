const cron = require('node-cron');
const Wishlist = require('../models/Wishlist');
const NotificationService = require('./notificationService');

class WishlistReminderService {
  constructor() {
    // Run daily at 10 AM
    cron.schedule('0 10 * * *', () => {
      this.sendWishlistReminders();
    });
    // cron.schedule('*/5 * * * *', () => {
    //   console.log('Running wishlist reminder check...'); 
    //   this.sendWishlistReminders();
    // });
  }

  async sendWishlistReminders() {
    try {
      const wishlists = await Wishlist.find()
        .populate('user')
        .populate('products');

      for (const wishlist of wishlists) {
        if (wishlist.products.length > 0) {
          const randomProduct = wishlist.products[
            Math.floor(Math.random() * wishlist.products.length)
          ];

          await NotificationService.createPersistentNotification(
            wishlist.user._id,
            `Don't forget about ${randomProduct.name} in your wishlist! It's still available.`,
            null
          );

          if (wishlist.user.expoPushToken) {
            await NotificationService.sendPushNotification(
              wishlist.user.expoPushToken,
              `Don't forget about ${randomProduct.name} in your wishlist!`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error sending wishlist reminders:', error);
    }
  }
}

module.exports = new WishlistReminderService();