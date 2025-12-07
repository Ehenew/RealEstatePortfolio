import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Real Estate Portfolio API',
    version: '1.0.0',
    description: 'Backend API for real estate agent portfolio',
    contact: {
      name: 'Ehenew Amogne',
      email: 'mequanintalemu@gmail.com'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000',
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
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Auth',
      description: 'Authentication endpoints'
    },
    {
      name: 'Properties',
      description: 'Property management endpoints'
    },
    {
      name: 'Content',
      description: 'Content management endpoints'
    },
    {
      name: 'Settings',
      description: 'Settings management endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    process.env.NODE_ENV === 'production' 
      ? './dist/**/*.js' 
      : './src/**/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

