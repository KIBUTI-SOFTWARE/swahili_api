const paginateResults = (req, res, next) => {
    res.paginate = (data, total) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
  
      return {
        success: true,
        errors: [],
        data: {
          items: data,
          pagination: {
            current: page,
            limit: limit,
            total: Math.ceil(total / limit),
            totalRecords: total
          }
        }
      };
    };
    next();
  };
  
  module.exports = paginateResults;