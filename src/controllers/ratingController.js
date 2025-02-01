const Rating = require('../models/Rating');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.createRating = async (req, res) => {
  try {
    const { productId, orderId, rating, review, images } = req.body;
    const userId = req.user._id;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      'items.product': productId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        errors: ['Can only rate products from delivered orders'],
        data: null
      });
    }

    // Check if user already rated this product
    const existingRating = await Rating.findOne({
      user: userId,
      product: productId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        errors: ['You have already rated this product'],
        data: null
      });
    }

    const newRating = new Rating({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      review,
      images
    });

    await newRating.save();

    res.status(201).json({
      success: true,
      data: { rating: newRating },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};

exports.getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const ratings = await Rating.find({ product: productId })
      .populate('user', 'username profile.avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Rating.countDocuments({ product: productId });

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalRatings: total
        }
      },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review, images } = req.body;
    const userId = req.user._id;

    const existingRating = await Rating.findOne({
      _id: ratingId,
      user: userId
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        errors: ['Rating not found or not authorized'],
        data: null
      });
    }

    existingRating.rating = rating || existingRating.rating;
    existingRating.review = review || existingRating.review;
    existingRating.images = images || existingRating.images;
    existingRating.updatedAt = Date.now();

    await existingRating.save();

    res.json({
      success: true,
      data: { rating: existingRating },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};