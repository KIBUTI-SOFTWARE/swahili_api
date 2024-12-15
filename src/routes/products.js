const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Create a new product (protected route)
router.post('/', auth, productController.createProduct);

// Get all products (public route)
router.get('/', productController.getAllProducts);

// Get a single product by ID (public route)
router.get('/:id', productController.getProductById);

// Update a product (protected route)
router.put('/:id', auth, productController.updateProduct);

// Delete a product (protected route)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;