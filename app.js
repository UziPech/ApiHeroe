import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerConfig.js';
import connectDB from './config/db.js';
import battleRoutes from './routes/battleRoutes.js';
import duelRoutes from './routes/duelRoutes.js';
import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
import userController from './controllers/userController.js';

// Configurar variables de entorno
dotenv.config();

// Conectar a MongoDB Atlas al iniciar la app
connectDB();

const app = express();

// Swagger configuration
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Fix para Vercel: asegurar que la URL del servidor esté correcta
swaggerSpec.servers = [
    {
        url: 'https://apiheroe.vercel.app',
        description: 'Servidor de producción en Vercel'
    }
];

// Ruta para servir el JSON de especificación
app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(swaggerSpec);
});

// Ruta para la documentación HTML personalizada
app.get('/api-docs', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SuperHeroes API - Documentación</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api-docs-json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
    res.send(html);
});

app.use(express.json());
app.use(express.static('public'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Superhéroes funcionando correctamente',
        swagger: '/api-docs',
        endpoints: {
            heroes: '/api/heroes',
            villains: '/api/villains',
            users: '/api/users',
            battles: '/api/battles',
            duels: '/api/duels'
        }
    });
});

app.use('/api', heroController);
app.use('/api', villainController);
// Las rutas de usuarios (login y register) NO están protegidas
app.use('/api/users', userController);
// Las rutas de batallas SÍ están protegidas por el middleware en battleRoutes.js
app.use('/api/battles', battleRoutes);
// Las rutas de duelos 1v1 SÍ están protegidas por el middleware en duelRoutes.js
app.use(duelRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
});

// Export para Vercel
export default app;
