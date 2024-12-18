require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const optimizeDB = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    console.log('Starting database optimization...');

    // Get all collections
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      console.log(`Optimizing collection: ${collection.name}`);

      // Recompute indexes
      await db.command({ reIndex: collection.name });

      // Compact collection
      try {
        await db.command({ compact: collection.name });
      } catch (e) {
        console.warn(`Compact not supported for ${collection.name}`);
      }

      // Update collection statistics
      const stats = await db.collection(collection.name).stats();
      console.log(`Collection ${collection.name} stats:`, {
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        documents: stats.count,
        indexes: stats.nindexes
      });
    }

    // Analyze indexes
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      const unusedIndexes = [];

      for (const index of indexes) {
        if (index.name === '_id_') continue;

        const indexStats = await db.collection(collection.name).aggregate([
          { $indexStats: {} },
          { $match: { name: index.name } }
        ]).toArray();

        if (indexStats[0]?.accesses?.ops === 0) {
          unusedIndexes.push(index.name);
        }
      }

      if (unusedIndexes.length > 0) {
        console.log(`Unused indexes in ${collection.name}:`, unusedIndexes);
      }
    }

    console.log('Database optimization completed');

  } catch (error) {
    console.error('Optimization failed:', error);
    throw error;
  } finally {
    await client.close();
  }
};

if (require.main === module) {
  optimizeDB().catch(console.error);
}

module.exports = optimizeDB;