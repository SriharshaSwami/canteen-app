import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Friendly Menu - Canteen System API',
      version: '1.0.0',
      description: 'A credit-based meal payment system for hostel mess to reduce food wastage',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            name: { type: 'string', description: 'User name' },
            email: { type: 'string', format: 'email', description: 'User email' },
            creditBalance: { type: 'number', description: 'User credit balance' },
            role: { type: 'string', enum: ['student', 'admin'], description: 'User role' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Menu item ID' },
            mealName: { type: 'string', description: 'Name of the meal' },
            price: { type: 'number', description: 'Price in credits' },
            category: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snacks'] },
            description: { type: 'string', description: 'Meal description' },
            available: { type: 'boolean', description: 'Availability status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Transaction ID' },
            userId: { type: 'string', description: 'User ID' },
            type: { type: 'string', enum: ['credit_added', 'meal_purchase'] },
            amount: { type: 'number', description: 'Transaction amount' },
            description: { type: 'string', description: 'Transaction description' },
            mealId: { type: 'string', description: 'Associated meal ID (for purchases)' },
            balanceAfter: { type: 'number', description: 'Balance after transaction' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', description: 'Error message' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', description: 'Current page' },
            limit: { type: 'integer', description: 'Items per page' },
            total: { type: 'integer', description: 'Total items' },
            totalPages: { type: 'integer', description: 'Total pages' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Menu', description: 'Menu management endpoints' },
      { name: 'Credits', description: 'Credit system endpoints' }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
