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

// Fix específico para Vercel - forzar la URL completa
swaggerSpec.servers = [
    {
        url: 'https://apiheroe.vercel.app',
        description: 'Servidor de producción en Vercel'
    }
];

// Configuración básica que funciona
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "SuperHeroes API Documentation",
    swaggerOptions: {
        validatorUrl: null,
        tryItOutEnabled: true,
        filter: true,
        displayOperationId: false,
        displayRequestDuration: true
    }
}));

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
