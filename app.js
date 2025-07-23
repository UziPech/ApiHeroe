import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './swaggerConfig.js';
import connectDB from './config/db.js';
import battleRoutes from './routes/battleRoutes.js';
import duelRoutes from './routes/duelRoutes.js';
import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
import userController from './controllers/userController.js';

// Conectar a MongoDB Atlas al iniciar la app
connectDB();

const app = express();

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(express.static('public'));
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
