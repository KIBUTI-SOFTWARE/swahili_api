const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Multer configuration for shop images
const shopImageUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// Public routes
router.get('/', shopController.getAllShops);
router.get('/:id', shopController.getShopById);
router.get('/:id/products', shopController.getShopProducts);

// Seller routes
router.post('/', 
  auth, 
  shopImageUpload,
  shopController.createShop
);

router.put('/:id', 
  auth, 
  shopImageUpload,
  shopController.updateShop
);

router.delete('/:id', 
  auth, 
  shopController.deleteShop
);

// Admin routes
router.patch('/:id/status',
  auth,
  auth.isAdmin,
  shopController.updateShopStatus
);

router.patch('/:id/verify',
  auth,
  auth.isAdmin,
  shopController.updateShopVerification
);

module.exports = router;