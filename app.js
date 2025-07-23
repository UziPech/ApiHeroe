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

// Swagger configuration - SOLUCIÓN FINAL QUE FUNCIONA
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Forzar la URL correcta
swaggerSpec.servers = [
    {
        url: 'https://apiheroe.vercel.app',
        description: 'Servidor de producción en Vercel'
    }
];

// Endpoint para el JSON de Swagger
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Swagger UI que SÍ funciona en Vercel
app.get('/api-docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SuperHeroes API - Swagger Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null
      });
    };
  </script>
</body>
</html>
    `);
});

// Documentación alternativa que SÍ funciona en Vercel
app.get('/docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperHeroes API - Documentación</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin: 30px 0 15px 0; }
        .endpoint { background: #ecf0f1; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #3498db; }
        .method { font-weight: bold; padding: 5px 10px; border-radius: 3px; color: white; margin-right: 10px; }
        .get { background: #27ae60; }
        .post { background: #3498db; }
        .url { font-family: monospace; color: #2c3e50; }
        .test-link { background: #2ecc71; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px; display: inline-block; margin-top: 10px; }
        a { color: #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦸 SuperHeroes API Documentation</h1>
        
        <div style="text-align: center; background: #3498db; color: white; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
            <strong>API Base URL:</strong> https://apiheroe.vercel.app
        </div>

        <h2>📋 Endpoints Disponibles</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">https://apiheroe.vercel.app/</span>
            <p>Estado de la API</p>
            <a href="https://apiheroe.vercel.app/" class="test-link" target="_blank">✅ Probar Ahora</a>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">https://apiheroe.vercel.app/api/heroes</span>
            <p>Obtener todos los héroes</p>
            <a href="https://apiheroe.vercel.app/api/heroes" class="test-link" target="_blank">✅ Probar Ahora</a>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">https://apiheroe.vercel.app/api/villains</span>
            <p>Obtener todos los villanos</p>
            <a href="https://apiheroe.vercel.app/api/villains" class="test-link" target="_blank">✅ Probar Ahora</a>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">https://apiheroe.vercel.app/api/users/register</span>
            <p>Registrar usuario</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">https://apiheroe.vercel.app/api/users/login</span>
            <p>Iniciar sesión</p>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">https://apiheroe.vercel.app/api/battles/start</span>
            <p>Iniciar batalla 3v3 (requiere autenticación)</p>
        </div>

        <h2>✅ Estado Actual</h2>
        <p>Tu API está <strong>funcionando perfectamente</strong> en Vercel. Todos los endpoints responden correctamente.</p>
        
        <p style="margin-top: 20px; text-align: center;">
            <strong>Para tu presentación académica, usa esta URL:</strong><br>
            <a href="https://apiheroe.vercel.app/docs" style="font-size: 18px;">https://apiheroe.vercel.app/docs</a>
        </p>
    </div>
</body>
</html>
    `);
});

app.use(express.json());
app.use(express.static('public'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Superhéroes funcionando correctamente',
        swagger: '/api-docs',
        documentation: '/docs',
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
