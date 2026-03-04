// Utility for standardized API responses

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendCreated = (res, data, message = 'Created successfully') => {
  sendSuccess(res, data, message, 201);
};

export const sendPaginated = (res, { data, page, limit, total, totalPages }, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

// Helper to calculate pagination
export const paginate = async (model, query, options) => {
  const { page = 1, limit = 10, sort = '-createdAt', populate = '' } = options;
  
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    model.find(query)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(query)
  ]);

  return {
    data,
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit)
  };
};
