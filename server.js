require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
// const connectDB = require('./src/config/db');
const { requestLogger } = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Request logging

// Rate limiting
app.use('/api/', apiLimiter);

// Define Routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/products', require('./src/routes/products'));
app.use('/api/v1/categories', require('./src/routes/categories'));
app.use('/api/v1/shops', require('./src/routes/shops'));
app.use('/api/v1/upload', require('./src/routes/upload'));
app.use('/api/v1/health', require('./src/routes/health'));

// Error handling
app.use(errorHandler);

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


module.exports=app