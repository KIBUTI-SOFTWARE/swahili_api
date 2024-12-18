require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const migrationsPath = path.join(__dirname, '../../migrations');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create migrations collection if it doesn't exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    if (!collections.find(c => c.name === 'migrations')) {
      await db.createCollection('migrations');
    }

    // Get all migration files
    const files = await fs.readdir(migrationsPath);
    const migrations = files
      .filter(f => f.endsWith('.js'))
      .sort();

    // Get executed migrations
    const executedMigrations = await db
      .collection('migrations')
      .find({})
      .toArray();

    // Run pending migrations
    for (const file of migrations) {
      if (!executedMigrations.find(m => m.name === file)) {
        console.log(`Running migration: ${file}`);
        
        const migration = require(path.join(migrationsPath, file));
        await migration.up(db);
        
        await db.collection('migrations').insertOne({
          name: file,
          executedAt: new Date()
        });
        
        console.log(`Completed migration: ${file}`);
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

module.exports = migrate;

if (require.main === module) {
  migrate().catch(console.error);
}