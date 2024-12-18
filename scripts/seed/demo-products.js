require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../../src/models/Product');
const Category = require('../../src/models/Category');
const Shop = require('../../src/models/Shop');

const demoProducts = [
  {
    name: 'Demo Smartphone',
    description: 'High-end smartphone with amazing features',
    price: 999.99,
    images: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'],
    stock: 100,
    status: 'active'
  },
  // Add more demo products here
];

const seedDemoProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a random category and shop for each product
    const categories = await Category.find();
    const shops = await Shop.find();

    if (!categories.length || !shops.length) {
      throw new Error('Please seed categories and ensure at least one shop exists first');
    }

    // Clear existing demo products
    await Product.deleteMany({ isDemoProduct: true });

    // Create demo products
    const products = await Promise.all(
      demoProducts.map(async (product) => {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomShop = shops[Math.floor(Math.random() * shops.length)];

        return Product.create({
          ...product,
          category: randomCategory._id,
          shop: randomShop._id,
          isDemoProduct: true // Flag to identify demo products
        });
      })
    );

    console.log(`Created ${products.length} demo products`);

  } catch (error) {
    console.error('Demo product seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  seedDemoProducts().catch(console.error);
}

module.exports = seedDemoProducts;