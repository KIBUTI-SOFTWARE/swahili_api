require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Category = require('../src/models/Category');

const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123', // This will be hashed
  userType: 'ADMIN',  // Changed from SELLER to ADMIN
  profile: {
    firstName: 'System',
    lastName: 'Administrator'
  }
};

const initialCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', // Default image
    slug: 'electronics',
    isActive: true,
    displayOrder: 1,
    attributes: [
      {
        name: 'Brand',
        type: 'text',
        required: true
      },
      {
        name: 'Model',
        type: 'text',
        required: true
      },
      {
        name: 'Condition',
        type: 'select',
        required: true,
        options: ['New', 'Used', 'Refurbished']
      }
    ]
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    slug: 'fashion',
    isActive: true,
    displayOrder: 2,
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
      },
      {
        name: 'Gender',
        type: 'select',
        required: true,
        options: ['Men', 'Women', 'Unisex']
      }
    ]
  },
  {
    name: 'Home & Garden',
    description: 'Home decor, furniture, and garden supplies',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    slug: 'home-garden',
    isActive: true,
    displayOrder: 3,
    attributes: [
      {
        name: 'Material',
        type: 'text',
        required: true
      },
      {
        name: 'Dimensions',
        type: 'text',
        required: false
      }
    ]
  },
  {
    name: 'Books',
    description: 'Books, magazines, and publications',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    slug: 'books',
    isActive: true,
    displayOrder: 4,
    attributes: [
      {
        name: 'Author',
        type: 'text',
        required: true
      },
      {
        name: 'ISBN',
        type: 'text',
        required: true
      },
      {
        name: 'Format',
        type: 'select',
        required: true,
        options: ['Hardcover', 'Paperback', 'Digital']
      }
    ]
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    slug: 'sports-outdoors',
    isActive: true,
    displayOrder: 5,
    attributes: [
      {
        name: 'Sport Type',
        type: 'text',
        required: true
      },
      {
        name: 'Equipment Type',
        type: 'text',
        required: true
      }
    ]
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);

      // Create admin user
      const newAdmin = new User({
        ...adminUser,
        password: hashedPassword
      });

      await newAdmin.save();
      console.log('Admin user created successfully:', {
        email: adminUser.email,
        password: 'admin123' // Show the unhashed password for initial login
      });
    } else {
      console.log('Admin user already exists');
    }

    // Seed categories
    for (const category of initialCategories) {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        await Category.create(category);
        console.log(`Category "${category.name}" created successfully`);
      } else {
        console.log(`Category "${category.name}" already exists`);
      }
    }

    console.log('\nSeeding completed successfully');
    console.log('\nYou can now login with:');
    console.log('Email:', adminUser.email);
    console.log('Password:', 'admin123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seed function
seedDB();