// swaggerOptions.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation for your project',
    },
    servers: [
      {
        url: 'http://localhost:5050', // Update with your server's URL
      },
    ],
  },
  apis: ["../routes/*.ts"], // Path to the API docs
};

export default swaggerOptions;
