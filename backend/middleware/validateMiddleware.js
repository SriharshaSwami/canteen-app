import Joi from "joi";
import { ApiError } from "./errorMiddleware.js";

// Generic validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(400, message));
    }

    req.body = value;
    next();
  };
};

// Auth validation schemas
export const authSchemas = {
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 128 characters'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required'
      })
  })
};

// Menu validation schemas
export const menuSchemas = {
  create: Joi.object({
    mealName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Meal name is required',
        'string.min': 'Meal name must be at least 2 characters',
        'string.max': 'Meal name cannot exceed 100 characters'
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be greater than 0',
        'any.required': 'Price is required'
      }),
    category: Joi.string()
      .valid('breakfast', 'lunch', 'dinner', 'snacks')
      .required()
      .messages({
        'any.only': 'Category must be one of: breakfast, lunch, dinner, snacks',
        'any.required': 'Category is required'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .default('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    available: Joi.boolean()
      .default(true),
    stock: Joi.number()
      .integer()
      .min(0)
      .default(100)
      .messages({
        'number.base': 'Stock must be a number',
        'number.min': 'Stock cannot be negative'
      }),
    dailyLimit: Joi.number()
      .integer()
      .min(0)
      .default(100)
      .messages({
        'number.base': 'Daily limit must be a number',
        'number.min': 'Daily limit cannot be negative'
      })
  }),

  update: Joi.object({
    mealName: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Meal name must be at least 2 characters',
        'string.max': 'Meal name cannot exceed 100 characters'
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be greater than 0'
      }),
    category: Joi.string()
      .valid('breakfast', 'lunch', 'dinner', 'snacks')
      .messages({
        'any.only': 'Category must be one of: breakfast, lunch, dinner, snacks'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    available: Joi.boolean(),
    stock: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.base': 'Stock must be a number',
        'number.min': 'Stock cannot be negative'
      }),
    dailyLimit: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.base': 'Daily limit must be a number',
        'number.min': 'Daily limit cannot be negative'
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Credit validation schemas
export const creditSchemas = {
  addCredits: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'string.empty': 'User ID is required'
      }),
    amount: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
      }),
    description: Joi.string()
      .max(200)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 200 characters'
      })
  })
};

// Cart validation schemas
export const cartSchemas = {
  addItem: Joi.object({
    menuItemId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Menu item ID is required'
      }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .default(1)
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 10'
      })
  }),

  updateItem: Joi.object({
    menuItemId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Menu item ID is required'
      }),
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 10',
        'any.required': 'Quantity is required'
      })
  }),

  checkout: Joi.object({
    notes: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
  })
};

// Order validation schemas
export const orderSchemas = {
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')
      .required()
      .messages({
        'any.only': 'Status must be one of: pending, accepted, preparing, ready, completed, cancelled',
        'any.required': 'Status is required'
      }),
    notes: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
  })
};

// Query validation for pagination
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'amount', '-amount').default('-createdAt')
  }),

  menuFilter: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snacks'),
    available: Joi.string().valid('true', 'false'),
    sort: Joi.string().valid('price', '-price', 'mealName', '-mealName', 'category').default('category')
  }),

  orderFilter: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'),
    sort: Joi.string().valid('createdAt', '-createdAt', 'totalAmount', '-totalAmount').default('-createdAt')
  })
};

// Validate query parameters (Express 5 compatible - doesn't reassign req.query)
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ApiError(400, message));
    }

    // Store validated values in req.validatedQuery instead of reassigning req.query
    req.validatedQuery = value;
    next();
  };
};
