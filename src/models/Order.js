const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: String
  }],
  amounts: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String // Added phone as it's needed for mobile money
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'mobile_money'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    provider: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled']
    },
    message: String,
    initiatedAt: Date,
    paidAt: Date,
    failedAt: Date,
    cancelledAt: Date,
    paymentReference: String,
    failureReason: String
  },
  status: {
    type: String,
    enum: ['pending_payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending_payment', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
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

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Generate a unique order number (you can customize this format)
    this.orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  
  // Add status to history if it's changed
  if (this.isModified('status')) {
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    
    // Only add to history if this isn't a new document
    if (!this.isNew) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        updatedBy: this._updatedBy // This should be set before saving
      });
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Add a method to update payment status
orderSchema.methods.updatePaymentStatus = function(paymentData) {
  this.paymentStatus = paymentData.status;
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentData,
    status: paymentData.status,
    updatedAt: new Date()
  };
};

module.exports = mongoose.model('Order', orderSchema);