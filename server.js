require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/v1/auth', require('./src/routes/auth'));
app.use('/api/v1/products', require('./src/routes/products'));
app.use('/api/v1/categories', require('./src/routes/categories'));
app.use('/api/v1/shops', require('./src/routes/shops'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));