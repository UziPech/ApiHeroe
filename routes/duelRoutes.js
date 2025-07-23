import express from 'express';
import duelController from '../controllers/duelController.js';

const router = express.Router();

// Usar todas las rutas del controlador de duelos
router.use('/api', duelController);

export default router;
