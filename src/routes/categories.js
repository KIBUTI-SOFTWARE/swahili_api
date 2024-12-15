const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getCategoryProducts);

// Admin routes
router.post('/', 
  auth,
  auth.isAdmin,
  upload.single('image'),
  categoryController.createCategory
);

router.put('/:id',
  auth,
  auth.isAdmin,
  upload.single('image'),
  categoryController.updateCategory
);

router.delete('/:id',
  auth,
  auth.isAdmin,
  categoryController.deleteCategory
);

router.patch('/:id/status',
  auth,
  auth.isAdmin,
  categoryController.updateCategoryStatus
);

router.post('/reorder',
  auth,
  auth.isAdmin,
  categoryController.reorderCategories
);

module.exports = router;