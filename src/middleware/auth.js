const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
require('dotenv').config();

module.exports = async function (req, res, next) {
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      errors: ['No token, authorization denied'],
      data: null
    });
  }

  // Remove 'Bearer ' prefix and get the token
  const token = authHeader.replace('Bearer ', '').trim();

  // Check if token is empty
  if (!token) {
    return res.status(401).json({ 
      success: false,
      errors: ['No token provided'],
      data: null
    });
  }

  try {
    // Verify token using ACCESS_TOKEN_SECRET
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Fetch complete user object from database
    const user = await User.findById(decoded.user.id)
      .populate('roles'); 
    
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ['User not found'],
        data: null
      });
    }

    // Add complete user object to request
    req.user = user;
    
    next();
  } catch (err) {
    // Handle different types of JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        errors: ['Token has expired'],
        data: null
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        errors: ['Invalid token'],
        data: null
      });
    }

    // Catch any other unexpected errors
    return res.status(500).json({ 
      success: false,
      errors: ['Authentication error'],
      data: null
    });
  }
};

module.exports.isStoreOwner = (req, res, next) => {
  if (req.user.userType !== 'SELLER') {  
    return res.status(403).json({ message: 'Access denied. Seller rights required.' });
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.userType !== 'ADMIN') {
    return res.status(403).json({ 
      success: false,
      errors: ['Access denied. Admin rights required'],
      data: null 
    });
  }
  next();
};