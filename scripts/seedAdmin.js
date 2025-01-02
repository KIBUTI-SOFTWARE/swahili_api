require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../src/models/User');
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
        image: 'https://res.cloudinary.com/demo/image/upload/electronics.jpg',
        slug: 'electronics',
        isActive: true,
        displayOrder: 1,
        attributes: [
            { name: 'Brand', type: 'text', required: true },
            { name: 'Model', type: 'text', required: true },
            { name: 'Condition', type: 'select', required: true, options: ['New', 'Used', 'Refurbished'] }
        ]
    },
    {
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories',
        image: 'https://res.cloudinary.com/demo/image/upload/fashion.jpg',
        slug: 'fashion',
        isActive: true,
        displayOrder: 2,
        attributes: [
            { name: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { name: 'Color', type: 'text', required: true },
            { name: 'Material', type: 'text', required: true }
        ]
    },
    {
        name: 'Home & Garden',
        description: 'Furniture, decor, and gardening supplies',
        image: 'https://res.cloudinary.com/demo/image/upload/home.jpg',
        slug: 'home-garden',
        isActive: true,
        displayOrder: 3,
        attributes: [
            { name: 'Material', type: 'text', required: true },
            { name: 'Dimensions', type: 'text', required: true }
        ]
    },
    {
        name: 'Books',
        description: 'Books, textbooks, and educational materials',
        image: 'https://res.cloudinary.com/demo/image/upload/books.jpg',
        slug: 'books',
        isActive: true,
        displayOrder: 4,
        attributes: [
            { name: 'ISBN', type: 'text', required: true },
            { name: 'Author', type: 'text', required: true },
            { name: 'Format', type: 'select', required: true, options: ['Paperback', 'Hardcover', 'Digital'] }
        ]
    },
    {
        name: 'Sports & Fitness',
        description: 'Sports equipment and fitness gear',
        image: 'https://res.cloudinary.com/demo/image/upload/sports.jpg',
        slug: 'sports-fitness',
        isActive: true,
        displayOrder: 5,
        attributes: [
            { name: 'Type', type: 'text', required: true },
            { name: 'Size', type: 'text', required: false }
        ]
    },
    {
        name: 'Beauty & Health',
        description: 'Beauty products and health supplies',
        image: 'https://res.cloudinary.com/demo/image/upload/beauty.jpg',
        slug: 'beauty-health',
        isActive: true,
        displayOrder: 6,
        attributes: [
            { name: 'Brand', type: 'text', required: true },
            { name: 'Volume/Weight', type: 'text', required: true },
            { name: 'Expiry Date', type: 'date', required: true }
        ]
    },
    {
        name: 'Automotive',
        description: 'Car parts and accessories',
        image: 'https://res.cloudinary.com/demo/image/upload/automotive.jpg',
        slug: 'automotive',
        isActive: true,
        displayOrder: 7,
        attributes: [
            { name: 'Make', type: 'text', required: true },
            { name: 'Model', type: 'text', required: true },
            { name: 'Year', type: 'number', required: true }
        ]
    },
    {
        name: 'Toys & Games',
        description: 'Toys, games, and entertainment items',
        image: 'https://res.cloudinary.com/demo/image/upload/toys.jpg',
        slug: 'toys-games',
        isActive: true,
        displayOrder: 8,
        attributes: [
            { name: 'Age Range', type: 'text', required: true },
            { name: 'Category', type: 'select', required: true, options: ['Educational', 'Action Figures', 'Board Games', 'Outdoor'] }
        ]
    },
    {
        name: 'Food & Beverages',
        description: 'Food items and beverages',
        image: 'https://res.cloudinary.com/demo/image/upload/food.jpg',
        slug: 'food-beverages',
        isActive: true,
        displayOrder: 9,
        attributes: [
            { name: 'Type', type: 'select', required: true, options: ['Fresh', 'Packaged', 'Frozen'] },
            { name: 'Weight', type: 'text', required: true },
            { name: 'Expiry Date', type: 'date', required: true }
        ]
    },
    {
        name: 'Art & Crafts',
        description: 'Art supplies and craft materials',
        image: 'https://res.cloudinary.com/demo/image/upload/art.jpg',
        slug: 'art-crafts',
        isActive: true,
        displayOrder: 10,
        attributes: [
            { name: 'Medium', type: 'text', required: true },
            { name: 'Material', type: 'text', required: true }
        ]
    }
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
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);
            
            const newAdmin = new User({
                ...adminUser,
                password: hashedPassword
            });
            await newAdmin.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Seed categories
        let createdCount = 0;
        let existingCount = 0;

        for (const category of initialCategories) {
            const existingCategory = await Category.findOne({ slug: category.slug });
            if (!existingCategory) {
                await Category.create(category);
                createdCount++;
                console.log(`Created category: ${category.name}`);
            } else {
                existingCount++;
                console.log(`Category exists: ${category.name}`);
            }
        }

        console.log('\nSeeding Summary:');
        console.log('----------------');
        console.log(`Categories created: ${createdCount}`);
        console.log(`Categories existing: ${existingCount}`);
        console.log(`Total categories: ${createdCount + existingCount}`);
        console.log('\nAdmin Login Credentials:');
        console.log('Email:', adminUser.email);
        console.log('Password:', adminUser.password);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
};

// Check if running in production
if (process.env.NODE_ENV === 'production') {
    // Add additional safety checks for production
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Are you sure you want to run this seed in production? (yes/no) ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
            console.log('Running seed in production...');
            await seedDB();
        } else {
            console.log('Seed operation cancelled');
        }
        readline.close();
    });
} else {
    // Development environment
    seedDB();
}