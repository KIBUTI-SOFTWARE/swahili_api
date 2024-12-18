const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieve all categories with optional filters
 *     parameters:
 *       - in: query
 *         name: parentOnly
 *         schema:
 *           type: boolean
 *         description: Get only parent categories
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive categories
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search categories by name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create new category
 *     security:
 *       - bearerAuth: []
 *     description: Create a new category (Admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               icon:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Category not found
 *
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/v1/categories/{id}/products:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get products in category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of products in category
 *       404:
 *         description: Category not found
 */
router.get('/:id/products', categoryController.getCategoryProducts);

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - image
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Category name
 *         slug:
 *           type: string
 *           description: URL-friendly version of name
 *         description:
 *           type: string
 *           description: Category description
 *         image:
 *           type: string
 *           description: Category image URL
 *         icon:
 *           type: string
 *           description: Category icon URL
 *         parentCategory:
 *           type: string
 *           description: ID of parent category
 *         subCategories:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of subcategory IDs
 *         level:
 *           type: number
 *           description: Category hierarchy level
 *         isActive:
 *           type: boolean
 *           description: Category status
 *         displayOrder:
 *           type: number
 *           description: Order for display
 *         metadata:
 *           type: object
 *           properties:
 *             productCount:
 *               type: number
 *             activeProductCount:
 *               type: number
 */
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