const buildSearchQuery = (searchTerm, fields) => {
    if (!searchTerm) return {};
  
    const searchRegex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: searchRegex }))
    };
  };
  
  const buildFilterQuery = (filters) => {
    const query = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'minPrice') {
          query.price = { ...query.price, $gte: Number(value) };
        } else if (key === 'maxPrice') {
          query.price = { ...query.price, $lte: Number(value) };
        } else {
          query[key] = value;
        }
      }
    });
  
    return query;
  };
  
  module.exports = { buildSearchQuery, buildFilterQuery };