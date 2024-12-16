const mongoose = require('mongoose');
const os = require('os');

exports.checkHealth = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Get system information
    const systemInfo = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
    };

    // Get environment
    const environment = process.env.NODE_ENV || 'development';

    res.json({
      success: true,
      data: {
        status: 'healthy',
        environment,
        database: {
          status: dbStatus,
          name: mongoose.connection.name,
        },
        system: systemInfo,
      },
      errors: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: ['Health check failed', error.message]
    });
  }
};