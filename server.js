require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { requestLogger } = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const paginateResults = require('./src/middleware/pagination');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const securityMiddleware = require('./src/middleware/security');
const webhookRoutes=require('./src/routes/webhooks')
const swagger = require('./src/config/swagger');
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(helmet()); // Security headers
app.use(cors()); 
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Request logging
app.use(paginateResults);
app.use(securityMiddleware);

app.use('/api-docs', swagger.serve, swagger.setup);

// Rate limiting
app.use('/api/v1/', apiLimiter);

// Routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/products', require('./src/routes/products'));
app.use('/api/v1/categories', require('./src/routes/categories'));
app.use('/api/v1/shops', require('./src/routes/shops'));
app.use('/api/v1/upload', require('./src/routes/upload'));
app.use('/api/v1/health', require('./src/routes/health'));
app.use('/api/v1/users', require('./src/routes/userManagement'));
app.use('/api/v1/orders', require('./src/routes/orders'));
app.use('/api/v1/ratings', require('./src/routes/ratings'));
app.use('/api/v1/chat', require('./src/routes/chat'));
app.use('/api/v1/notifications', require('./src/routes/notifications'));
app.use('/api/v1/webhooks',webhookRoutes)

// Error handling
app.use(errorHandler);

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=swagger.json');
    res.send(swagger.swaggerSpec);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        errors: ['Route not found']
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // In production i hafta crash the process
    process.exit(1);
});


module.exports = app