// Configuración Swagger para la API de superhéroes y villanos
export default {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Superhéroes',
      version: '1.0.0',
      description: 'API para gestionar superhéroes y villanos',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
      },
    ],
  },
  apis: ['./controllers/*.js'], // Incluye todos los controladores
};
