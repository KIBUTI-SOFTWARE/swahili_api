const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  },
  images: [String],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ratingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

// Ensure one rating per user per product
ratingSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product's average rating when a new rating is added
ratingSchema.post('save', async function() {
  const Rating = this.constructor;
  const Product = require('./Product');

  const stats = await Rating.aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].numberOfRatings
    });
  }
});

module.exports = mongoose.model('Rating', ratingSchema);