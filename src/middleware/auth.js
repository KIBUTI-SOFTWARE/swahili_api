const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
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
    
    // Add user from payload
    req.user = decoded.user;
    
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
  if (req.user.userType !== 'SELLER') {  // Change this to match the enum
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