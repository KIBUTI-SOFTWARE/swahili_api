require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const os = require('os');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const collectMetrics = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    // Database metrics
    const dbStats = await db.stats();
    const serverStatus = await db.command({ serverStatus: 1 });

    // System metrics
    const systemMetrics = {
      cpu: {
        loadAvg: os.loadavg(),
        cpus: os.cpus(),
        uptime: os.uptime()
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: process.memoryUsage()
      },
      network: os.networkInterfaces()
    };

    // Application metrics
    const collections = await db.listCollections().toArray();
    const collectionMetrics = await Promise.all(
      collections.map(async (collection) => {
        const stats = await db.collection(collection.name).stats();
        return {
          name: collection.name,
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize
        };
      })
    );

    // Disk usage
    const { stdout: diskUsage } = await exec('df -h');

    const metrics = {
      timestamp: new Date(),
      database: {
        size: dbStats.dataSize,
        collections: dbStats.collections,
        indexes: dbStats.indexes,
        connections: serverStatus.connections
      },
      system: systemMetrics,
      collections: collectionMetrics,
      disk: diskUsage
    };

    // Store metrics in database
    await db.collection('system_metrics').insertOne(metrics);

    console.log('Metrics collected successfully');
    return metrics;
  } catch (error) {
    console.error('Failed to collect metrics:', error);
    throw error;
  }
};

module.exports = collectMetrics;

if (require.main === module) {
  collectMetrics().catch(console.error);
}