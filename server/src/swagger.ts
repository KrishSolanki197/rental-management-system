import swaggerJsdoc from "swagger-jsdoc";

const option: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rental Manage System",
      version: "1.0.0",
      description: "Rental Management System API Testing & Documentation",
      
    },
    servers: [
      {
        url: "http://localhost:3000",
      },

    ],
  },

  apis: [
    "./src/modules/**/*.ts",
    "./src/routes/**/*.ts",
  ]
};

export const swaggerSpec = swaggerJsdoc(option);
