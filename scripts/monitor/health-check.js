require('dotenv').config();
const mongoose = require('mongoose');
const os = require('os');
const disk = require('check-disk-space').default;

const checkHealth = async () => {
  try {
    console.log('Starting health check...');

    // Check MongoDB connection
    const mongoStart = Date.now();
    await mongoose.connect(process.env.MONGODB_URI);
    const mongoLatency = Date.now() - mongoStart;

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        processUsage: process.memoryUsage()
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      }
    };

    // Disk space (Windows compatible)
    const diskSpace = await disk('C:/');

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date(),
      system: {
        ...systemMetrics,
        disk: {
          free: diskSpace.free,
          total: diskSpace.size
        }
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        latency: `${mongoLatency}ms`
      }
    };

    console.log('Health check results:', JSON.stringify(healthStatus, null, 2));
    return healthStatus;

  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  checkHealth().catch(console.error);
}

module.exports = checkHealth;