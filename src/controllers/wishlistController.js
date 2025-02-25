const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); // You'll need to import your Product model

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name price images description'); // Add other fields you want to populate

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({
      success: true,
      errors: [],
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        errors: ['Product not found'],
        data: null
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        user: req.user._id, 
        products: [productId] 
      });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.json({
      success: true,
      errors: [],
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        errors: ['Wishlist not found'],
        data: null
      });
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    await wishlist.save();

    res.json({
      success: true,
      errors: [],
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: [error.message],
      data: null
    });
  }
};