require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../src/models/User'); // Update this import
const Category = require('../src/models/Category');

mongoose.set('strictQuery', false);

const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  userType: 'ADMIN',
  status: 'active',
  profile: {
    firstName: 'System',
    lastName: 'Administrator'
  }
};

const initialCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
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
  // ... other categories remain the same
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
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
        password: adminUser.password // Show unhashed password for initial login
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
    console.log('Password:', adminUser.password);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seed function
seedDB();