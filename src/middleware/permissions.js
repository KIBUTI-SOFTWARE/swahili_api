const checkPermission = (resource, action) => {
    return async (req, res, next) => {
      try {
        const user = req.user;
  
        if (!user) {
          return res.status(401).json({
            success: false,
            errors: ['Authentication required'],
            data: null
          });
        }
  
        // Admin bypass
        if (user.userType === 'ADMIN') {
          return next();
        }
  
        // Check if user has required permission
        const hasPermission = await user.hasPermission(resource, action);
  
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            errors: ['Insufficient permissions'],
            data: null
          });
        }
  
        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          errors: [error.message],
          data: null
        });
      }
    };
  };
  
  module.exports = {
    checkPermission
  };