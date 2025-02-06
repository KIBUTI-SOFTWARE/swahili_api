const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  images: [String],
  stock: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    total: {
      type: Number,
      default: 0
    },
    unique: {
      type: Number,
      default: 0
    },
    history: [{
      ip: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.views) {
      delete ret.views.history;
    }
    return ret;
  }
});

module.exports = mongoose.model('Product', ProductSchema);