const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swahili API Documentation',
      version: '1.0.0',
      description: 'API documentation for Swahili family Marketplace App',
      contact: {
        name: 'API Support',
        email: 'headricleonard@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.swahilifamily.com',
        description: 'Production server'
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
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Error message here']
            },
            data: {
              type: 'null',
              example: null
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: []
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] 
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs),
  swaggerSpec: specs, 
};
