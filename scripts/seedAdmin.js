require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('../src/models/Category');

const initialCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: '/uploads/categories/electronics.jpg',
    icon: 'fa-solid fa-laptop',
    parentCategory: null,
    level: 1,
    isActive: true,
    displayOrder: 1,
    metadata: {
      productCount: 0,
      activeProductCount: 0
    },
    attributes: [
      {
        name: 'Brand',
        type: 'select',
        required: true,
        options: ['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo']
      },
      {
        name: 'Warranty',
        type: 'text',
        required: false
      }
    ],
    subCategories: [] // Will be populated dynamically
  },
  {
    name: 'Smartphones',
    description: 'Mobile phones and smart devices',
    image: '/uploads/categories/smartphones.jpg',
    icon: 'fa-solid fa-mobile-alt',
    parentCategory: null, // Will be set dynamically
    level: 2,
    isActive: true,
    displayOrder: 2,
    metadata: {
      productCount: 0,
      activeProductCount: 0
    },
    attributes: [
      {
        name: 'Model',
        type: 'text',
        required: true
      },
      {
        name: 'Storage',
        type: 'select',
        required: true,
        options: ['64GB', '128GB', '256GB', '512GB']
      }
    ],
    subCategories: []
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    image: '/uploads/categories/fashion.jpg',
    icon: 'fa-solid fa-tshirt',
    parentCategory: null,
    level: 1,
    isActive: true,
    displayOrder: 3,
    metadata: {
      productCount: 0,
      activeProductCount: 0
    },
    attributes: [
      {
        name: 'Size',
        type: 'select',
        required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        name: 'Color',
        type: 'text',
        required: true
      }
    ],
    subCategories: []
  },
  {
    name: 'Men\'s Clothing',
    description: 'Clothing for men',
    image: '/uploads/categories/mens-clothing.jpg',
    icon: 'fa-solid fa-male',
    parentCategory: null, // Will be set dynamically
    level: 2,
    isActive: true,
    displayOrder: 4,
    metadata: {
      productCount: 0,
      activeProductCount: 0
    },
    attributes: [
      {
        name: 'Fit',
        type: 'select',
        required: true,
        options: ['Slim', 'Regular', 'Relaxed']
      }
    ],
    subCategories: []
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Existing categories cleared');

    // Create top-level categories first
    const topLevelCategories = initialCategories.filter(cat => cat.level === 1);
    const createdTopLevelCategories = [];

    for (const categoryData of topLevelCategories) {
      const newCategory = new Category({
        ...categoryData,
        slug: slugify(categoryData.name, { lower: true })
      });
      await newCategory.save();
      createdTopLevelCategories.push(newCategory);
      console.log(`Top-level category "${newCategory.name}" created successfully`);
    }

    // Create subcategories and link to parent
    const subCategories = initialCategories.filter(cat => cat.level === 2);
    for (const subcategoryData of subCategories) {
      // Determine parent based on category type
      let parentCategory;
      if (subcategoryData.name === 'Smartphones') {
        parentCategory = createdTopLevelCategories.find(cat => cat.name === 'Electronics');
      } else if (subcategoryData.name === 'Men\'s Clothing') {
        parentCategory = createdTopLevelCategories.find(cat => cat.name === 'Fashion');
      }

      if (parentCategory) {
        const newSubCategory = new Category({
          ...subcategoryData,
          parentCategory: parentCategory._id,
          slug: slugify(subcategoryData.name, { lower: true })
        });
        await newSubCategory.save();

        // Update parent category's subCategories
        parentCategory.subCategories.push(newSubCategory._id);
        await parentCategory.save();

        console.log(`Subcategory "${newSubCategory.name}" created under "${parentCategory.name}"`);
      }
    }

    console.log('Category seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedCategories();